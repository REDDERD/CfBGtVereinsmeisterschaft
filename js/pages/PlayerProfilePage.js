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

  return `
    <div class="space-y-6">
      <button onclick="navigateTo('players')" class="text-indigo-600 hover:text-indigo-800 flex items-center space-x-2">
        <span>← Zurück zu allen Spielern</span>
      </button>

      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-4">${player.name}</h2>
        
        <div class="grid md:grid-cols-2 gap-4 mb-6">
          <div class="p-4 bg-blue-50 rounded-lg">
            <div class="text-sm text-gray-600 mb-1">Einzel-Bilanz</div>
            <div class="text-xl md:text-2xl font-bold text-gray-800">${singlesWins}:${singlesLosses}</div>
          </div>
          <div class="p-4 bg-green-50 rounded-lg">
            <div class="text-sm text-gray-600 mb-1">Doppel-Spiele</div>
            <div class="text-xl md:text-2xl font-bold text-gray-800">${doublesMatches.length}</div>
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