// functions/src/matches/submitWalkover.ts
// Kampflose Spiele (nur Admin)
// Ersetzt: addSinglesWalkover, addDoublesWalkover (js/services/match-service.js)

import {onCall} from "firebase-functions/https";
import {COLLECTIONS} from "../config.js";
import {toDoublesSets, toSinglesSets, WALKOVER_SCORES} from "../domain/sets.js";
import type {Warning} from "../domain/types.js";
import {applyDoublesResult, readPyramid} from "../pyramid/pyramidRepository.js";
import {requireAdmin} from "../lib/auth.js";
import {loadPlayers, loadTodaysDoublesMatches, nameLookup} from "../lib/data.js";
import {fail, needsConfirmation, ok} from "../lib/errors.js";
import {db, FieldValue} from "../lib/firebase.js";
import {asPayload, optionalBoolean, requireEnum, requireId} from "../lib/input.js";
import {getActiveSeason, seasonCol} from "../lib/season.js";
import {loadSettings} from "../lib/settings.js";
import {checkDoublesChallengeRules, checkSinglesRules, MATCH_TYPES} from "./shared.js";

/**
 * Payload: { matchType: "singles" | "doubles", winnerId, loserId, acknowledgeWarnings? }
 * Gewertet wird 21:0, 21:0 für den Gewinner, Status immer "confirmed".
 * Im Doppel wird nur Spieler 1 je Team gespeichert und die Pyramide sofort angepasst.
 */
export const submitWalkover = onCall(async (request) => {
  const caller = await requireAdmin(request);
  const data = asPayload(request.data);
  const matchType = requireEnum(data, "matchType", MATCH_TYPES);
  const winnerId = requireId(data, "winnerId");
  const loserId = requireId(data, "loserId");
  const acknowledged = optionalBoolean(data, "acknowledgeWarnings");

  if (winnerId === loserId) fail("invalid-argument", "Gewinner und Verlierer müssen verschiedene Spieler sein.");

  const [year, settings] = await Promise.all([getActiveSeason(), loadSettings()]);
  const players = await loadPlayers(year, [winnerId, loserId]);
  const winner = players.get(winnerId)!;

  if (matchType === "singles") {
    const warnings: Warning[] = [];
    await checkSinglesRules(year, winner, players.get(loserId)!, settings.singlesValidationMode, caller.isAdmin, warnings);
    const confirmation = needsConfirmation(warnings, acknowledged);
    if (confirmation) return confirmation;

    const ref = await seasonCol(year, COLLECTIONS.singlesMatches).add({
      player1Id: winnerId,
      player2Id: loserId,
      sets: toSinglesSets(WALKOVER_SCORES),
      round: winner.singlesGroup === 1 ? "group1" : "group2",
      status: "confirmed",
      walkover: true,
      date: FieldValue.serverTimestamp(),
      createdBy: caller.uid,
    });
    return ok({matchId: ref.id, pyramidChanged: false});
  }

  if (settings.doublesKnockoutActive) {
    fail("failed-precondition", "Die Doppel-K.O.-Phase läuft – neue Pyramiden-Spiele sind nicht mehr möglich.");
  }

  const matchRef = seasonCol(year, COLLECTIONS.doublesMatches).doc();

  return db.runTransaction(async (tx) => {
    const pyramid = await readPyramid(tx, year);
    const todaysMatches = await loadTodaysDoublesMatches(tx, year);

    const warnings: Warning[] = [];
    checkDoublesChallengeRules(
      winnerId, loserId, pyramid.levels, todaysMatches,
      settings.doublesValidationMode, caller.isAdmin, nameLookup(players), warnings,
    );
    const confirmation = needsConfirmation(warnings, acknowledged);
    if (confirmation) return confirmation;

    tx.create(matchRef, {
      team1: {player1Id: winnerId, player2Id: null},
      team2: {player1Id: loserId, player2Id: null},
      sets: toDoublesSets(WALKOVER_SCORES),
      status: "confirmed",
      walkover: true,
      pyramidApplied: true,
      date: FieldValue.serverTimestamp(),
      createdBy: caller.uid,
    });
    const pyramidChanged = applyDoublesResult(tx, pyramid, winnerId, loserId);

    return ok({matchId: matchRef.id, pyramidChanged});
  });
});
