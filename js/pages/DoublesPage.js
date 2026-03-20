// js/pages/DoublesPage.js

function DoublesPage() {
  const levels = state.pyramid.levels || [];

  return `
    <div class="space-y-4 sm:space-y-6">
      <div class="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div class="flex items-center justify-between mb-4 sm:mb-6 gap-3">
          <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Doppel-Pyramide</h2>

          ${
            levels.length > 0
              ? `
          <button
            onclick="togglePoolVisualization()"
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border transition-colors ${state.doublesPoolVisualization ? "bg-indigo-100 border-indigo-300 text-indigo-700" : "bg-gray-50 border-gray-200 text-gray-600"}"
            role="switch"
            aria-checked="${state.doublesPoolVisualization}">
            <span class="font-medium">Pools</span>
            <div class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${state.doublesPoolVisualization ? "bg-indigo-600" : "bg-gray-300"}">
              <span class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${state.doublesPoolVisualization ? "translate-x-4" : "translate-x-0.5"}"></span>
            </div>
          </button>
          `
              : ""
          }
        </div>

        <div class="mb-4 sm:mb-6">
          ${
            state.pyramidLoading
              ? `
            <div class="text-center py-8 bg-gray-50 rounded-lg">
              <div class="flex flex-col items-center justify-center">
                <svg class="animate-spin h-10 w-10 text-indigo-600 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="text-gray-600 font-medium text-sm">Pyramide wird aktualisiert...</p>
              </div>
            </div>
          `
              : levels.length === 0 && !state.pyramidInitialized
                ? `
            <div class="text-center py-8 bg-gray-50 rounded-lg">
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
            <div class="space-y-1.5 sm:space-y-2">
              ${levels
                .map(
                  (level, levelIdx) => `
                <div class="flex flex-wrap justify-center items-center gap-1 sm:gap-2">
                  ${level
                    .map((playerId, posIdx) => {
                      const player = state.players.find(
                        (p) => p.id === playerId,
                      );
                      const pool = player?.doublesPool;

                      let colorClasses =
                        "from-yellow-100 to-orange-100 border-yellow-400";
                      if (state.doublesPoolVisualization && pool) {
                        if (pool === "A") {
                          colorClasses =
                            "from-blue-100 to-blue-200 border-blue-400";
                        } else if (pool === "B") {
                          colorClasses =
                            "from-green-100 to-green-200 border-green-400";
                        }
                      }

                      // Calculate dynamic width based on level size
                      // On mobile: items should be smaller to fit more per row
                      const name = getPlayerName(playerId);
                      const shortName = name.length > 12 ? name.substring(0, 11) + '.' : name;

                      return `
                    <div class="bg-gradient-to-r ${colorClasses} border-2 rounded-lg px-2 py-1.5 sm:px-4 sm:py-2.5 text-center shadow-sm transition-all duration-300" style="min-width: ${level.length > 4 ? '70px' : level.length > 3 ? '80px' : '90px'}">
                      <div class="font-bold text-gray-800 text-xs sm:text-sm leading-tight" title="${name}">
                        <span class="sm:hidden">${shortName}</span>
                        <span class="hidden sm:inline">${name}</span>
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
        <div class="mb-4 sm:mb-6">
          <h3 class="text-lg font-semibold mb-2">Anstehende Herausforderungen</h3>
          <div class="space-y-2">
            ${state.challenges
              .map(
                (challenge) => `
              <div class="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
                  <span class="font-medium text-sm sm:text-base">${getPlayerName(challenge.challengerId)} fordert ${getPlayerName(challenge.challengedId)} heraus</span>
                  <span class="text-xs text-gray-500">Offen</span>
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
