// functions/src/challenges/completeChallenge.ts
// Offene Herausforderung als erledigt markieren
// Ersetzt: markChallengeCompleted (js/services/challenge-service.js)

import {onCall} from "firebase-functions/https";
import {COLLECTIONS} from "../config.js";
import {requireAuth} from "../lib/auth.js";
import {fail, ok} from "../lib/errors.js";
import {db, FieldValue} from "../lib/firebase.js";
import {asPayload, requireId} from "../lib/input.js";
import {getActiveSeason, seasonCol} from "../lib/season.js";

/** Payload: { challengeId } – nur pending → completed. */
export const completeChallenge = onCall(async (request) => {
  await requireAuth(request);
  const challengeId = requireId(asPayload(request.data), "challengeId");
  const ref = seasonCol(await getActiveSeason(), COLLECTIONS.challenges).doc(challengeId);

  await db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    if (!doc.exists) fail("not-found", "Herausforderung nicht gefunden.");
    if (doc.get("status") !== "pending") fail("failed-precondition", "Die Herausforderung ist nicht mehr offen.");
    tx.update(ref, {status: "completed", completedAt: FieldValue.serverTimestamp()});
  });

  return ok({});
});
