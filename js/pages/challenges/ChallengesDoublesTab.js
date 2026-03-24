// js/pages/challenges/ChallengesDoublesTab.js
// Doppel-Herausforderungen Tab - Mobile-First

function ChallengesDoublesTab() {
  const doublesPlayers = state.players.filter((p) => p.doublesPool);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  return `
    <div class="space-y-4 sm:space-y-6">
      ${
        state.user && !isReadOnly()
          ? `
        <div class="bg-gray-50 rounded-lg p-3 sm:p-6">
          <h3 class="text-base sm:text-xl font-bold text-gray-800 mb-3">Neue Herausforderung</h3>

          <div class="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4 mb-3">
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Herausforderer</label>
              <select id="newChallenger" class="w-full px-2 py-2.5 border rounded-lg bg-white text-sm">
                <option value="">Auswählen...</option>
                ${doublesPlayers.map((p) => `<option value="${p.id}">${p.name}</option>`).join("")}
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Herausgeforderter</label>
              <select id="newChallenged" class="w-full px-2 py-2.5 border rounded-lg bg-white text-sm">
                <option value="">Auswählen...</option>
                ${doublesPlayers.map((p) => `<option value="${p.id}">${p.name}</option>`).join("")}
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Datum</label>
              <input type="date" id="challengeDate" min="${todayStr}" class="w-full px-2 py-2.5 border rounded-lg bg-white text-sm">
            </div>
          </div>

          <button onclick="addChallenge()" class="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm">
            Herausforderung eintragen
          </button>
        </div>
      `
          : ""
      }

      <div>
        <h3 class="text-base sm:text-xl font-bold text-gray-800 mb-3">Offene Herausforderungen</h3>

        ${
          state.challenges.length === 0
            ? `<div class="text-center py-6 text-gray-500 text-sm">Keine offenen Herausforderungen</div>`
            : `
          <div class="space-y-2">
            ${state.challenges
              .map((challenge) => {
                const challengeDate = challenge.date?.seconds || 0;
                const date = new Date(challengeDate * 1000);
                const todayTimestamp = today.getTime() / 1000;
                const isOverdue = challengeDate < todayTimestamp;
                const dateStr = date.toLocaleDateString("de-DE");

                return `
                <div class="p-3 ${isOverdue ? "bg-red-50 border-red-500" : "bg-gray-50 border-gray-300"} border-l-4 rounded-lg">
                  <div class="flex flex-col gap-2">
                    <div>
                      <div class="font-bold text-gray-800 text-sm">
                        ${getPlayerName(challenge.challengerId)} vs ${getPlayerName(challenge.challengedId)}
                      </div>
                      <div class="text-xs ${isOverdue ? "text-red-600 font-semibold" : "text-gray-500"}">
                        ${dateStr} ${isOverdue ? "ÜBERFÄLLIG" : ""}
                      </div>
                    </div>
                    ${
                      state.user && !isReadOnly()
                        ? `
                      <div class="flex gap-2">
                        <button onclick="enterResultFromChallenge('${challenge.id}')" class="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs sm:text-sm font-medium">
                          Ergebnis
                        </button>
                        <button onclick="markChallengeCompleted('${challenge.id}')" class="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm font-medium">
                          Erledigt
                        </button>
                      </div>
                    `
                        : ""
                    }
                  </div>
                </div>`;
              })
              .join("")}
          </div>
        `
        }
      </div>
    </div>`;
}
