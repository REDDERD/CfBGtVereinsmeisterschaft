// functions/src/pyramid/pyramidRepository.ts
// Lesen/Schreiben von seasons/{year}/pyramid/current – ausschließlich in Transaktionen.
//
// Firestore-Transaktionen verlangen: erst alle Reads, dann alle Writes.
// Deshalb liest readPyramid() vorab, und die Schreibfunktionen arbeiten nur
// noch mit dem bereits gelesenen Stand.

import type {Transaction} from "firebase-admin/firestore";
import {buildPyramidLevels, flattenPyramidLevels, moveWinnerAbove, pyramidLevelsToArray} from "../domain/pyramid.js";
import type {PyramidLevels} from "../domain/types.js";
import {FieldValue} from "../lib/firebase.js";
import {pyramidRef} from "../lib/season.js";

export interface PyramidState {
  year: number;
  exists: boolean;
  levels: PyramidLevels;
  positions: string[];
}

export async function readPyramid(tx: Transaction, year: number): Promise<PyramidState> {
  const doc = await tx.get(pyramidRef(year));
  const levels = pyramidLevelsToArray(doc.data());
  return {year, exists: doc.exists, levels, positions: flattenPyramidLevels(levels)};
}

/** Ersetzt das Dokument komplett (überzählige levelN-Felder verschwinden). */
export function writePyramid(tx: Transaction, year: number, positions: string[]): void {
  tx.set(pyramidRef(year), {
    ...buildPyramidLevels(positions),
    lastUpdated: FieldValue.serverTimestamp(),
  });
}

/**
 * Wendet ein bestätigtes Pyramiden-Doppel an: Der Gewinner (Spieler 1 seines
 * Teams) übernimmt den Platz des Verlierers, falls er unter ihm stand.
 * Rückgabe: true, wenn sich die Pyramide geändert hat.
 */
export function applyDoublesResult(
  tx: Transaction,
  pyramid: PyramidState,
  winnerId: string,
  loserId: string,
): boolean {
  if (!pyramid.exists) return false;
  const positions = moveWinnerAbove(pyramid.positions, winnerId, loserId);
  if (!positions) return false;
  writePyramid(tx, pyramid.year, positions);
  return true;
}
