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
      pointsFor: 0,
      pointsAgainst: 0,
    };
  });

  state.singlesMatches.forEach((match) => {
    if (!match.sets) return;

    // NUR BESTÄTIGTE SPIELE BERÜCKSICHTIGEN
    const status = match.status || 'confirmed'; // alte Spiele ohne Status als bestätigt
    if (status !== 'confirmed') return; // Überspringe unbestätigte oder abgelehnte Spiele

    const p1 = match.player1Id;
    const p2 = match.player2Id;

    if (!stats[p1] || !stats[p2]) return;

    const sets = match.sets;
    let p1Sets = 0,
      p2Sets = 0;
    let p1PointsTotal = 0,
      p2PointsTotal = 0;

    sets.forEach((set) => {
      p1PointsTotal += set.p1;
      p2PointsTotal += set.p2;
      if (set.p1 > set.p2) p1Sets++;
      else p2Sets++;
    });

    stats[p1].matches++;
    stats[p2].matches++;
    stats[p1].setsWon += p1Sets;
    stats[p1].setsLost += p2Sets;
    stats[p2].setsWon += p2Sets;
    stats[p2].setsLost += p1Sets;
    stats[p1].pointsFor += p1PointsTotal;
    stats[p1].pointsAgainst += p2PointsTotal;
    stats[p2].pointsFor += p2PointsTotal;
    stats[p2].pointsAgainst += p1PointsTotal;

    if (p1Sets > p2Sets) {
      stats[p1].points += p1Sets === 2 && p2Sets === 0 ? 3 : 2;
      stats[p2].points += p2Sets === 1 ? 1 : 0;
    } else {
      stats[p2].points += p2Sets === 2 && p1Sets === 0 ? 3 : 2;
      stats[p1].points += p1Sets === 1 ? 1 : 0;
    }
  });

  // Berechne Gesamtspiele (wie in ChallengesPage): pro Gegnerkombination 2 Spiele (Hin- und Rückspiel)
  const groupPlayers = getGroupPlayers(groupNum);
  const totalGamesPerPlayer = (groupPlayers.length - 1) * 2;

  // Sortierung: 1. Punkte, 2. Satzdifferenz, 3. Punktedifferenz
  return Object.values(stats).map(player => ({
    ...player,
    totalGames: totalGamesPerPlayer,
    pointDiff: player.pointsFor - player.pointsAgainst
  })).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const aSetDiff = a.setsWon - a.setsLost;
    const bSetDiff = b.setsWon - b.setsLost;
    if (bSetDiff !== aSetDiff) return bSetDiff - aSetDiff;
    return b.pointDiff - a.pointDiff;
  });
}

function calculatePlayerSinglesStats(playerId) {
  // NUR BESTÄTIGTE SPIELE BERÜCKSICHTIGEN
  const matches = state.singlesMatches.filter((m) => {
    const status = m.status || 'confirmed';
    return status === 'confirmed' && (m.player1Id === playerId || m.player2Id === playerId);
  });

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
  // NUR BESTÄTIGTE SPIELE BERÜCKSICHTIGEN
  const matches = state.doublesMatches.filter((m) => {
    const status = m.status || 'confirmed';
    return status === 'confirmed' && (
      m.team1.player1Id === playerId ||
      m.team1.player2Id === playerId ||
      m.team2.player1Id === playerId ||
      m.team2.player2Id === playerId
    );
  });

  return { matches };
}