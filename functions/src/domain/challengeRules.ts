// functions/src/domain/challengeRules.ts
// Herausforderungsregeln der Doppel-Pyramide
// (Portierung von js/services/doubles-challenge-validation.js)

import {findPlayerInPyramid} from "./pyramid.js";
import type {DoublesMatch, PyramidLevels} from "./types.js";

type NameOf = (playerId: string) => string;

/**
 * Alle gültigen Herausforderungsziele eines Spielers:
 * 1. gleiche Ebene, links (kleinerer Index)
 * 2. eine Ebene höher, rechts: (2j + 1) · n ≥ (2i + 1) · m
 *    (i/n = Index/Größe der eigenen Ebene, j/m = Index/Größe der oberen Ebene)
 * 3. mindestens 2 Ziele, sofern über dem Spieler genügend Plätze existieren
 */
export function getValidChallengeTargets(challengerId: string, levels: PyramidLevels): string[] {
  const pos = findPlayerInPyramid(challengerId, levels);
  if (!pos) return [];

  const {level: cLevel, index: cIndex} = pos;
  const n = levels[cLevel].length;
  const targets: string[] = levels[cLevel].slice(0, cIndex);

  if (cLevel > 0) {
    const upperLevel = levels[cLevel - 1];
    const m = upperLevel.length;

    for (let j = 0; j < m; j++) {
      if ((2 * j + 1) * n >= (2 * cIndex + 1) * m) {
        targets.push(upperLevel[j]);
      }
    }

    for (let j = 0; j < m && targets.length < 2; j++) {
      if (!targets.includes(upperLevel[j])) targets.push(upperLevel[j]);
    }
  }

  return targets;
}

/**
 * Prüft eine Herausforderung gegen die Pyramiden-Regeln.
 * Rückgabe: Begründung bei Verstoß, sonst null.
 */
export function validateDoublesChallenge(
  challengerId: string,
  challengedId: string,
  levels: PyramidLevels,
): string | null {
  if (levels.length === 0) return "Pyramide ist nicht initialisiert.";

  const challengerPos = findPlayerInPyramid(challengerId, levels);
  const challengedPos = findPlayerInPyramid(challengedId, levels);

  if (!challengerPos) return "Herausforderer ist nicht in der Pyramide.";
  if (!challengedPos) return "Herausgeforderter ist nicht in der Pyramide.";

  if (challengerPos.level < challengedPos.level) {
    return "Der Herausforderer steht über dem Herausgeforderten in der Pyramide.";
  }
  if (challengerPos.level === challengedPos.level && challengerPos.index <= challengedPos.index) {
    return "Der Herausforderer steht nicht unterhalb des Herausgeforderten.";
  }

  if (getValidChallengeTargets(challengerId, levels).includes(challengedId)) return null;

  if (challengerPos.level === challengedPos.level) {
    return "Auf gleicher Ebene darf nur nach links herausgefordert werden (kleinerer Index).";
  }
  if (challengerPos.level - challengedPos.level === 1) {
    return "Auf der übergeordneten Ebene darf nur nach rechts herausgefordert werden.";
  }
  return "Herausforderung ist nur auf gleicher Ebene (links) oder eine Ebene höher (rechts) erlaubt.";
}

/**
 * Bestimmt bei einem Doppel, wer Herausforderer (der untere Spieler) und wer
 * Herausgeforderter ist. null, wenn einer der Spieler nicht in der Pyramide steht.
 */
export function orderChallengerChallenged(
  playerA: string,
  playerB: string,
  levels: PyramidLevels,
): {challengerId: string; challengedId: string} | null {
  const posA = findPlayerInPyramid(playerA, levels);
  const posB = findPlayerInPyramid(playerB, levels);
  if (!posA || !posB) return null;

  const aIsLower = posA.level > posB.level || (posA.level === posB.level && posA.index > posB.index);
  return aIsLower ?
    {challengerId: playerA, challengedId: playerB} :
    {challengerId: playerB, challengedId: playerA};
}

/**
 * Tageslimit: Jeder Spieler darf pro Tag 1× herausfordern und 1× herausgefordert werden.
 * todaysMatches: Doppel des heutigen Tages (ohne abgelehnte), vom Aufrufer gefiltert.
 * Rückgabe: Begründung bei Verstoß, sonst null.
 */
export function checkDailyLimit(
  challengerId: string,
  challengedId: string,
  todaysMatches: DoublesMatch[],
  levels: PyramidLevels,
  nameOf: NameOf,
): string | null {
  for (const match of todaysMatches) {
    const roles = orderChallengerChallenged(match.team1.player1Id, match.team2.player1Id, levels);
    if (!roles) continue;

    if (roles.challengerId === challengerId) {
      return `${nameOf(challengerId)} hat heute bereits eine Herausforderung ausgesprochen.`;
    }
    if (roles.challengedId === challengedId) {
      return `${nameOf(challengedId)} wurde heute bereits herausgefordert.`;
    }
  }
  return null;
}

/**
 * Pyramiden-Regeln + Tageslimit zusammen (wie checkChallengeValidation im Client).
 * Rückgabe: erste Begründung bei Verstoß, sonst null.
 */
export function findChallengeViolation(
  challengerId: string,
  challengedId: string,
  levels: PyramidLevels,
  todaysMatches: DoublesMatch[],
  nameOf: NameOf,
): string | null {
  return validateDoublesChallenge(challengerId, challengedId, levels) ??
    checkDailyLimit(challengerId, challengedId, todaysMatches, levels, nameOf);
}
