// functions/src/domain/pyramid.ts
// Pyramiden-Struktur (Portierung von js/utils/pyramid.js und ranking-service.js)
//
// Gespeichert wird die Pyramide als { level1: [id], level2: [id, id], ... },
// Ebene n hat n Plätze. Intern wird meist mit der flachen Rangliste gearbeitet.

import type {PyramidLevels} from "./types.js";

/** Flache Rangliste → Firestore-Format { level1, level2, ... }. */
export function buildPyramidLevels(positions: string[]): Record<string, string[]> {
  const levels: Record<string, string[]> = {};
  let idx = 0;
  let levelNum = 1;

  while (idx < positions.length) {
    levels[`level${levelNum}`] = positions.slice(idx, idx + levelNum);
    idx += levelNum;
    levelNum++;
  }

  return levels;
}

/** Flache Rangliste → Ebenen-Array. */
export function rebuildPyramidLevels(positions: string[]): PyramidLevels {
  return Object.values(buildPyramidLevels(positions));
}

/** Firestore-Dokument → Ebenen-Array (inkl. Fallback für altes String-Format). */
export function pyramidLevelsToArray(data: Record<string, unknown> | undefined): PyramidLevels {
  if (!data) return [];

  const levels: PyramidLevels = [];
  let levelNum = 1;

  while (data[`level${levelNum}`]) {
    const levelData = data[`level${levelNum}`];
    if (Array.isArray(levelData)) {
      levels.push(levelData.map(String));
    } else if (typeof levelData === "string") {
      levels.push(levelData.split(","));
    }
    levelNum++;
  }

  return levels;
}

export function flattenPyramidLevels(levels: PyramidLevels): string[] {
  return levels.flat();
}

/** Level (0-basiert, 0 = Spitze) und Index eines Spielers. */
export function findPlayerInPyramid(
  playerId: string,
  levels: PyramidLevels,
): {level: number; index: number} | null {
  for (let level = 0; level < levels.length; level++) {
    const index = levels[level].indexOf(playerId);
    if (index !== -1) return {level, index};
  }
  return null;
}

/**
 * Pyramiden-Regel nach einem Doppel: Steht der Gewinner unter dem Verlierer,
 * nimmt er dessen Platz ein, alle dazwischen rutschen eine Position nach unten.
 * Rückgabe: neue Rangliste oder null, wenn sich nichts ändert.
 */
export function moveWinnerAbove(
  positions: string[],
  winnerId: string,
  loserId: string,
): string[] | null {
  const winnerPos = positions.indexOf(winnerId);
  const loserPos = positions.indexOf(loserId);

  if (winnerPos === -1 || loserPos === -1 || winnerPos < loserPos) return null;

  const result = [...positions];
  result.splice(winnerPos, 1);
  result.splice(loserPos, 0, winnerId);
  return result;
}

/** Hängt Spieler, die noch nicht enthalten sind, unten an. */
export function appendPlayers(positions: string[], playerIds: string[]): string[] {
  const missing = playerIds.filter((id) => !positions.includes(id));
  return missing.length > 0 ? [...positions, ...missing] : positions;
}

/** Entfernt Spieler; die Plätze darunter rücken auf. */
export function removePlayers(positions: string[], playerIds: string[]): string[] {
  return positions.filter((id) => !playerIds.includes(id));
}

/** Zufällige Reihenfolge (Fisher-Yates) – Grundlage für initPyramid. */
export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
