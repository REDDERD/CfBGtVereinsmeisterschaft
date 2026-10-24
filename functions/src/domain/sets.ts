// functions/src/domain/sets.ts
// Badminton-Satzregeln (Portierung von js/utils/validation.js)

import type {DoublesSet, SetScore, SinglesSet} from "./types.js";

/** Kampflos: 21:0, 21:0 für Seite 1. */
export const WALKOVER_SCORES: SetScore[] = [[21, 0], [21, 0]];

/**
 * Gültiger Satz: 21 mit ≥ 2 Punkten Vorsprung, Verlängerung bis 30 mit
 * genau 2 Punkten Vorsprung, bei 30:29 entscheidet der 30. Punkt.
 */
export function validateSet(a: number, b: number): boolean {
  if (!Number.isInteger(a) || !Number.isInteger(b)) return false;
  if (a < 0 || b < 0 || a === b) return false;

  const high = Math.max(a, b);
  const low = Math.min(a, b);

  if (high === 21 && low <= 19) return true;
  if (high >= 21 && high <= 30 && high - low === 2) return true;
  if (high === 30 && low === 29) return true;
  return false;
}

/**
 * Prüft ein komplettes Spiel (2 oder 3 Sätze).
 * Rückgabe: deutsche Fehlermeldung oder null, wenn gültig.
 */
export function validateMatchScores(scores: SetScore[]): string | null {
  if (scores.length < 2 || scores.length > 3) {
    return "Ein Spiel besteht aus 2 oder 3 Sätzen";
  }

  const [set1, set2, set3] = scores;
  if (!validateSet(...set1) || !validateSet(...set2)) {
    return "Ungültige Satz-Ergebnisse in Satz 1 oder 2";
  }

  const set1Winner = set1[0] > set1[1] ? 1 : 2;
  const set2Winner = set2[0] > set2[1] ? 1 : 2;

  if (set1Winner === set2Winner) {
    if (set3) return "Dritter Satz nicht erlaubt (Spielstand bereits 2:0)";
    return null;
  }

  if (!set3) return "Dritter Satz ist erforderlich (Spielstand 1:1)";
  if (!validateSet(...set3)) return "Ungültiges Satz-Ergebnis in Satz 3";
  return null;
}

export function setsWon(scores: SetScore[]): {side1: number; side2: number} {
  let side1 = 0;
  let side2 = 0;
  for (const [a, b] of scores) {
    if (a > b) side1++;
    else side2++;
  }
  return {side1, side2};
}

/** Gewinnende Seite (1 oder 2). */
export function winnerSide(scores: SetScore[]): 1 | 2 {
  const {side1, side2} = setsWon(scores);
  return side1 > side2 ? 1 : 2;
}

// ========== Umwandlung zwischen Firestore-Format und SetScore ==========

export function toSinglesSets(scores: SetScore[]): SinglesSet[] {
  return scores.map(([p1, p2]) => ({p1, p2}));
}

export function toDoublesSets(scores: SetScore[]): DoublesSet[] {
  return scores.map(([t1, t2]) => ({t1, t2}));
}

export function fromSinglesSets(sets: SinglesSet[]): SetScore[] {
  return sets.map((s) => [s.p1, s.p2]);
}

export function fromDoublesSets(sets: DoublesSet[]): SetScore[] {
  return sets.map((s) => [s.t1, s.t2]);
}
