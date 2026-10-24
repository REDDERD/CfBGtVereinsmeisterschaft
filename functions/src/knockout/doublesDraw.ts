// functions/src/knockout/doublesDraw.ts
// Partner-Auslosung der Doppel-K.O.-Phase (nur Admin) – Roadmap P2, noch Stubs
// Ersetzt: Auslosung/Zuordnung in js/services/doubles-knockout-service.js

import {onCall} from "firebase-functions/https";
import type {DoublesKnockoutRound, TeamSlot} from "../domain/doublesKnockout.js";
import {requireAdmin} from "../lib/auth.js";
import {notImplemented} from "../lib/errors.js";

export interface DrawPartnerPayload {
  round: DoublesKnockoutRound;
  matchNum: number;
  slot: TeamSlot;
}

export interface DrawPartnerResult {
  status: "ok";
  winnerId: string;
  /** Für die Slotmaschinen-Animation im Client. */
  candidateIds: string[];
}

/**
 * Ersetzt: startDoublesKnockoutPartnerDraw (bisher Math.random() im Browser)
 *
 * Umsetzung:
 * 1. Transaktion: settings/doublesKnockout, doublesKnockoutConfig, K.O.-Spiele, Spieler lesen
 * 2. Spiel darf noch kein Ergebnis haben, gesetzter Spieler muss feststehen
 * 3. domain/doublesKnockout.getPartnerCandidates(ctx, round, matchNum, slot, { forDraw: true })
 * 4. Gewinner per crypto.randomInt ziehen, draws[`${round}_${matchNum}`][slot] speichern
 * 5. { winnerId, candidateIds } zurückgeben – der Client spielt nur noch die Animation ab
 */
export const drawDoublesKnockoutPartner = onCall<DrawPartnerPayload>(async (request): Promise<DrawPartnerResult> => {
  await requireAdmin(request);
  return notImplemented("drawDoublesKnockoutPartner");
});

export interface AssignPartnerPayload extends DrawPartnerPayload {
  partnerId: string;
}

/**
 * Ersetzt: saveDoublesKnockoutManualPartner
 * Umsetzung: domain/doublesKnockout.getPartnerViolation prüfen, dann draws speichern.
 */
export const assignDoublesKnockoutPartner = onCall<AssignPartnerPayload>(async (request) => {
  await requireAdmin(request);
  return notImplemented("assignDoublesKnockoutPartner");
});

export interface SetDrawRulePayload {
  rule: "drawPoolRule" | "drawBlockActivePlayers";
  enabled: boolean;
}

/**
 * Ersetzt: setDoublesKnockoutDrawRule
 * Hinweis: Könnte auch als direkter Client-Write bleiben (Rules prüfen den Typ bereits);
 * liegt hier, damit alle Schreibzugriffe auf doublesKnockoutConfig serverseitig sind.
 */
export const setDoublesKnockoutDrawRule = onCall<SetDrawRulePayload>(async (request) => {
  await requireAdmin(request);
  return notImplemented("setDoublesKnockoutDrawRule");
});
