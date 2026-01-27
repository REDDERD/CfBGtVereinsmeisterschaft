// js/pages/SinglesPage.js

function SinglesPage() {
  const group1 = calculateStandings(1);
  const group2 = calculateStandings(2);

  // Automatisch K.O.-Phase anzeigen wenn aktiv
  if (state.knockoutPhaseActive && state.singlesView === "group") {
    state.singlesView = "knockout";
  }

  return `
    <div class="space-y-6">
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Einzel-Turnier</h2>
        
        ${state.knockoutPhaseActive ? `
          <div class="mb-6 flex flex-col sm:flex-row gap-2">
            <button onclick="showFrozenGroupPhase()" class="flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${state.singlesView === "group" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}">
              Gruppenphase (beendet)
            </button>
            <button onclick="setSinglesView('knockout')" class="flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${state.singlesView === "knockout" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}">
              K.O.-Phase
            </button>
          </div>
        ` : ""}
        
        ${state.singlesView === "group" ? `
          ${state.knockoutPhaseActive && state.frozenStandings ? `
            <div class="mb-4 p-3 bg-blue-50 border border-blue-300 rounded-lg">
              <p class="text-sm text-blue-800">📋 Diese Tabelle zeigt den Stand zum Zeitpunkt des Starts der K.O.-Phase.</p>
            </div>
            <div class="grid md:grid-cols-2 gap-6 mb-6">
              ${FrozenGroupTable(1, state.frozenStandings.group1)}
              ${FrozenGroupTable(2, state.frozenStandings.group2)}
            </div>
          ` : `
            <div class="grid md:grid-cols-2 gap-6 mb-6">
              ${GroupTable(1, group1)}
              ${GroupTable(2, group2)}
            </div>
            ${state.user ? SinglesMatchEntry() : ""}
          `}
        ` : `
          ${KnockoutBracketView()}
        `}
      </div>
    </div>`;
}