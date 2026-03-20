// js/pages/PlayerProfilePage.js

function PlayerProfilePage(playerId) {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return "<div>Spieler nicht gefunden</div>";

  const singlesMatches = state.singlesMatches.filter(
    (m) => m.player1Id === playerId || m.player2Id === playerId
  );

  const doublesMatches = state.doublesMatches.filter(
    (m) =>
      m.team1.player1Id === playerId ||
      m.team1.player2Id === playerId ||
      m.team2.player1Id === playerId ||
      m.team2.player2Id === playerId
  );

  let singlesWins = 0, singlesLosses = 0;
  singlesMatches.forEach((match) => {
    if (!match.sets || match.sets.length < 2) return;
    let p1Sets = 0, p2Sets = 0;
    match.sets.forEach((set) => { if (set.p1 > set.p2) p1Sets++; else p2Sets++; });
    const isPlayer1 = match.player1Id === playerId;
    if ((isPlayer1 && p1Sets > p2Sets) || (!isPlayer1 && p2Sets > p1Sets)) singlesWins++;
    else singlesLosses++;
  });

  let doublesWins = 0, doublesLosses = 0;
  doublesMatches.forEach((match) => {
    if (!match.sets || match.sets.length < 2) return;
    let t1Sets = 0, t2Sets = 0;
    match.sets.forEach((set) => { if (set.t1 > set.t2) t1Sets++; else t2Sets++; });
    const isTeam1 = match.team1.player1Id === playerId || match.team1.player2Id === playerId;
    if ((isTeam1 && t1Sets > t2Sets) || (!isTeam1 && t2Sets > t1Sets)) doublesWins++;
    else doublesLosses++;
  });

  let currentDoublesPosition = 0;
  const levels = state.pyramid.levels || [];
  let positionCounter = 1;
  for (let levelIdx = 0; levelIdx < levels.length; levelIdx++) {
    const level = levels[levelIdx];
    for (let posIdx = 0; posIdx < level.length; posIdx++) {
      if (level[posIdx] === playerId) {
        currentDoublesPosition = positionCounter;
        break;
      }
      positionCounter++;
    }
    if (currentDoublesPosition > 0) break;
  }

  const startingDoublesPosition = player.doublesStartingPosition || 0;
  const positionChange = (startingDoublesPosition > 0 && currentDoublesPosition > 0)
    ? startingDoublesPosition - currentDoublesPosition
    : 0;
  const positionChangeText = positionChange > 0 ? `+${positionChange}` : positionChange < 0 ? `${positionChange}` : '±0';
  const positionChangeColor = positionChange > 0 ? 'text-green-600' : positionChange < 0 ? 'text-red-600' : 'text-gray-600';

  return `
    <div class="space-y-4 sm:space-y-6">
      <button onclick="navigateTo('players')" class="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm">
        <span>← Alle Spieler</span>
      </button>

      <div class="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4">${player.name}</h2>

        <!-- Stats grid - 3 columns on mobile -->
        <div class="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div class="p-2.5 sm:p-4 bg-blue-50 rounded-lg text-center">
            <div class="text-[10px] sm:text-xs text-gray-600 mb-0.5">Einzel</div>
            <div class="text-lg sm:text-2xl font-bold text-gray-800">${singlesWins}:${singlesLosses}</div>
          </div>
          <div class="p-2.5 sm:p-4 bg-green-50 rounded-lg text-center">
            <div class="text-[10px] sm:text-xs text-gray-600 mb-0.5">Doppel</div>
            <div class="text-lg sm:text-2xl font-bold text-gray-800">${doublesWins}:${doublesLosses}</div>
          </div>
          <div class="p-2.5 sm:p-4 bg-purple-50 rounded-lg text-center">
            <div class="text-[10px] sm:text-xs text-gray-600 mb-0.5">Pos. Doppel</div>
            <div class="text-lg sm:text-2xl font-bold text-gray-800">${currentDoublesPosition || '-'}</div>
          </div>
          <div class="p-2.5 sm:p-4 bg-indigo-50 rounded-lg text-center">
            <div class="text-[10px] sm:text-xs text-gray-600 mb-0.5">Veränderung</div>
            <div class="text-lg sm:text-2xl font-bold ${positionChangeColor}">${positionChangeText}</div>
          </div>
          <div class="p-2.5 sm:p-4 bg-blue-100 rounded-lg text-center col-span-2">
            <div class="text-[10px] sm:text-xs text-gray-600 mb-0.5">Start-Position</div>
            <div class="text-lg sm:text-2xl font-bold text-gray-800">${startingDoublesPosition || '-'}</div>
          </div>
        </div>

        <div class="space-y-4 sm:space-y-6">
          ${singlesMatches.length > 0 ? `
            <div>
              <h3 class="text-base sm:text-lg font-bold text-gray-800 mb-2">Einzel-Spiele</h3>
              <div class="space-y-1.5">
                ${singlesMatches.map((match) => {
                  const isPlayer1 = match.player1Id === playerId;
                  const opponent = isPlayer1 ? getPlayerName(match.player2Id) : getPlayerName(match.player1Id);
                  const scoreText = match.sets ? match.sets.map((s) => `${s.p1}:${s.p2}`).join(", ") : "";

                  let result = "";
                  if (match.sets && match.sets.length >= 2) {
                    let p1Sets = 0, p2Sets = 0;
                    match.sets.forEach((set) => { if (set.p1 > set.p2) p1Sets++; else p2Sets++; });
                    result = (isPlayer1 && p1Sets > p2Sets) || (!isPlayer1 && p2Sets > p1Sets) ? "Sieg" : "Niederlage";
                  }

                  return `
                    <div class="p-2.5 sm:p-3 ${result === "Sieg" ? "bg-green-50" : result === "Niederlage" ? "bg-red-50" : "bg-gray-50"} rounded-lg">
                      <div class="flex justify-between items-center gap-2">
                        <span class="font-medium text-sm truncate">vs ${opponent}</span>
                        <div class="text-right flex-shrink-0">
                          <span class="text-xs sm:text-sm font-bold ${result === "Sieg" ? "text-green-600" : result === "Niederlage" ? "text-red-600" : "text-gray-600"}">${result || "Offen"}</span>
                          ${scoreText ? `<div class="text-xs text-gray-500">${scoreText}</div>` : ''}
                        </div>
                      </div>
                    </div>`;
                }).join("")}
              </div>
            </div>
          ` : ""}

          ${doublesMatches.length > 0 ? `
            <div>
              <h3 class="text-base sm:text-lg font-bold text-gray-800 mb-2">Doppel-Spiele</h3>
              <div class="space-y-1.5">
                ${doublesMatches.map((match) => {
                  const isTeam1 = match.team1.player1Id === playerId || match.team1.player2Id === playerId;
                  const partner = isTeam1
                    ? getPlayerName(match.team1.player1Id === playerId ? match.team1.player2Id : match.team1.player1Id)
                    : getPlayerName(match.team2.player1Id === playerId ? match.team2.player2Id : match.team2.player1Id);
                  const opponents = isTeam1
                    ? `${getPlayerName(match.team2.player1Id)} / ${getPlayerName(match.team2.player2Id)}`
                    : `${getPlayerName(match.team1.player1Id)} / ${getPlayerName(match.team1.player2Id)}`;
                  const scoreText = match.sets ? match.sets.map((s) => `${s.t1}:${s.t2}`).join(", ") : "";

                  let result = "";
                  if (match.sets && match.sets.length >= 2) {
                    let t1Sets = 0, t2Sets = 0;
                    match.sets.forEach((set) => { if (set.t1 > set.t2) t1Sets++; else t2Sets++; });
                    result = (isTeam1 && t1Sets > t2Sets) || (!isTeam1 && t2Sets > t1Sets) ? "Sieg" : "Niederlage";
                  }

                  return `
                    <div class="p-2.5 sm:p-3 ${result === "Sieg" ? "bg-green-50" : result === "Niederlage" ? "bg-red-50" : "bg-gray-50"} rounded-lg">
                      <div class="flex justify-between items-center gap-2">
                        <div class="min-w-0">
                          <div class="font-medium text-sm truncate">mit ${partner}</div>
                          <div class="text-xs text-gray-500 truncate">vs ${opponents}</div>
                        </div>
                        <div class="text-right flex-shrink-0">
                          <span class="text-xs sm:text-sm font-bold ${result === "Sieg" ? "text-green-600" : result === "Niederlage" ? "text-red-600" : "text-gray-600"}">${result || "Offen"}</span>
                          ${scoreText ? `<div class="text-xs text-gray-500">${scoreText}</div>` : ''}
                        </div>
                      </div>
                    </div>`;
                }).join("")}
              </div>
            </div>
          ` : ""}

          ${singlesMatches.length === 0 && doublesMatches.length === 0 ? `
            <div class="text-center py-6 text-gray-500 text-sm">
              Noch keine Spiele für diesen Spieler
            </div>
          ` : ""}
        </div>
      </div>
    </div>`;
}
