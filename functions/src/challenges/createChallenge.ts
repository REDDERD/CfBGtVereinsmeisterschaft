// functions/src/challenges/createChallenge.ts
// Doppel-Herausforderung anlegen
// Ersetzt: addChallenge (js/services/challenge-service.js)

import {onCall} from "firebase-functions/https";
import {COLLECTIONS} from "../config.js";
import type {Warning} from "../domain/types.js";
import {checkChallengeRules} from "../matches/shared.js";
import {readPyramid} from "../pyramid/pyramidRepository.js";
import {requireAuth} from "../lib/auth.js";
import {loadPlayers, loadTodaysDoublesMatches, nameLookup} from "../lib/data.js";
import {fail, needsConfirmation, ok} from "../lib/errors.js";
import {db, FieldValue, Timestamp} from "../lib/firebase.js";
import {asPayload, optionalBoolean, requireDateString, requireId} from "../lib/input.js";
import {getActiveSeason, seasonCol} from "../lib/season.js";
import {loadSettings} from "../lib/settings.js";
import {dayKey} from "../lib/time.js";

/**
 * Payload: { challengerId, challengedId, date: "YYYY-MM-DD", acknowledgeWarnings? }
 * Prüft Pyramiden-Regeln und Tageslimit gemäß doublesValidation.mode.
 */
export const createChallenge = onCall(async (request) => {
  const caller = await requireAuth(request);
  const data = asPayload(request.data);
  const challengerId = requireId(data, "challengerId");
  const challengedId = requireId(data, "challengedId");
  const date = requireDateString(data, "date");
  const acknowledged = optionalBoolean(data, "acknowledgeWarnings");

  if (challengerId === challengedId) {
    fail("invalid-argument", "Herausforderer und Herausgeforderter müssen unterschiedlich sein.");
  }
  if (date.dayKey < dayKey()) fail("invalid-argument", "Das Datum darf nicht in der Vergangenheit liegen.");

  const [year, settings] = await Promise.all([getActiveSeason(), loadSettings()]);
  const players = await loadPlayers(year, [challengerId, challengedId]);

  // Transaktion nur für einen konsistenten Lesestand von Pyramide und Tagesspielen
  const {levels, todaysMatches} = await db.runTransaction(async (tx) => ({
    levels: (await readPyramid(tx, year)).levels,
    todaysMatches: await loadTodaysDoublesMatches(tx, year),
  }), {readOnly: true});

  const warnings: Warning[] = [];
  checkChallengeRules(
    challengerId, challengedId, levels, todaysMatches,
    settings.doublesValidationMode, caller.isAdmin, nameLookup(players), warnings,
  );
  const confirmation = needsConfirmation(warnings, acknowledged);
  if (confirmation) return confirmation;

  const ref = await seasonCol(year, COLLECTIONS.challenges).add({
    challengerId,
    challengedId,
    date: Timestamp.fromDate(date.date),
    status: "pending",
    createdAt: FieldValue.serverTimestamp(),
    createdBy: caller.uid,
  });
  return ok({challengeId: ref.id});
});
