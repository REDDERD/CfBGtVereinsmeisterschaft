// functions/src/knockout/singlesKnockout.ts
// Einzel-K.O.-Phase (nur Admin) – Roadmap P2, noch Stubs
// Ersetzt: js/services/knockout-service.js

import {onCall} from "firebase-functions/https";
import type {SinglesSet} from "../domain/types.js";
import {requireAdmin} from "../lib/auth.js";
import {notImplemented} from "../lib/errors.js";

/**
 * Ersetzt: activateKnockoutPhase
 *
 * Umsetzung:
 * 1. loadAllPlayers + alle singlesMatches der Saison laden
 * 2. domain/standings.calculateStandings(players, matches, 1 | 2) – serverseitig
 * 3. settings/knockout = { active: true, frozenStandings: { group1, group2 }, activatedAt }
 */
export const activateKnockout = onCall(async (request) => {
  await requireAdmin(request);
  return notImplemented("activateKnockout");
});

/**
 * Ersetzt: deactivateKnockoutPhase
 *
 * Umsetzung: in EINEM Batch settings/knockout zurücksetzen und alle Einzel mit
 * round ∉ { group1, group2 } löschen (bisher Löschschleife im Client).
 */
export const deactivateKnockout = onCall(async (request) => {
  await requireAdmin(request);
  return notImplemented("deactivateKnockout");
});

export interface SaveKnockoutConfigPayload {
  /** qf_1_p1 … qf_4_p2 → Spieler-ID */
  pairings: Record<string, string>;
}

/**
 * Ersetzt: saveKnockoutConfig
 * Umsetzung: Schlüssel gegen /^qf_[1-4]_p[12]$/ prüfen, Spieler existieren, keine Doppelungen.
 */
export const saveKnockoutConfig = onCall<SaveKnockoutConfigPayload>(async (request) => {
  await requireAdmin(request);
  return notImplemented("saveKnockoutConfig");
});

export interface SaveKnockoutMatchPayload {
  round: "quarter" | "semi" | "thirdPlace" | "final";
  matchNum: number;
  player1Id: string;
  player2Id: string;
  sets: SinglesSet[];
}

/**
 * Ersetzt: saveKnockoutMatch
 *
 * Umsetzung:
 * 1. domain/sets.validateMatchScores
 * 2. Spieler gegen Bracket (knockoutConfig bzw. Gewinner der Vorrunde) prüfen
 * 3. bestehendes Spiel (round, matchNum) aktualisieren oder neu anlegen,
 *    Status via domain/matchStatus.defaultMatchStatus("singles", ...)
 * 4. checkCanCancelMatch aus dem Client serverseitig für Korrekturen übernehmen
 */
export const saveKnockoutMatch = onCall<SaveKnockoutMatchPayload>(async (request) => {
  await requireAdmin(request);
  return notImplemented("saveKnockoutMatch");
});
