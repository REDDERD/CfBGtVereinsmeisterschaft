// functions/src/knockout/doublesKnockout.ts
// Doppel-K.O.-Phase: Aktivierung und Ergebnisse (nur Admin) – Roadmap P2, noch Stubs
// Ersetzt: js/services/doubles-knockout-service.js (Aktivierung, Ergebnis-Eintragung)

import {onCall} from "firebase-functions/https";
import type {DoublesKnockoutRound, TeamSlot} from "../domain/doublesKnockout.js";
import type {DoublesSet, Team} from "../domain/types.js";
import {requireAdmin} from "../lib/auth.js";
import {notImplemented} from "../lib/errors.js";

/**
 * Ersetzt: activateDoublesKnockoutPhase
 *
 * Umsetzung:
 * 1. Transaktion: readPyramid → flache Rangliste
 * 2. mindestens DOUBLES_KNOCKOUT_MIN_PLAYERS (config.ts), sonst failed-precondition
 * 3. settings/doublesKnockout = { active: true, frozenPyramid: ranking, activatedAt }
 */
export const activateDoublesKnockout = onCall(async (request) => {
  await requireAdmin(request);
  return notImplemented("activateDoublesKnockout");
});

/**
 * Ersetzt: deactivateDoublesKnockoutPhase
 * Umsetzung: in EINEM Batch settings/doublesKnockout zurücksetzen, alle Doppel
 * mit round löschen und doublesKnockoutConfig.draws entfernen.
 */
export const deactivateDoublesKnockout = onCall(async (request) => {
  await requireAdmin(request);
  return notImplemented("deactivateDoublesKnockout");
});

export interface SaveDoublesKnockoutMatchPayload {
  round: DoublesKnockoutRound;
  matchNum: number;
  team1: Team;
  team2: Team;
  /** Fehlt bei kampflosen Spielen. */
  sets?: DoublesSet[];
  /** Kampflos für dieses Team (21:0, 21:0); Partner dürfen dann fehlen. */
  walkoverWinner?: TeamSlot;
}

/**
 * Ersetzt: saveDoublesKnockoutMatch, saveDoublesKnockoutWalkover
 *
 * Umsetzung:
 * 1. DoublesKnockoutContext aufbauen (frozenPyramid, K.O.-Spiele, draws, Regeln, Spieler)
 * 2. domain/doublesKnockout.getTeams: Spieler 1 beider Teams müssen zum Bracket passen
 * 3. 4 verschiedene Spieler; domain/doublesKnockout.getPartnerViolation je Team
 * 4. Sätze: validateMatchScores bzw. Walkover-Sätze zugunsten walkoverWinner
 * 5. bestehendes Spiel (round, matchNum) aktualisieren oder anlegen
 *    (K.O.-Spiele beeinflussen die Pyramide nicht)
 */
export const saveDoublesKnockoutMatch = onCall<SaveDoublesKnockoutMatchPayload>(async (request) => {
  await requireAdmin(request);
  return notImplemented("saveDoublesKnockoutMatch");
});
