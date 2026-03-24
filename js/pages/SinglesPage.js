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
              ${GroupTable(1, group1)}
              ${GroupTable(2, group2)}
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
