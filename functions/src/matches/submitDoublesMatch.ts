// functions/src/matches/submitDoublesMatch.ts
// Pyramiden-Doppel eintragen
// Ersetzt: addDoublesMatch + updatePyramidAfterChallenge (js/services/match-service.js)
//
// In einer Transaktion: Spiel anlegen, optional Herausforderung abschließen und –
// wenn das Spiel direkt bestätigt ist – die Pyramide anpassen. Damit funktioniert
// das Pyramiden-Update auch für QR-Login-Nutzer (bisher an den Rules gescheitert).

import {onCall} from "firebase-functions/https";
import {COLLECTIONS} from "../config.js";
import {defaultMatchStatus} from "../domain/matchStatus.js";
import {toDoublesSets, validateMatchScores, winnerSide} from "../domain/sets.js";
import type {Warning} from "../domain/types.js";
import {applyDoublesResult, readPyramid} from "../pyramid/pyramidRepository.js";
import {requireAuth} from "../lib/auth.js";
import {loadPlayers, loadTodaysDoublesMatches, nameLookup, toChallenge} from "../lib/data.js";
import {fail, needsConfirmation, ok} from "../lib/errors.js";
import {db, FieldValue} from "../lib/firebase.js";
import {asPayload, optionalBoolean, optionalId, parseDoublesSets, requireId, requireObject} from "../lib/input.js";
import {getActiveSeason, seasonCol} from "../lib/season.js";
import {loadSettings} from "../lib/settings.js";
import {checkDoublesChallengeRules, teamPoolViolation} from "./shared.js";

/**
 * Payload: {
 *   team1: { player1Id, player2Id }, team2: { player1Id, player2Id },
 *   sets: [{ t1, t2 }, ...],
 *   challengeId?: offene Herausforderung zwischen den beiden Spielern 1, die abgeschlossen wird,
 *   acknowledgeWarnings?
 * }
 * Antwort: { status: "ok", matchId, matchStatus, pyramidChanged } | { status: "needs-confirmation", warnings }
 */
export const submitDoublesMatch = onCall(async (request) => {
  const caller = await requireAuth(request);
  const data = asPayload(request.data);
  const team1 = requireObject(data, "team1");
  const team2 = requireObject(data, "team2");
  const t1p1 = requireId(team1, "player1Id");
  const t1p2 = requireId(team1, "player2Id");
  const t2p1 = requireId(team2, "player1Id");
  const t2p2 = requireId(team2, "player2Id");
  const scores = parseDoublesSets(data);
  const challengeId = optionalId(data, "challengeId");
  const acknowledged = optionalBoolean(data, "acknowledgeWarnings");

  if (new Set([t1p1, t1p2, t2p1, t2p2]).size !== 4) {
    fail("invalid-argument", "Ein Spieler kann nicht in beiden Teams spielen. Bitte wähle 4 verschiedene Spieler aus.");
  }
  const setsError = validateMatchScores(scores);
  if (setsError) fail("invalid-argument", setsError);

  const [year, settings] = await Promise.all([getActiveSeason(), loadSettings()]);
  if (settings.doublesKnockoutActive) {
    fail("failed-precondition", "Die Doppel-K.O.-Phase läuft – neue Pyramiden-Spiele sind nicht mehr möglich.");
  }

  const players = await loadPlayers(year, [t1p1, t1p2, t2p1, t2p2]);
  const poolError =
    teamPoolViolation(players.get(t1p1)!, players.get(t1p2)!, "Team 1") ??
    teamPoolViolation(players.get(t2p1)!, players.get(t2p2)!, "Team 2");
  if (poolError) fail("invalid-argument", poolError);

  const matchStatus = defaultMatchStatus("doubles", caller.isAdmin, settings.matchStatus);
  const matchRef = seasonCol(year, COLLECTIONS.doublesMatches).doc();
  const challengeRef = challengeId ? seasonCol(year, COLLECTIONS.challenges).doc(challengeId) : null;

  return db.runTransaction(async (tx) => {
    // --- Reads ---
    const pyramid = await readPyramid(tx, year);
    const todaysMatches = await loadTodaysDoublesMatches(tx, year);
    const challengeDoc = challengeRef ? await tx.get(challengeRef) : null;

    if (challengeDoc) {
      if (!challengeDoc.exists) fail("not-found", "Herausforderung nicht gefunden.");
      const challenge = toChallenge(challengeDoc);
      const pair = [challenge.challengerId, challenge.challengedId];
      if (challenge.status !== "pending") fail("failed-precondition", "Die Herausforderung ist nicht mehr offen.");
      if (!pair.includes(t1p1) || !pair.includes(t2p1)) {
        fail("invalid-argument", "Die Herausforderung passt nicht zu den eingetragenen Spielern.");
      }
    }

    // --- Regeln ---
    const warnings: Warning[] = [];
    checkDoublesChallengeRules(
      t1p1, t2p1, pyramid.levels, todaysMatches,
      settings.doublesValidationMode, caller.isAdmin, nameLookup(players), warnings,
    );
    const confirmation = needsConfirmation(warnings, acknowledged);
    if (confirmation) return confirmation;

    // --- Writes ---
    const confirmed = matchStatus === "confirmed";
    tx.create(matchRef, {
      team1: {player1Id: t1p1, player2Id: t1p2},
      team2: {player1Id: t2p1, player2Id: t2p2},
      sets: toDoublesSets(scores),
      status: matchStatus,
      pyramidApplied: confirmed,
      date: FieldValue.serverTimestamp(),
      createdBy: caller.uid,
    });

    if (challengeRef) {
      tx.update(challengeRef, {status: "completed", completedAt: FieldValue.serverTimestamp()});
    }

    let pyramidChanged = false;
    if (confirmed) {
      const [winnerId, loserId] = winnerSide(scores) === 1 ? [t1p1, t2p1] : [t2p1, t1p1];
      pyramidChanged = applyDoublesResult(tx, pyramid, winnerId, loserId);
    }

    return ok({matchId: matchRef.id, matchStatus, pyramidChanged});
  });
});
