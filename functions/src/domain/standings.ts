// functions/src/domain/standings.ts
// Gruppentabelle Einzel (Portierung von calculateStandings aus js/utils/calculations.js)
// Grundlage für das Einfrieren der Tabellen beim Start der K.O.-Phase.

import {effectiveStatus} from "./matchStatus.js";
import type {Player, SinglesGroup, SinglesMatch} from "./types.js";

export interface StandingsRow {
  id: string;
  name: string;
  matches: number;
  points: number;
  setsWon: number;
  setsLost: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDiff: number;
  totalGames: number;
}

/**
 * Punkte: 2:0-Sieg 3, 2:1-Sieg 2, 1:2-Niederlage 1, 0:2-Niederlage 0.
 * Sortierung: Punkte, Satzdifferenz, Punktedifferenz.
 * Nur bestätigte Spiele zählen.
 */
export function calculateStandings(
  players: Player[],
  matches: SinglesMatch[],
  group: SinglesGroup,
): StandingsRow[] {
  const groupPlayers = players.filter((p) => p.singlesGroup === group);
  const totalGames = (groupPlayers.length - 1) * 2;

  const stats = new Map<string, StandingsRow>();
  for (const p of groupPlayers) {
    stats.set(p.id, {
      id: p.id,
      name: p.name,
      matches: 0,
      points: 0,
      setsWon: 0,
      setsLost: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      pointDiff: 0,
      totalGames,
    });
  }

  for (const match of matches) {
    if (!match.sets || effectiveStatus(match.status) !== "confirmed") continue;

    const s1 = stats.get(match.player1Id);
    const s2 = stats.get(match.player2Id);
    if (!s1 || !s2) continue;

    let p1Sets = 0;
    let p2Sets = 0;
    for (const set of match.sets) {
      s1.pointsFor += set.p1;
      s1.pointsAgainst += set.p2;
      s2.pointsFor += set.p2;
      s2.pointsAgainst += set.p1;
      if (set.p1 > set.p2) p1Sets++;
      else p2Sets++;
    }

    s1.matches++;
    s2.matches++;
    s1.setsWon += p1Sets;
    s1.setsLost += p2Sets;
    s2.setsWon += p2Sets;
    s2.setsLost += p1Sets;

    const [winner, loser, loserSets] = p1Sets > p2Sets ? [s1, s2, p2Sets] : [s2, s1, p1Sets];
    winner.points += loserSets === 0 ? 3 : 2;
    loser.points += loserSets === 1 ? 1 : 0;
  }

  return [...stats.values()]
    .map((row) => ({...row, pointDiff: row.pointsFor - row.pointsAgainst}))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const setDiff = (b.setsWon - b.setsLost) - (a.setsWon - a.setsLost);
      if (setDiff !== 0) return setDiff;
      return b.pointDiff - a.pointDiff;
    });
}
