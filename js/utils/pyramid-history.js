// js/utils/pyramid-history.js
// Reconstructs doubles pyramid position history by replaying confirmed matches.
// Produces exactly one entry per day (end-of-day state).

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

  const byDay = new Map();
  confirmedMatches.forEach(match => {
    const d = match.date?.toDate ? match.date.toDate() : new Date((match.date?.seconds || 0) * 1000);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key).push(match);
  });

  const history = [];
  byDay.forEach((dayMatches, key) => {
    dayMatches.forEach(match => {
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
    });

    history.push({ date: new Date(key), positions: [...flatPositions] });
  });

  return history;
}

// Tagesgenaue Pyramiden-Statistik je Spieler: Ø-Position und Tage auf Platz 1.
// Zeitraum: erster Spieltag bis heute bzw. bis zum Start der Doppel-K.O.-Phase
// (danach ist die Pyramide eingefroren).
function buildPyramidPositionStats() {
  const history = buildPyramidHistory();
  if (history.length === 0) return [];

  const toDayDate = d =>
    new Date(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  const DAY_MS = 24 * 60 * 60 * 1000;

  const koStart = state.doublesKnockoutPhaseActive ? state.doublesKnockoutActivatedAt : null;
  let endDay = toDayDate(koStart || new Date());
  const lastSnapshotDay = history[history.length - 1].date;
  if (endDay < lastSnapshotDay) endDay = lastSnapshotDay;

  const stats = {};
  history.forEach((snapshot, i) => {
    const nextDay = i + 1 < history.length ? history[i + 1].date : new Date(endDay.getTime() + DAY_MS);
    const days = Math.round((nextDay - snapshot.date) / DAY_MS);
    if (days <= 0) return;

    snapshot.positions.forEach((playerId, idx) => {
      if (!stats[playerId]) stats[playerId] = { id: playerId, positionDays: 0, days: 0, daysAtTop: 0 };
      stats[playerId].positionDays += (idx + 1) * days;
      stats[playerId].days += days;
      if (idx === 0) stats[playerId].daysAtTop += days;
    });
  });

  return Object.values(stats).map(s => ({ ...s, avgPosition: s.positionDays / s.days }));
}
