// functions/src/matches/setMatchStatus.ts
// Spiel bestätigen / ablehnen / zurücksetzen (nur Admin)
// Ersetzt: updateMatchStatus (js/services/match-service.js)

import {onCall} from "firebase-functions/https";
import {COLLECTIONS} from "../config.js";
import {effectiveStatus} from "../domain/matchStatus.js";
import {fromDoublesSets, winnerSide} from "../domain/sets.js";
import type {MatchStatus, Warning} from "../domain/types.js";
import {applyDoublesResult, readPyramid} from "../pyramid/pyramidRepository.js";
import {requireAdmin} from "../lib/auth.js";
import {toDoublesMatch} from "../lib/data.js";
import {fail, needsConfirmation, ok} from "../lib/errors.js";
import {db, FieldValue} from "../lib/firebase.js";
import {asPayload, optionalBoolean, requireEnum, requireId} from "../lib/input.js";
import {getActiveSeason, seasonCol} from "../lib/season.js";

const STATUSES: readonly MatchStatus[] = ["confirmed", "unconfirmed", "rejected"];
/** "knockout" = Einzel-K.O.-Spiel (liegt ebenfalls in singlesMatches). */
const STATUS_MATCH_TYPES = ["singles", "knockout", "doubles"] as const;

/**
 * Payload: { matchType: "singles" | "knockout" | "doubles", matchId, status, acknowledgeWarnings? }
 *
 * Wird ein Pyramiden-Doppel (ohne round) bestätigt, wird das Ergebnis in derselben
 * Transaktion auf die Pyramide angewendet – genau einmal (Feld pyramidApplied).
 */
export const setMatchStatus = onCall(async (request) => {
  await requireAdmin(request);
  const data = asPayload(request.data);
  const matchType = requireEnum(data, "matchType", STATUS_MATCH_TYPES);
  const matchId = requireId(data, "matchId");
  const newStatus = requireEnum(data, "status", STATUSES);
  const acknowledged = optionalBoolean(data, "acknowledgeWarnings");

  const year = await getActiveSeason();
  const col = seasonCol(year, matchType === "doubles" ? COLLECTIONS.doublesMatches : COLLECTIONS.singlesMatches);
  const matchRef = col.doc(matchId);

  return db.runTransaction(async (tx) => {
    // --- Reads ---
    const matchDoc = await tx.get(matchRef);
    if (!matchDoc.exists) fail("not-found", "Spiel nicht gefunden.");

    const oldStatus = effectiveStatus(matchDoc.get("status"));
    const date = matchDoc.get("date");
    const warnings: Warning[] = [];

    if (newStatus === "confirmed" && oldStatus === "unconfirmed" && date) {
      // Unbestätigte Spiele sind wenige → im Speicher filtern statt Composite-Index
      const unconfirmed = await tx.get(col.where("status", "==", "unconfirmed"));
      const hasOlder = unconfirmed.docs.some((d) => d.id !== matchId && d.get("date")?.toMillis() < date.toMillis());
      if (hasOlder) {
        warnings.push({
          code: "OLDER_UNCONFIRMED",
          title: "Älteres offenes Spiel vorhanden",
          message: `Es gibt ein älteres offenes ${matchType === "doubles" ? "Doppel" : "Einzel"}-Spiel. ` +
            "Bitte bestätige dieses zuerst. Möchtest du trotzdem fortfahren?",
        });
      }
    }

    const match = matchType === "doubles" ? toDoublesMatch(matchDoc) : null;
    const applyToPyramid = !!match && !match.round && !match.pyramidApplied &&
      newStatus === "confirmed" && oldStatus !== "confirmed";
    const pyramid = applyToPyramid ? await readPyramid(tx, year) : null;

    const confirmation = needsConfirmation(warnings, acknowledged);
    if (confirmation) return confirmation;

    // --- Writes ---
    tx.update(matchRef, {
      status: newStatus,
      statusChangedAt: FieldValue.serverTimestamp(),
      ...(applyToPyramid ? {pyramidApplied: true} : {}),
    });

    let pyramidChanged = false;
    if (match && pyramid) {
      const [winner, loser] = winnerSide(fromDoublesSets(match.sets)) === 1 ?
        [match.team1, match.team2] : [match.team2, match.team1];
      pyramidChanged = applyDoublesResult(tx, pyramid, winner.player1Id, loser.player1Id);
    }

    return ok({pyramidChanged});
  });
});
