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
    if ((isPlayer1 && p1Sets > p2Sets) || (!isPlayer1 && p2Sets > p1Sets)) {
      singlesWins++;
    } else {
      singlesLosses++;
    }
  });

  let doublesWins = 0, doublesLosses = 0;
  doublesMatches.forEach((match) => {
    if (!match.sets || match.sets.length < 2) return;
    let t1Sets = 0, t2Sets = 0;
    match.sets.forEach((set) => { if (set.t1 > set.t2) t1Sets++; else t2Sets++; });

    const isTeam1 = match.team1.player1Id === playerId || match.team1.player2Id === playerId;
    if ((isTeam1 && t1Sets > t2Sets) || (!isTeam1 && t2Sets > t1Sets)) {
      doublesWins++;
    } else {
      doublesLosses++;
    }
  });

  // Doppel-Statistiken berechnen
  // Aktuelle Position aus der Pyramide berechnen
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
    <div class="space-y-6">
      <button onclick="navigateTo('players')" class="text-indigo-600 hover:text-indigo-800 flex items-center space-x-2">
        <span>← Zurück zu allen Spielern</span>
      </button>

      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-4">${player.name}</h2>
        
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div class="p-4 bg-blue-50 rounded-lg">
            <div class="text-sm text-gray-600 mb-1">Einzel-Bilanz</div>
            <div class="text-xl md:text-2xl font-bold text-gray-800">${singlesWins}:${singlesLosses}</div>
          </div>
          <div class="p-4 bg-purple-50 rounded-lg">
            <div class="text-sm text-gray-600 mb-1">Position Doppel</div>
            <div class="text-xl md:text-2xl font-bold text-gray-800">${currentDoublesPosition || '-'}</div>
          </div>
          <div class="p-4 bg-indigo-50 rounded-lg">
            <div class="text-sm text-gray-600 mb-1">Veränderung</div>
            <div class="text-xl md:text-2xl font-bold ${positionChangeColor}">${positionChangeText}</div>
          </div>
          <div class="p-4 bg-blue-100 rounded-lg">
            <div class="text-sm text-gray-600 mb-1">Start-Position</div>
            <div class="text-xl md:text-2xl font-bold text-gray-800">${startingDoublesPosition || '-'}</div>
          </div>
          <div class="p-4 bg-green-50 rounded-lg col-span-2 md:col-span-2">
            <div class="text-sm text-gray-600 mb-1">Doppel-Bilanz</div>
            <div class="text-xl md:text-2xl font-bold text-gray-800">${doublesWins}:${doublesLosses}</div>
          </div>
        </div>

        <div class="space-y-6">
          ${singlesMatches.length > 0 ? `
            <div>
              <h3 class="text-xl font-bold text-gray-800 mb-3">Einzel-Spiele</h3>
              <div class="space-y-2">
                ${singlesMatches.map((match) => {
                  const isPlayer1 = match.player1Id === playerId;
                  const opponent = isPlayer1 ? getPlayerName(match.player2Id) : getPlayerName(match.player1Id);
                  const scoreText = match.sets ? match.sets.map((s) => `${s.p1}:${s.p2}`).join(", ") : "Ausstehend";

                  let result = "";
                  if (match.sets && match.sets.length >= 2) {
                    let p1Sets = 0, p2Sets = 0;
                    match.sets.forEach((set) => { if (set.p1 > set.p2) p1Sets++; else p2Sets++; });
                    const won = (isPlayer1 && p1Sets > p2Sets) || (!isPlayer1 && p2Sets > p1Sets);
                    result = won ? "Sieg" : "Niederlage";
                  }

                  return `
                    <div class="p-3 ${result === "Sieg" ? "bg-green-50" : result === "Niederlage" ? "bg-red-50" : "bg-gray-50"} rounded-lg">
                      <div class="flex justify-between items-center">
                        <span class="font-medium">vs ${opponent}</span>
                        <div class="text-right">
                          <span class="font-bold ${result === "Sieg" ? "text-green-600" : result === "Niederlage" ? "text-red-600" : "text-gray-600"}">${result || "Offen"}</span>
                          <div class="text-sm text-gray-600">${scoreText}</div>
                        </div>
                      </div>
                    </div>`;
                }).join("")}
              </div>
            </div>
          ` : ""}

          ${doublesMatches.length > 0 ? `
            <div>
              <h3 class="text-xl font-bold text-gray-800 mb-3">Doppel-Spiele</h3>
              <div class="space-y-2">
                ${doublesMatches.map((match) => {
                  const isTeam1 = match.team1.player1Id === playerId || match.team1.player2Id === playerId;
                  const partner = isTeam1 
                    ? getPlayerName(match.team1.player1Id === playerId ? match.team1.player2Id : match.team1.player1Id)
                    : getPlayerName(match.team2.player1Id === playerId ? match.team2.player2Id : match.team2.player1Id);
                  const opponents = isTeam1
                    ? `${getPlayerName(match.team2.player1Id)} / ${getPlayerName(match.team2.player2Id)}`
                    : `${getPlayerName(match.team1.player1Id)} / ${getPlayerName(match.team1.player2Id)}`;
                  const scoreText = match.sets ? match.sets.map((s) => `${s.t1}:${s.t2}`).join(", ") : "Ausstehend";

                  let result = "";
                  if (match.sets && match.sets.length >= 2) {
                    let t1Sets = 0, t2Sets = 0;
                    match.sets.forEach((set) => { if (set.t1 > set.t2) t1Sets++; else t2Sets++; });
                    const won = (isTeam1 && t1Sets > t2Sets) || (!isTeam1 && t2Sets > t1Sets);
                    result = won ? "Sieg" : "Niederlage";
                  }

                  return `
                    <div class="p-3 ${result === "Sieg" ? "bg-green-50" : result === "Niederlage" ? "bg-red-50" : "bg-gray-50"} rounded-lg">
                      <div class="flex justify-between items-center">
                        <div>
                          <div class="font-medium">mit ${partner}</div>
                          <div class="text-sm text-gray-600">vs ${opponents}</div>
                        </div>
                        <div class="text-right">
                          <span class="font-bold ${result === "Sieg" ? "text-green-600" : result === "Niederlage" ? "text-red-600" : "text-gray-600"}">${result || "Offen"}</span>
                          <div class="text-sm text-gray-600">${scoreText}</div>
                        </div>
                      </div>
                    </div>`;
                }).join("")}
              </div>
            </div>
          ` : ""}

          ${singlesMatches.length === 0 && doublesMatches.length === 0 ? `
            <div class="text-center py-8 text-gray-500">
              Noch keine Spiele für diesen Spieler
            </div>
          ` : ""}
        </div>
      </div>
    </div>`;
}