// js/utils/calculations.js
// Berechnungsfunktionen für Tabellen und Statistiken

function calculateStandings(groupNum) {
  const players = getGroupPlayers(groupNum);
  const stats = {};

  players.forEach((p) => {
    stats[p.id] = {
      id: p.id,
      name: p.name,
      matches: 0,
      points: 0,
      setsWon: 0,
      setsLost: 0,
    };
  });

  state.singlesMatches.forEach((match) => {
    if (!match.sets) return;

    const p1 = match.player1Id;
    const p2 = match.player2Id;

    if (!stats[p1] || !stats[p2]) return;

    const sets = match.sets;
    let p1Sets = 0,
      p2Sets = 0;

    sets.forEach((set) => {
      if (set.p1 > set.p2) p1Sets++;
      else p2Sets++;
    });

    stats[p1].matches++;
    stats[p2].matches++;
    stats[p1].setsWon += p1Sets;
    stats[p1].setsLost += p2Sets;
    stats[p2].setsWon += p2Sets;
    stats[p2].setsLost += p1Sets;

    if (p1Sets > p2Sets) {
      stats[p1].points += p1Sets === 2 && p2Sets === 0 ? 3 : 2;
      stats[p2].points += p2Sets === 1 ? 1 : 0;
    } else {
      stats[p2].points += p2Sets === 2 && p1Sets === 0 ? 3 : 2;
      stats[p1].points += p1Sets === 1 ? 1 : 0;
    }
  });

  return Object.values(stats).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const aDiff = a.setsWon - a.setsLost;
    const bDiff = b.setsWon - b.setsLost;
    return bDiff - aDiff;
  });
}

function calculatePlayerSinglesStats(playerId) {
  const matches = state.singlesMatches.filter(
    (m) => m.player1Id === playerId || m.player2Id === playerId
  );

  let wins = 0,
    losses = 0;

  matches.forEach((match) => {
    if (!match.sets || match.sets.length < 2) return;
    let p1Sets = 0,
      p2Sets = 0;
    match.sets.forEach((set) => {
      if (set.p1 > set.p2) p1Sets++;
      else p2Sets++;
    });

    const isPlayer1 = match.player1Id === playerId;
    if ((isPlayer1 && p1Sets > p2Sets) || (!isPlayer1 && p2Sets > p1Sets)) {
      wins++;
    } else {
      losses++;
    }
  });

  return { wins, losses, matches };
}

function calculatePlayerDoublesStats(playerId) {
  const matches = state.doublesMatches.filter(
    (m) =>
      m.team1.player1Id === playerId ||
      m.team1.player2Id === playerId ||
      m.team2.player1Id === playerId ||
      m.team2.player2Id === playerId
  );

  return { matches };
}