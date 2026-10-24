// functions/src/matches/editMatch.ts
// Ergebnis korrigieren / Spiel löschen (nur Admin)
// Ersetzt: saveSinglesMatchEdit, saveDoublesMatchEdit, deleteSinglesMatch,
//          deleteDoublesMatch (js/handlers/match-edit-handlers.js)
//
// Die Pyramide wird – wie bisher – bei Korrekturen und Löschungen NICHT
// automatisch angepasst; der Admin wird bei einem Gewinnerwechsel darauf hingewiesen.

import {onCall} from "firebase-functions/https";
import {COLLECTIONS} from "../config.js";
import {fromDoublesSets, toDoublesSets, toSinglesSets, validateMatchScores, winnerSide} from "../domain/sets.js";
import type {Warning} from "../domain/types.js";
import {requireAdmin} from "../lib/auth.js";
import {toDoublesMatch} from "../lib/data.js";
import {fail, needsConfirmation, ok} from "../lib/errors.js";
import {FieldValue} from "../lib/firebase.js";
import {asPayload, optionalBoolean, parseDoublesSets, parseSinglesSets, requireEnum, requireId} from "../lib/input.js";
import {getActiveSeason, seasonCol} from "../lib/season.js";
import {MATCH_TYPES} from "./shared.js";

function matchCollection(year: number, matchType: (typeof MATCH_TYPES)[number]) {
  return seasonCol(year, matchType === "doubles" ? COLLECTIONS.doublesMatches : COLLECTIONS.singlesMatches);
}

/**
 * Payload: { matchType: "singles" | "doubles", matchId, sets, acknowledgeWarnings? }
 * sets im Firestore-Format des Typs ([{ p1, p2 }] bzw. [{ t1, t2 }]).
 */
export const editMatch = onCall(async (request) => {
  await requireAdmin(request);
  const data = asPayload(request.data);
  const matchType = requireEnum(data, "matchType", MATCH_TYPES);
  const matchId = requireId(data, "matchId");
  const scores = matchType === "doubles" ? parseDoublesSets(data) : parseSinglesSets(data);
  const acknowledged = optionalBoolean(data, "acknowledgeWarnings");

  const setsError = validateMatchScores(scores);
  if (setsError) fail("invalid-argument", setsError);

  const matchRef = matchCollection(await getActiveSeason(), matchType).doc(matchId);
  const matchDoc = await matchRef.get();
  if (!matchDoc.exists) fail("not-found", "Spiel nicht gefunden.");

  const warnings: Warning[] = [];
  if (matchType === "doubles") {
    const match = toDoublesMatch(matchDoc);
    if (!match.round && winnerSide(fromDoublesSets(match.sets ?? [])) !== winnerSide(scores)) {
      warnings.push({
        code: "WINNER_CHANGED",
        title: "Warnung: Gewinner hat sich geändert",
        message: "Der Gewinner dieses Spiels hat sich geändert. Bitte beachte, dass die Rangfolge in " +
          "der Pyramide NICHT automatisch nachträglich geändert wird. Dies muss manuell durch einen " +
          "Admin in der Pyramide vorgenommen werden.",
      });
    }
  }

  const confirmation = needsConfirmation(warnings, acknowledged);
  if (confirmation) return confirmation;

  await matchRef.update({
    sets: matchType === "doubles" ? toDoublesSets(scores) : toSinglesSets(scores),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return ok({});
});

/** Payload: { matchType: "singles" | "doubles", matchId } */
export const deleteMatch = onCall(async (request) => {
  await requireAdmin(request);
  const data = asPayload(request.data);
  const matchType = requireEnum(data, "matchType", MATCH_TYPES);
  const matchId = requireId(data, "matchId");

  const matchRef = matchCollection(await getActiveSeason(), matchType).doc(matchId);
  const matchDoc = await matchRef.get();
  if (!matchDoc.exists) fail("not-found", "Spiel nicht gefunden.");

  await matchRef.delete();
  return ok({});
});
