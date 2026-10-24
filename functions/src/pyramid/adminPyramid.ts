// functions/src/pyramid/adminPyramid.ts
// Pyramide initialisieren und manuell ordnen (nur Admin) – Roadmap P2, noch Stubs

import {onCall} from "firebase-functions/https";
import {requireAdmin} from "../lib/auth.js";
import {notImplemented} from "../lib/errors.js";

/**
 * Ersetzt: initPyramid (js/services/challenge-service.js)
 *
 * Umsetzung:
 * 1. loadAllPlayers(year) → Spieler mit doublesPool
 * 2. domain/pyramid.shuffle() – Zufall auf dem Server
 * 3. Transaktion: writePyramid(tx, year, positions)
 */
export const initPyramid = onCall(async (request) => {
  await requireAdmin(request);
  return notImplemented("initPyramid");
});

export interface SaveDoublesRankingPayload {
  /** Vollständige neue Rangliste, Platz 1 zuerst. */
  positions: string[];
}

/**
 * Ersetzt: saveDoublesRanking, removePlayerFromRanking (js/services/ranking-service.js)
 *
 * Umsetzung:
 * 1. positions prüfen: nur Spieler-IDs der Saison, keine Duplikate
 * 2. Transaktion: writePyramid(tx, year, positions)
 * Hinweis: Entfernte Spieler mit Doppel-Pool werden nicht automatisch wieder
 * angehängt (bisher tat das loadPyramid() beim nächsten Laden).
 */
export const saveDoublesRanking = onCall<SaveDoublesRankingPayload>(async (request) => {
  await requireAdmin(request);
  return notImplemented("saveDoublesRanking");
});
