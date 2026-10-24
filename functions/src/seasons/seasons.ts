// functions/src/seasons/seasons.ts
// Saisonverwaltung (nur Admin) – Roadmap P3, noch Stubs
// Ersetzt: js/services/season-service.js

import {onCall} from "firebase-functions/https";
import {requireAdmin} from "../lib/auth.js";
import {notImplemented} from "../lib/errors.js";

export interface CreateSeasonPayload {
  year: number;
  archiveVisible: boolean;
  /** Spieler aus der aktiven Saison übernehmen. */
  copyPlayers: boolean;
  /** Dabei Gruppen/Pools mitkopieren. */
  copyPlayerSettings: boolean;
}

/**
 * Ersetzt: createNewSeason
 *
 * Umsetzung:
 * 1. year ∈ [2020, 2099], seasons/{year} darf nicht existieren (in einer Transaktion)
 * 2. Saison-Dokument { label: `Saison ${year}`, archiveVisible, createdAt }
 * 3. optional Spieler der aktiven Saison kopieren – alles in EINEM Batch
 *    (bisher Einzel-Writes in einer Schleife)
 */
export const createSeason = onCall<CreateSeasonPayload>(async (request) => {
  await requireAdmin(request);
  return notImplemented("createSeason");
});

export interface SetActiveSeasonPayload {
  year: number;
}

/**
 * Ersetzt: changeActiveSeason
 * Umsetzung: seasons/{year} muss existieren, dann settings/activeSeason = { year }.
 */
export const setActiveSeason = onCall<SetActiveSeasonPayload>(async (request) => {
  await requireAdmin(request);
  return notImplemented("setActiveSeason");
});
