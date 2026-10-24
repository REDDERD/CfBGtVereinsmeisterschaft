// functions/src/matches/submitSinglesMatch.ts
// Einzel-Gruppenspiel eintragen
// Ersetzt: addSinglesMatch (js/services/match-service.js),
//          submitChallengeMatch (js/events/challenge-match-entry.js)

import {onCall} from "firebase-functions/https";
import {COLLECTIONS} from "../config.js";
import {defaultMatchStatus} from "../domain/matchStatus.js";
import {toSinglesSets, validateMatchScores} from "../domain/sets.js";
import type {Warning} from "../domain/types.js";
import {requireAuth} from "../lib/auth.js";
import {loadPlayers} from "../lib/data.js";
import {fail, needsConfirmation, ok} from "../lib/errors.js";
import {FieldValue} from "../lib/firebase.js";
import {asPayload, optionalBoolean, parseSinglesSets, requireId} from "../lib/input.js";
import {getActiveSeason, seasonCol} from "../lib/season.js";
import {loadSettings} from "../lib/settings.js";
import {checkSinglesRules} from "./shared.js";

/**
 * Payload: { player1Id, player2Id, sets: [{ p1, p2 }, ...], acknowledgeWarnings? }
 * Antwort: { status: "ok", matchId, matchStatus } | { status: "needs-confirmation", warnings }
 */
export const submitSinglesMatch = onCall(async (request) => {
  const caller = await requireAuth(request);
  const data = asPayload(request.data);
  const player1Id = requireId(data, "player1Id");
  const player2Id = requireId(data, "player2Id");
  const scores = parseSinglesSets(data);
  const acknowledged = optionalBoolean(data, "acknowledgeWarnings");

  if (player1Id === player2Id) fail("invalid-argument", "Bitte zwei verschiedene Spieler auswählen.");
  const setsError = validateMatchScores(scores);
  if (setsError) fail("invalid-argument", setsError);

  const [year, settings] = await Promise.all([getActiveSeason(), loadSettings()]);
  const players = await loadPlayers(year, [player1Id, player2Id]);
  const player1 = players.get(player1Id)!;
  const player2 = players.get(player2Id)!;

  const warnings: Warning[] = [];
  await checkSinglesRules(year, player1, player2, settings.singlesValidationMode, caller.isAdmin, warnings);

  const confirmation = needsConfirmation(warnings, acknowledged);
  if (confirmation) return confirmation;

  const matchStatus = defaultMatchStatus("singles", caller.isAdmin, settings.matchStatus);
  // Wie bisher: Runde aus der Gruppe von Spieler 1
  const round = player1.singlesGroup === 1 ? "group1" : "group2";

  const ref = await seasonCol(year, COLLECTIONS.singlesMatches).add({
    player1Id,
    player2Id,
    sets: toSinglesSets(scores),
    round,
    status: matchStatus,
    date: FieldValue.serverTimestamp(),
    createdBy: caller.uid,
  });

  return ok({matchId: ref.id, matchStatus});
});
