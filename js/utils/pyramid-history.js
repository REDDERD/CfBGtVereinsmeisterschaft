// js/utils/pyramid-history.js
// Reconstructs doubles pyramid position history by replaying confirmed matches

function buildPyramidHistory() {
  const doublesPlayers = state.players
    .filter(p => p.doublesPool && p.doublesStartingPosition)
    .sort((a, b) => a.doublesStartingPosition - b.doublesStartingPosition);

  if (doublesPlayers.length === 0) return [];

  // Build initial flat positions from doublesStartingPosition (1-based)
  const maxPos = Math.max(...doublesPlayers.map(p => p.doublesStartingPosition));
  const initial = new Array(maxPos).fill(null);
  doublesPlayers.forEach(p => { initial[p.doublesStartingPosition - 1] = p.id; });
  let flatPositions = initial.filter(id => id !== null);

  const confirmedMatches = state.doublesMatches
    .filter(m => (m.status || 'confirmed') === 'confirmed' && m.team1 && m.team2 && m.sets)
    .sort((a, b) => (a.date?.seconds || 0) - (b.date?.seconds || 0));

  if (confirmedMatches.length === 0) return [];

  const firstMatchDate = confirmedMatches[0].date?.toDate
    ? confirmedMatches[0].date.toDate()
    : new Date((confirmedMatches[0].date?.seconds || 0) * 1000);

  const history = [{ date: firstMatchDate, positions: [...flatPositions] }];

  confirmedMatches.forEach(match => {
    let t1Sets = 0, t2Sets = 0;
    match.sets.forEach(s => { (s.t1 ?? s.p1) > (s.t2 ?? s.p2) ? t1Sets++ : t2Sets++; });
    const winnerId = t1Sets > t2Sets ? match.team1.player1Id : match.team2.player1Id;
    const loserId  = t1Sets > t2Sets ? match.team2.player1Id : match.team1.player1Id;

    const winnerPos = flatPositions.indexOf(winnerId);
    const loserPos  = flatPositions.indexOf(loserId);
    if (winnerPos === -1 || loserPos === -1) return;

    if (winnerPos > loserPos) {
      flatPositions.splice(winnerPos, 1);
      flatPositions.splice(loserPos, 0, winnerId);
    }

    const date = match.date?.toDate ? match.date.toDate() : new Date((match.date?.seconds || 0) * 1000);
    history.push({ date, positions: [...flatPositions] });
  });

  return history;
}
