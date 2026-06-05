// js/pages/SinglesPage.js

function SinglesPage() {
  const group1 = calculateStandings(1);
  const group2 = calculateStandings(2);

  return `
    <div class="space-y-4 sm:space-y-6">
      <div class="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Einzel-Turnier</h2>

        ${state.knockoutPhaseActive ? `
          <div class="mb-4 flex gap-2">
            <button onclick="showFrozenGroupPhase()" class="flex-1 px-3 sm:px-6 py-2.5 rounded-lg font-semibold transition-all text-sm sm:text-base ${state.singlesView === "group" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}">
              Gruppen
            </button>
            <button onclick="setSinglesView('knockout')" class="flex-1 px-3 sm:px-6 py-2.5 rounded-lg font-semibold transition-all text-sm sm:text-base ${state.singlesView === "knockout" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}">
              K.O.-Phase
            </button>
          </div>
        ` : ""}

        ${state.singlesView === "group" ? `
          ${state.knockoutPhaseActive && state.frozenStandings ? `
            <div class="mb-3 p-2.5 bg-blue-50 border border-blue-300 rounded-lg">
              <p class="text-xs sm:text-sm text-blue-800">Stand zum Zeitpunkt des K.O.-Phasen-Starts.</p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-4">
              ${FrozenGroupTable(1, state.frozenStandings.group1)}
              ${FrozenGroupTable(2, state.frozenStandings.group2)}
            </div>
          ` : `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-4">
              ${state.matchesLoading ? `
                ${[1, 2].map(() => `
                  <div class="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <div class="skeleton h-6 w-24 mb-3 rounded"></div>
                    <div class="flex gap-2 pb-2 mb-1 border-b border-gray-200">
                      <div class="skeleton h-3 w-4"></div>
                      <div class="skeleton h-3 flex-1"></div>
                      <div class="skeleton h-3 w-6"></div>
                      <div class="skeleton h-3 w-6"></div>
                    </div>
                    ${[0,1,2,3].map(() => `
                      <div class="flex items-center gap-2 py-2 border-b border-gray-200">
                        <div class="skeleton h-4 w-4 flex-shrink-0"></div>
                        <div class="skeleton h-4 flex-1"></div>
                        <div class="skeleton h-4 w-8"></div>
                        <div class="skeleton h-4 w-6"></div>
                      </div>
                    `).join('')}
                  </div>
                `).join('')}
              ` : `
              ${GroupTable(1, group1)}
              ${GroupTable(2, group2)}
              `}
            </div>
            ${state.user && !isReadOnly() && !state.knockoutPhaseActive ? SinglesMatchEntry() : !state.knockoutPhaseActive && !isReadOnly() ? `
              <div class="mt-4 p-2 bg-blue-100 border border-blue-400 rounded text-xs sm:text-sm text-blue-800 flex items-center gap-2">
                ${icons.info} <span>Um Ergebnisse einzutragen, bitte einloggen.</span>
              </div>
            ` : ""}
          `}
        ` : `
          ${KnockoutBracketView()}
        `}
      </div>
    </div>`;
}
