// js/pages/HomePage.js

function HomePage() {
  const recentMatches = [...state.singlesMatches, ...state.doublesMatches]
    .sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0))
    .slice(0, 5);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime() / 1000;

  const upcomingChallenges = state.challenges.filter((c) => {
    if (c.status === "completed") return false;
    const challengeDate = c.date?.seconds || 0;
    return challengeDate <= todayTimestamp + 86400;
  });

  return `
    <div class="space-y-8">
      <div class="text-center">
        <h2 class="text-2xl md:text-4xl font-bold text-gray-800 mb-4">Willkommen zur Vereinsmeisterschaft</h2>
        <p class="text-lg md:text-xl text-gray-600">Aktuell ${state.players.length} registrierte Spieler</p>
      </div>
      
      ${upcomingChallenges.length > 0 ? `
        <div class="bg-yellow-50 border-2 border-yellow-400 rounded-xl shadow-lg p-6">
          <h3 class="text-xl md:text-2xl font-bold text-gray-800 mb-4">🔥 Anstehende & überfällige Herausforderungen</h3>
          <div class="space-y-3">
            ${upcomingChallenges.map((challenge) => {
              const challengeDate = challenge.date?.seconds || 0;
              const date = new Date(challengeDate * 1000);
              const isOverdue = challengeDate < todayTimestamp;
              const dateStr = date.toLocaleDateString("de-DE");
              return `
                <div class="p-4 ${isOverdue ? "bg-red-100 border-red-500" : "bg-white border-yellow-500"} border-l-4 rounded-lg">
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="font-bold text-gray-800">${getPlayerName(challenge.challengerId)} vs ${getPlayerName(challenge.challengedId)}</div>
                      <div class="text-sm ${isOverdue ? "text-red-600 font-semibold" : "text-gray-600"}">${dateStr} ${isOverdue ? "⚠️ ÜBERFÄLLIG" : "📅 Heute"}</div>
                    </div>
                    <button onclick="enterResultFromChallenge('${challenge.id}')" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">Ergebnis eintragen</button>
                  </div>
                </div>`;
            }).join("")}
          </div>
        </div>
      ` : ""}
      
      <div class="grid md:grid-cols-2 gap-6">
        <div onclick="navigateTo('singles')" class="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-shadow">
          <div class="flex items-center space-x-4 mb-4">
            <div class="text-yellow-500">${icons.trophy}</div>
            <h3 class="text-xl md:text-2xl font-bold text-gray-800">Einzel-Turnier</h3>
          </div>
          <p class="text-gray-600">Gruppenphasen mit anschließendem K.O.-System</p>
        </div>
        
        <div onclick="navigateTo('doubles')" class="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-shadow">
          <div class="flex items-center space-x-4 mb-4">
            <div class="text-blue-500">${icons.pyramid}</div>
            <h3 class="text-xl md:text-2xl font-bold text-gray-800">Doppel-Pyramide</h3>
          </div>
          <p class="text-gray-600">Herausforderungs-System mit dynamischer Rangfolge</p>
        </div>
      </div>
      
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h3 class="text-xl md:text-2xl font-bold text-gray-800 mb-4">Letzte Ergebnisse</h3>
        ${recentMatches.length === 0 ? `
          <p class="text-gray-500 text-center py-8">Noch keine Spiele eingetragen</p>
        ` : `
          <div class="space-y-3">
            ${recentMatches.map((match) => {
              const scoreText = match.sets ? match.sets.map((s) => `${s.p1 || s.t1}:${s.p2 || s.t2}`).join(", ") : "Ausstehend";
              return `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span class="font-medium">${getPlayerName(match.player1Id || match.team1?.player1Id)} vs ${getPlayerName(match.player2Id || match.team2?.player1Id)}</span>
                  <span class="text-indigo-600 font-bold">${scoreText}</span>
                </div>`;
            }).join("")}
          </div>
        `}
      </div>
    </div>`;
}