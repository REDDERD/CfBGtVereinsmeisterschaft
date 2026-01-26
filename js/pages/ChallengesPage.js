// js/pages/ChallengesPage.js

function ChallengesPage() {
  const doublesPlayers = state.players.filter((p) => p.doublesPool);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  return `
    <div class="space-y-6">
      ${state.user ? `
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-xl md:text-2xl font-bold text-gray-800 mb-4">Neue Herausforderung eintragen</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Herausforderer</label>
              <select id="newChallenger" class="w-full px-3 py-2 border rounded-lg">
                <option value="">Auswählen...</option>
                ${doublesPlayers.map((p) => `<option value="${p.id}">${p.name}</option>`).join("")}
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Herausgeforderter</label>
              <select id="newChallenged" class="w-full px-3 py-2 border rounded-lg">
                <option value="">Auswählen...</option>
                ${doublesPlayers.map((p) => `<option value="${p.id}">${p.name}</option>`).join("")}
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Datum</label>
              <input type="date" id="challengeDate" min="${todayStr}" class="w-full px-3 py-2 border rounded-lg">
            </div>
          </div>
          
          <button onclick="addChallenge()" class="w-full md:w-auto px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Herausforderung eintragen
          </button>
        </div>
      ` : ""}
      
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-xl md:text-2xl font-bold text-gray-800 mb-4">Offene Herausforderungen</h2>
        
        ${state.challenges.length === 0 ? `
          <div class="text-center py-8 text-gray-500">
            Keine offenen Herausforderungen
          </div>
        ` : `
          <div class="space-y-3">
            ${state.challenges.map((challenge) => {
              const challengeDate = challenge.date?.seconds || 0;
              const date = new Date(challengeDate * 1000);
              const todayTimestamp = today.getTime() / 1000;
              const isOverdue = challengeDate < todayTimestamp;
              const dateStr = date.toLocaleDateString("de-DE");

              return `
                <div class="p-4 ${isOverdue ? "bg-red-50 border-red-500" : "bg-gray-50 border-gray-300"} border-l-4 rounded-lg">
                  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div class="font-bold text-gray-800">
                        ${getPlayerName(challenge.challengerId)} vs ${getPlayerName(challenge.challengedId)}
                      </div>
                      <div class="text-sm ${isOverdue ? "text-red-600" : "text-gray-500"}">
                        📅 ${dateStr} ${isOverdue ? "⚠️ ÜBERFÄLLIG" : ""}
                      </div>
                    </div>
                    ${state.user ? `
                      <div class="flex flex-col sm:flex-row gap-2">
                        <button onclick="enterResultFromChallenge('${challenge.id}')" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm whitespace-nowrap">
                          Ergebnis eintragen
                        </button>
                        <button onclick="markChallengeCompleted('${challenge.id}')" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm whitespace-nowrap">
                          Als erledigt markieren
                        </button>
                      </div>
                    ` : ""}
                  </div>
                </div>`;
            }).join("")}
          </div>
        `}
      </div>
    </div>`;
}