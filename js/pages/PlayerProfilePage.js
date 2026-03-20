// js/pages/PlayerProfilePage.js
// Spielerprofil - Mobile-First Redesign

function PlayerProfilePage(playerId) {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return '<div class="text-center py-12 text-gray-500">Spieler nicht gefunden</div>';

  // --- Einzel-Daten ---
  const singlesMatches = state.singlesMatches
    .filter((m) => (m.status || 'confirmed') === 'confirmed')
    .filter((m) => m.player1Id === playerId || m.player2Id === playerId)
    .filter((m) => m.sets && m.sets.length >= 2);

  let singlesWins = 0, singlesLosses = 0, singlesSetsWon = 0, singlesSetsLost = 0;
  const singlesOpponents = {};

  singlesMatches.forEach((match) => {
    const isP1 = match.player1Id === playerId;
    const opponentId = isP1 ? match.player2Id : match.player1Id;
    let p1Sets = 0, p2Sets = 0;
    match.sets.forEach((set) => {
      if (set.p1 > set.p2) p1Sets++;
      else p2Sets++;
    });
    const won = (isP1 && p1Sets > p2Sets) || (!isP1 && p2Sets > p1Sets);
    if (won) singlesWins++;
    else singlesLosses++;
    singlesSetsWon += isP1 ? p1Sets : p2Sets;
    singlesSetsLost += isP1 ? p2Sets : p1Sets;

    if (!singlesOpponents[opponentId]) singlesOpponents[opponentId] = { wins: 0, matches: 0 };
    singlesOpponents[opponentId].matches++;
    if (won) singlesOpponents[opponentId].wins++;
  });

  const singlesTotal = singlesWins + singlesLosses;
  const singlesRate = singlesTotal > 0 ? Math.round((singlesWins / singlesTotal) * 100) : 0;

  // Längste Einzel-Siegesserie
  const sortedSingles = [...singlesMatches].sort((a, b) => (a.date?.seconds || 0) - (b.date?.seconds || 0));
  let singlesMaxStreak = 0, singlesCurrentStreak = 0;
  sortedSingles.forEach((match) => {
    const isP1 = match.player1Id === playerId;
    let p1Sets = 0, p2Sets = 0;
    match.sets.forEach((set) => { if (set.p1 > set.p2) p1Sets++; else p2Sets++; });
    const won = (isP1 && p1Sets > p2Sets) || (!isP1 && p2Sets > p1Sets);
    if (won) { singlesCurrentStreak++; singlesMaxStreak = Math.max(singlesMaxStreak, singlesCurrentStreak); }
    else singlesCurrentStreak = 0;
  });

  // Häufigster Einzel-Gegner
  const topSinglesOpponent = Object.entries(singlesOpponents)
    .map(([id, s]) => ({ id, name: getPlayerName(id), ...s }))
    .sort((a, b) => b.matches - a.matches)
    [0] || null;

  // --- Doppel-Daten ---
  const doublesMatches = state.doublesMatches
    .filter((m) => (m.status || 'confirmed') === 'confirmed')
    .filter((m) => m.team1 && m.team2)
    .filter((m) =>
      m.team1.player1Id === playerId || m.team1.player2Id === playerId ||
      m.team2.player1Id === playerId || m.team2.player2Id === playerId
    )
    .filter((m) => m.sets && m.sets.length >= 2);

  let doublesWins = 0, doublesLosses = 0, doublesSetsWon = 0, doublesSetsLost = 0;
  const doublesOpponents = {};
  const doublesPartners = {};

  doublesMatches.forEach((match) => {
    const isTeam1 = match.team1.player1Id === playerId || match.team1.player2Id === playerId;
    let t1Sets = 0, t2Sets = 0;
    match.sets.forEach((set) => { if (set.t1 > set.t2) t1Sets++; else t2Sets++; });
    const won = (isTeam1 && t1Sets > t2Sets) || (!isTeam1 && t2Sets > t1Sets);
    if (won) doublesWins++;
    else doublesLosses++;
    doublesSetsWon += isTeam1 ? t1Sets : t2Sets;
    doublesSetsLost += isTeam1 ? t2Sets : t1Sets;

    // Partner
    const myTeam = isTeam1 ? match.team1 : match.team2;
    const partnerId = myTeam.player1Id === playerId ? myTeam.player2Id : myTeam.player1Id;
    if (partnerId) {
      if (!doublesPartners[partnerId]) doublesPartners[partnerId] = { wins: 0, matches: 0 };
      doublesPartners[partnerId].matches++;
      if (won) doublesPartners[partnerId].wins++;
    }

    // Gegner
    const oppTeam = isTeam1 ? match.team2 : match.team1;
    [oppTeam.player1Id, oppTeam.player2Id].forEach((oppId) => {
      if (!oppId) return;
      if (!doublesOpponents[oppId]) doublesOpponents[oppId] = { wins: 0, matches: 0 };
      doublesOpponents[oppId].matches++;
      if (won) doublesOpponents[oppId].wins++;
    });
  });

  const doublesTotal = doublesWins + doublesLosses;
  const doublesRate = doublesTotal > 0 ? Math.round((doublesWins / doublesTotal) * 100) : 0;

  // Längste Doppel-Siegesserie
  const sortedDoubles = [...doublesMatches].sort((a, b) => (a.date?.seconds || 0) - (b.date?.seconds || 0));
  let doublesMaxStreak = 0, doublesCurrentStreak = 0;
  sortedDoubles.forEach((match) => {
    const isTeam1 = match.team1.player1Id === playerId || match.team1.player2Id === playerId;
    let t1Sets = 0, t2Sets = 0;
    match.sets.forEach((set) => { if (set.t1 > set.t2) t1Sets++; else t2Sets++; });
    const won = (isTeam1 && t1Sets > t2Sets) || (!isTeam1 && t2Sets > t1Sets);
    if (won) { doublesCurrentStreak++; doublesMaxStreak = Math.max(doublesMaxStreak, doublesCurrentStreak); }
    else doublesCurrentStreak = 0;
  });

  // Häufigster Doppel-Gegner
  const topDoublesOpponent = Object.entries(doublesOpponents)
    .map(([id, s]) => ({ id, name: getPlayerName(id), ...s }))
    .sort((a, b) => b.matches - a.matches)
    [0] || null;

  // Bester Doppelpartner (nach Siege, Tiebreaker Siegquote)
  const bestPartner = Object.entries(doublesPartners)
    .map(([id, s]) => ({ id, name: getPlayerName(id), ...s, rate: s.matches > 0 ? s.wins / s.matches : 0 }))
    .sort((a, b) => b.wins - a.wins || b.rate - a.rate)
    [0] || null;

  // --- Formkurve (letzte 5 Spiele, Einzel + Doppel gemischt) ---
  const allPlayerMatches = [
    ...sortedSingles.map((m) => {
      const isP1 = m.player1Id === playerId;
      let p1S = 0, p2S = 0;
      m.sets.forEach((s) => { if (s.p1 > s.p2) p1S++; else p2S++; });
      return { time: m.date?.seconds || 0, won: (isP1 && p1S > p2S) || (!isP1 && p2S > p1S) };
    }),
    ...sortedDoubles.map((m) => {
      const isT1 = m.team1.player1Id === playerId || m.team1.player2Id === playerId;
      let t1S = 0, t2S = 0;
      m.sets.forEach((s) => { if (s.t1 > s.t2) t1S++; else t2S++; });
      return { time: m.date?.seconds || 0, won: (isT1 && t1S > t2S) || (!isT1 && t2S > t1S) };
    }),
  ].sort((a, b) => a.time - b.time);
  const recentForm = allPlayerMatches.slice(-5);

  // --- Pyramiden-Position ---
  let currentDoublesPosition = 0;
  const levels = state.pyramid.levels || [];
  let positionCounter = 1;
  for (let i = 0; i < levels.length; i++) {
    for (let j = 0; j < levels[i].length; j++) {
      if (levels[i][j] === playerId) { currentDoublesPosition = positionCounter; break; }
      positionCounter++;
    }
    if (currentDoublesPosition > 0) break;
  }
  const startingPos = player.doublesStartingPosition || 0;
  const posChange = (startingPos > 0 && currentDoublesPosition > 0) ? startingPos - currentDoublesPosition : 0;
  const posChangeText = posChange > 0 ? `+${posChange}` : posChange < 0 ? `${posChange}` : '±0';
  const posChangeColor = posChange > 0 ? 'text-green-600' : posChange < 0 ? 'text-red-600' : 'text-gray-600';

  // --- Render ---
  return `
    <div class="space-y-4 sm:space-y-6">
      <button onclick="navigateTo('players')" class="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm font-medium">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Alle Spieler
      </button>

      <!-- Header + Formkurve -->
      <div class="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div class="flex items-center justify-between gap-4">
          <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">${player.name}</h2>
          ${recentForm.length > 0 ? `
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] sm:text-xs text-gray-500 mr-1">Form</span>
              ${recentForm.map((r) => `
                <div class="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full ${r.won ? 'bg-green-500' : 'bg-red-500'}" title="${r.won ? 'Sieg' : 'Niederlage'}"></div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Einzel-Statistiken -->
      <div class="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h3 class="text-base sm:text-lg font-bold text-gray-800 mb-3">Einzel</h3>
        ${singlesTotal === 0 ? `
          <p class="text-gray-400 text-sm">Noch keine Einzel-Spiele</p>
        ` : `
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3">
            <div class="p-3 sm:p-4 bg-blue-50 rounded-lg text-center">
              <div class="text-[10px] sm:text-xs text-gray-500 mb-0.5">Bilanz</div>
              <div class="text-lg sm:text-2xl font-bold text-gray-800">${singlesWins}:${singlesLosses}</div>
            </div>
            <div class="p-3 sm:p-4 bg-indigo-50 rounded-lg text-center">
              <div class="text-[10px] sm:text-xs text-gray-500 mb-0.5">Siegquote</div>
              <div class="text-lg sm:text-2xl font-bold text-gray-800">${singlesRate}%</div>
            </div>
            <div class="p-3 sm:p-4 bg-yellow-50 rounded-lg text-center">
              <div class="text-[10px] sm:text-xs text-gray-500 mb-0.5">Beste Serie</div>
              <div class="text-lg sm:text-2xl font-bold text-gray-800">${singlesMaxStreak}</div>
              ${singlesCurrentStreak > 0 ? `<div class="text-[10px] sm:text-xs text-green-600 font-medium">aktuell: ${singlesCurrentStreak}</div>` : ''}
            </div>
            <div class="p-3 sm:p-4 bg-gray-50 rounded-lg text-center">
              <div class="text-[10px] sm:text-xs text-gray-500 mb-0.5">Sätze</div>
              <div class="text-lg sm:text-2xl font-bold text-gray-800">${singlesSetsWon}:${singlesSetsLost}</div>
            </div>
          </div>
          ${topSinglesOpponent ? `
            <div class="p-2.5 sm:p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <div class="text-sm text-gray-600">Häufigster Gegner</div>
              <div class="text-sm font-semibold text-gray-800">${topSinglesOpponent.name} <span class="text-gray-500 font-normal">(${topSinglesOpponent.wins}:${topSinglesOpponent.matches - topSinglesOpponent.wins})</span></div>
            </div>
          ` : ''}
        `}
      </div>

      <!-- Doppel-Statistiken -->
      <div class="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h3 class="text-base sm:text-lg font-bold text-gray-800 mb-3">Doppel</h3>
        ${doublesTotal === 0 ? `
          <p class="text-gray-400 text-sm">Noch keine Doppel-Spiele</p>
        ` : `
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3">
            <div class="p-3 sm:p-4 bg-green-50 rounded-lg text-center">
              <div class="text-[10px] sm:text-xs text-gray-500 mb-0.5">Bilanz</div>
              <div class="text-lg sm:text-2xl font-bold text-gray-800">${doublesWins}:${doublesLosses}</div>
            </div>
            <div class="p-3 sm:p-4 bg-indigo-50 rounded-lg text-center">
              <div class="text-[10px] sm:text-xs text-gray-500 mb-0.5">Siegquote</div>
              <div class="text-lg sm:text-2xl font-bold text-gray-800">${doublesRate}%</div>
            </div>
            <div class="p-3 sm:p-4 bg-yellow-50 rounded-lg text-center">
              <div class="text-[10px] sm:text-xs text-gray-500 mb-0.5">Beste Serie</div>
              <div class="text-lg sm:text-2xl font-bold text-gray-800">${doublesMaxStreak}</div>
              ${doublesCurrentStreak > 0 ? `<div class="text-[10px] sm:text-xs text-green-600 font-medium">aktuell: ${doublesCurrentStreak}</div>` : ''}
            </div>
            <div class="p-3 sm:p-4 bg-gray-50 rounded-lg text-center">
              <div class="text-[10px] sm:text-xs text-gray-500 mb-0.5">Sätze</div>
              <div class="text-lg sm:text-2xl font-bold text-gray-800">${doublesSetsWon}:${doublesSetsLost}</div>
            </div>
          </div>
          <div class="space-y-1.5">
            ${bestPartner ? `
              <div class="p-2.5 sm:p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <div class="text-sm text-gray-600">Bester Partner</div>
                <div class="text-sm font-semibold text-gray-800">${bestPartner.name} <span class="text-gray-500 font-normal">(${bestPartner.wins}:${bestPartner.matches - bestPartner.wins})</span></div>
              </div>
            ` : ''}
            ${topDoublesOpponent ? `
              <div class="p-2.5 sm:p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <div class="text-sm text-gray-600">Häufigster Gegner</div>
                <div class="text-sm font-semibold text-gray-800">${topDoublesOpponent.name} <span class="text-gray-500 font-normal">(${topDoublesOpponent.wins}:${topDoublesOpponent.matches - topDoublesOpponent.wins})</span></div>
              </div>
            ` : ''}
          </div>
        `}
      </div>

      <!-- Pyramiden-Position -->
      ${currentDoublesPosition > 0 || startingPos > 0 ? `
        <div class="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h3 class="text-base sm:text-lg font-bold text-gray-800 mb-3">Pyramiden-Position</h3>
          <div class="grid grid-cols-3 gap-2 sm:gap-3">
            <div class="p-3 sm:p-4 bg-purple-50 rounded-lg text-center">
              <div class="text-[10px] sm:text-xs text-gray-500 mb-0.5">Aktuell</div>
              <div class="text-lg sm:text-2xl font-bold text-gray-800">${currentDoublesPosition || '–'}</div>
            </div>
            <div class="p-3 sm:p-4 bg-blue-50 rounded-lg text-center">
              <div class="text-[10px] sm:text-xs text-gray-500 mb-0.5">Start</div>
              <div class="text-lg sm:text-2xl font-bold text-gray-800">${startingPos || '–'}</div>
            </div>
            <div class="p-3 sm:p-4 bg-gray-50 rounded-lg text-center">
              <div class="text-[10px] sm:text-xs text-gray-500 mb-0.5">Veränderung</div>
              <div class="text-lg sm:text-2xl font-bold ${posChangeColor}">${posChangeText}</div>
            </div>
          </div>
        </div>
      ` : ''}
    </div>`;
}
