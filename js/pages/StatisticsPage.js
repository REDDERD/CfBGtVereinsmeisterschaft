// js/pages/StatisticsPage.js
// Statistiken-Seite - Mobile-First

function StatisticsPage() {
  return `
    <div class="space-y-4 sm:space-y-6">
      <div class="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4">Statistiken</h2>

        <div class="mb-4 flex gap-2">
          <button onclick="setStatisticsView('singles')" class="flex-1 px-3 sm:px-6 py-2.5 rounded-lg font-semibold transition-all text-sm sm:text-base ${
            state.statisticsView === "singles"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
          }">
            Einzel
          </button>
          <button onclick="setStatisticsView('doubles')" class="flex-1 px-3 sm:px-6 py-2.5 rounded-lg font-semibold transition-all text-sm sm:text-base ${
            state.statisticsView === "doubles"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
          }">
            Doppel
          </button>
        </div>

        ${state.matchesLoading ? `
          <div class="space-y-5 sm:space-y-8">
            ${[0,1,2,3].map(() => `
              <div>
                <div class="skeleton h-4 w-36 mb-3 rounded"></div>
                <div class="space-y-1.5">
                  ${[0,1,2].map(() => `
                    <div class="flex items-center gap-2 p-2 sm:p-3 rounded-lg border border-gray-200">
                      <div class="skeleton w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0"></div>
                      <div class="skeleton h-4 flex-1"></div>
                      <div class="skeleton h-4 w-16 flex-shrink-0"></div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        ` : state.statisticsView === "singles" ? renderStatisticsSingles() : renderStatisticsDoubles()}
      </div>
    </div>`;
}

function renderStatisticsSingles() {
  const confirmedMatches = state.singlesMatches.filter(m => (m.status || 'confirmed') === 'confirmed');

  const stats = {};
  state.players.forEach(p => {
    stats[p.id] = { id: p.id, name: p.name, wins: 0, matches: 0 };
  });

  confirmedMatches.forEach(match => {
    if (!match.sets || match.sets.length < 2) return;
    const p1 = match.player1Id;
    const p2 = match.player2Id;
    if (!stats[p1] || !stats[p2]) return;

    let p1Sets = 0, p2Sets = 0;
    match.sets.forEach(set => {
      if (set.p1 > set.p2) p1Sets++;
      else p2Sets++;
    });

    stats[p1].matches++;
    stats[p2].matches++;
    if (p1Sets > p2Sets) stats[p1].wins++;
    else stats[p2].wins++;
  });

  const allStats = Object.values(stats).filter(p => p.matches > 0);
  const topWins = [...allStats].sort((a, b) => b.wins - a.wins || b.matches - a.matches).slice(0, 3);
  const topMatches = [...allStats].sort((a, b) => b.matches - a.matches || b.wins - a.wins).slice(0, 3);
  const topWinRate = [...allStats]
    .map(p => ({ ...p, rate: p.wins / p.matches }))
    .sort((a, b) => b.rate - a.rate || b.matches - a.matches)
    .slice(0, 3);

  // Längste Siegesserie berechnen
  const streaks = {};
  state.players.forEach(p => {
    streaks[p.id] = { id: p.id, name: p.name, maxStreak: 0, currentStreak: 0 };
  });
  const sortedMatches = [...confirmedMatches].sort((a, b) => (a.date?.seconds || 0) - (b.date?.seconds || 0));
  sortedMatches.forEach(match => {
    if (!match.sets || match.sets.length < 2) return;
    const p1 = match.player1Id, p2 = match.player2Id;
    if (!streaks[p1] || !streaks[p2]) return;
    let p1Sets = 0, p2Sets = 0;
    match.sets.forEach(set => { if (set.p1 > set.p2) p1Sets++; else p2Sets++; });
    const winnerId = p1Sets > p2Sets ? p1 : p2;
    const loserId = p1Sets > p2Sets ? p2 : p1;
    streaks[winnerId].currentStreak++;
    streaks[winnerId].maxStreak = Math.max(streaks[winnerId].maxStreak, streaks[winnerId].currentStreak);
    streaks[loserId].currentStreak = 0;
  });
  const topStreak = Object.values(streaks)
    .filter(p => p.maxStreak > 0)
    .sort((a, b) => b.maxStreak - a.maxStreak || b.currentStreak - a.currentStreak)
    .slice(0, 3);

  return `
    <div class="space-y-5 sm:space-y-8">
      ${renderStatCategory("Meiste Siege", topWins, p => `${p.wins} Sieg${p.wins !== 1 ? 'e' : ''}`)}
      ${renderStatCategory("Meiste Spiele", topMatches, p => `${p.matches} Spiel${p.matches !== 1 ? 'e' : ''}`)}
      ${renderStatCategory("Beste Siegquote", topWinRate, p => `${Math.round(p.rate * 100)}% (${p.wins}/${p.matches})`)}
      ${renderStatCategory("Längste Siegesserie", topStreak, p => `${p.maxStreak} Siege${p.currentStreak > 0 ? ` (aktuell: ${p.currentStreak})` : ''}`)}
    </div>`;
}

function renderStatisticsDoubles() {
  const confirmedMatches = state.doublesMatches.filter(m => (m.status || 'confirmed') === 'confirmed');

  const playerById = {};
  state.players.forEach(p => { playerById[p.id] = p; });

  const asMainPlayer = {};
  const asPartner = {};
  const totalStats = {};
  const partners = {};
  const duoStats = {};

  state.players.forEach(p => {
    asMainPlayer[p.id] = { id: p.id, name: p.name, wins: 0, matches: 0 };
    asPartner[p.id] = { id: p.id, name: p.name, wins: 0, matches: 0 };
    totalStats[p.id] = { id: p.id, name: p.name, matches: 0 };
    partners[p.id] = new Set();
  });

  confirmedMatches.forEach(match => {
    if (!match.sets || match.sets.length < 2) return;
    if (!match.team1 || !match.team2) return;

    let t1Sets = 0, t2Sets = 0;
    match.sets.forEach(set => {
      if (set.t1 > set.t2) t1Sets++;
      else t2Sets++;
    });

    const team1Won = t1Sets > t2Sets;

    [match.team1.player1Id, match.team1.player2Id, match.team2.player1Id, match.team2.player2Id].forEach(id => {
      if (totalStats[id]) totalStats[id].matches++;
    });
    if (asMainPlayer[match.team1.player1Id]) asMainPlayer[match.team1.player1Id].matches++;
    if (asPartner[match.team1.player2Id]) asPartner[match.team1.player2Id].matches++;
    if (asMainPlayer[match.team2.player1Id]) asMainPlayer[match.team2.player1Id].matches++;
    if (asPartner[match.team2.player2Id]) asPartner[match.team2.player2Id].matches++;

    const t1p1 = match.team1.player1Id, t1p2 = match.team1.player2Id;
    const t2p1 = match.team2.player1Id, t2p2 = match.team2.player2Id;
    if (partners[t1p1] && t1p2) partners[t1p1].add(t1p2);
    if (partners[t1p2] && t1p1) partners[t1p2].add(t1p1);
    if (partners[t2p1] && t2p2) partners[t2p1].add(t2p2);
    if (partners[t2p2] && t2p1) partners[t2p2].add(t2p1);

    [[t1p1, t1p2, team1Won], [t2p1, t2p2, !team1Won]].forEach(([pA, pB, won]) => {
      if (!pA || !pB) return;
      const key = [pA, pB].sort().join('|');
      if (!duoStats[key]) {
        const nameA = playerById[pA]?.name || pA;
        const nameB = playerById[pB]?.name || pB;
        duoStats[key] = { name: `${nameA} & ${nameB}`, wins: 0, matches: 0 };
      }
      duoStats[key].matches++;
      if (won) duoStats[key].wins++;
    });

    const winningTeam = team1Won ? match.team1 : match.team2;
    if (asMainPlayer[winningTeam.player1Id]) asMainPlayer[winningTeam.player1Id].wins++;
    if (asPartner[winningTeam.player2Id]) asPartner[winningTeam.player2Id].wins++;
  });

  const topMain = Object.values(asMainPlayer).filter(p => p.matches > 0).sort((a, b) => b.wins - a.wins || b.matches - a.matches).slice(0, 3);
  const topPartner = Object.values(asPartner).filter(p => p.matches > 0).sort((a, b) => b.wins - a.wins || b.matches - a.matches).slice(0, 3);
  const topWinRateMain = Object.values(asMainPlayer)
    .filter(p => p.matches > 0)
    .map(p => ({ ...p, rate: p.wins / p.matches }))
    .sort((a, b) => b.rate - a.rate || b.matches - a.matches)
    .slice(0, 3);
  const topWinRatePartner = Object.values(asPartner)
    .filter(p => p.matches > 0)
    .map(p => ({ ...p, rate: p.wins / p.matches }))
    .sort((a, b) => b.rate - a.rate || b.matches - a.matches)
    .slice(0, 3);
  const topTotalMatches = Object.values(totalStats).filter(p => p.matches > 0).sort((a, b) => b.matches - a.matches).slice(0, 3);
  // Längste Siegesserie berechnen
  const streaks = {};
  state.players.forEach(p => {
    streaks[p.id] = { id: p.id, name: p.name, maxStreak: 0, currentStreak: 0 };
  });
  const sortedMatches = [...confirmedMatches].sort((a, b) => (a.date?.seconds || 0) - (b.date?.seconds || 0));
  sortedMatches.forEach(match => {
    if (!match.sets || match.sets.length < 2) return;
    if (!match.team1 || !match.team2) return;
    let t1Sets = 0, t2Sets = 0;
    match.sets.forEach(set => { if (set.t1 > set.t2) t1Sets++; else t2Sets++; });
    const team1Won = t1Sets > t2Sets;
    const winners = team1Won
      ? [match.team1.player1Id, match.team1.player2Id]
      : [match.team2.player1Id, match.team2.player2Id];
    const losers = team1Won
      ? [match.team2.player1Id, match.team2.player2Id]
      : [match.team1.player1Id, match.team1.player2Id];
    winners.forEach(id => {
      if (!streaks[id]) return;
      streaks[id].currentStreak++;
      streaks[id].maxStreak = Math.max(streaks[id].maxStreak, streaks[id].currentStreak);
    });
    losers.forEach(id => {
      if (!streaks[id]) return;
      streaks[id].currentStreak = 0;
    });
  });
  const topStreak = Object.values(streaks)
    .filter(p => p.maxStreak > 0)
    .sort((a, b) => b.maxStreak - a.maxStreak || b.currentStreak - a.currentStreak)
    .slice(0, 3);

  const topDuo = Object.values(duoStats).sort((a, b) => b.wins - a.wins || b.matches - a.matches).slice(0, 3);
  const topDuoByMatches = Object.values(duoStats).sort((a, b) => b.matches - a.matches || b.wins - a.wins).slice(0, 3);
  const topVersatile = Object.values(partners)
    .map(partnerSet => {
      const id = state.players.find(p => partners[p.id] === partnerSet)?.id;
      if (!id) return null;
      return { id, name: playerById[id]?.name || id, partnerCount: partnerSet.size };
    })
    .filter(p => p && p.partnerCount > 0)
    .sort((a, b) => b.partnerCount - a.partnerCount)
    .slice(0, 3);

  return `
    <div class="space-y-5 sm:space-y-8">
      ${renderStatCategory("Meiste Siege (Spieler)", topMain, p => `${p.wins} Sieg${p.wins !== 1 ? 'e' : ''}`)}
      ${renderStatCategory("Meiste Siege (Mitspieler)", topPartner, p => `${p.wins} Sieg${p.wins !== 1 ? 'e' : ''}`)}
      ${renderStatCategory("Siegquote (Spieler)", topWinRateMain, p => `${Math.round(p.rate * 100)}%`)}
      ${renderStatCategory("Siegquote (Mitspieler)", topWinRatePartner, p => `${Math.round(p.rate * 100)}%`)}
      ${renderStatCategory("Meiste Doppel gesamt", topTotalMatches, p => `${p.matches} Spiele`)}
      ${renderStatCategory("Bestes Duo", topDuo, p => `${p.wins}S / ${p.matches}Sp`)}
      ${renderStatCategory("Häufigstes Duo", topDuoByMatches, p => `${p.matches}Sp / ${p.wins}S`)}
      ${renderStatCategory("Meiste Mitspieler", topVersatile, p => `${p.partnerCount} Partner`)}
      ${renderStatCategory("Längste Siegesserie", topStreak, p => `${p.maxStreak} Siege${p.currentStreak > 0 ? ` (aktuell: ${p.currentStreak})` : ''}`)}
    </div>`;
}

function renderStatCategory(title, players, valueFn) {
  const rankColors = [
    'bg-yellow-400 text-gray-700',
    'bg-gray-300 text-gray-700',
    'bg-orange-300 text-gray-700',
  ];
  const cardBg = [
    'bg-yellow-50 border-yellow-200',
    'bg-gray-50 border-gray-200',
    'bg-orange-50 border-orange-200',
  ];

  if (players.length === 0) {
    return `
      <div>
        <h3 class="text-sm sm:text-base font-semibold text-gray-700 mb-2">${title}</h3>
        <p class="text-gray-400 text-xs">Noch keine Spiele.</p>
      </div>`;
  }

  return `
    <div>
      <h3 class="text-sm sm:text-base font-semibold text-gray-700 mb-2">${title}</h3>
      <div class="space-y-1.5">
        ${players.map((p, i) => `
          <div class="flex items-center gap-2 p-2 sm:p-3 rounded-lg border ${cardBg[i]}">
            <span class="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-xs sm:text-sm font-bold ${rankColors[i]}">${i + 1}</span>
            <span class="flex-1 font-medium text-gray-800 text-sm truncate">${p.name}</span>
            <span class="font-semibold text-gray-600 text-xs sm:text-sm flex-shrink-0">${valueFn(p)}</span>
          </div>
        `).join('')}
      </div>
    </div>`;
}
