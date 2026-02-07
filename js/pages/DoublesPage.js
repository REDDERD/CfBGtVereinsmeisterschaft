// js/pages/DoublesPage.js

function DoublesPage() {
  const levels = state.pyramid.levels || [];

  return `
    <div class="space-y-6">
      <div class="bg-white rounded-xl shadow-lg p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h2 class="text-2xl md:text-3xl font-bold text-gray-800">Doppel-Pyramide</h2>
          
          ${
            levels.length > 0
              ? `
          <!-- Pool-Visualisierungs-Toggle -->
          <div class="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
            <span class="text-sm font-medium text-gray-700">Pools anzeigen</span>
            <button 
              onclick="togglePoolVisualization()" 
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${state.doublesPoolVisualization ? "bg-indigo-600" : "bg-gray-300"}"
              role="switch"
              aria-checked="${state.doublesPoolVisualization}">
              <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${state.doublesPoolVisualization ? "translate-x-6" : "translate-x-1"}"></span>
            </button>
          </div>
          `
              : ""
          }
        </div>
        
        <div class="mb-6">
          ${
            state.pyramidLoading
              ? `
            <div class="text-center py-12 bg-gray-50 rounded-lg">
              <div class="flex flex-col items-center justify-center">
                <svg class="animate-spin h-12 w-12 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="text-gray-600 font-medium">Pyramide wird aktualisiert...</p>
              </div>
            </div>
          `
              : levels.length === 0 && !state.pyramidInitialized
                ? `
            <div class="text-center py-12 bg-gray-50 rounded-lg">
              <p class="text-gray-600">Pyramide noch nicht initialisiert</p>
              ${
                state.user
                  ? `
                <button onclick="initPyramid()" class="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Pyramide initialisieren
                </button>
              `
                  : ""
              }
            </div>
          `
                : `
           
            <div class="space-y-4">
              ${levels
                .map(
                  (level, levelIdx) => `
                <div class="flex flex-wrap justify-center items-center gap-2 sm:gap-4">
                  ${level
                    .map((playerId, posIdx) => {
                      const player = state.players.find(
                        (p) => p.id === playerId,
                      );
                      const pool = player?.doublesPool;

                      // Farben basierend auf Pool
                      let colorClasses =
                        "from-yellow-100 to-orange-100 border-yellow-500";
                      if (state.doublesPoolVisualization && pool) {
                        if (pool === "A") {
                          colorClasses =
                            "from-blue-100 to-blue-200 border-blue-500";
                        } else if (pool === "B") {
                          colorClasses =
                            "from-green-100 to-green-200 border-green-500";
                        }
                      }

                      return `
                    <div class="relative">
                      <div class="bg-gradient-to-r ${colorClasses} border-2 rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-center shadow-md min-w-[100px] sm:min-w-[120px] transition-all duration-300">
                        <div class="font-bold text-gray-800 text-sm sm:text-base break-words">${getPlayerName(playerId)}</div>
                      </div>
                    </div>
                  `;
                    })
                    .join("")}
                </div>
              `,
                )
                .join("")}
            </div>
          `
          }
        </div>
        
        ${
          state.challenges.length > 0
            ? `
        <div class="mb-6">
          <h3 class="text-xl font-semibold mb-3">Anstehende Herausforderungen</h3>
          <div class="space-y-3">
            ${state.challenges
              .map(
                (challenge) => `
              <div class="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <span class="font-medium">${getPlayerName(challenge.challengerId)} fordert ${getPlayerName(challenge.challengedId)} heraus</span>
                  <span class="text-sm text-gray-500">Offen</span>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
        `
            : ""
        }
        
        ${state.user && levels.length > 0 && !state.pyramidLoading ? DoublesMatchEntry() : ""}
      </div>
    </div>`;
}
