// js/pages/ChallengesPage.js
// Herausforderungen-Seite: Orchestriert Einzel und Doppel Tabs

function ChallengesPage() {
  return `
    <div class="space-y-6">
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Herausforderungen</h2>
        
        <div class="mb-6 flex flex-col sm:flex-row gap-2">
          <button onclick="setChallengesView('singles')" class="flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
            state.challengesView === "singles"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
          }">
            Einzel
          </button>
          <button onclick="setChallengesView('doubles')" class="flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
            state.challengesView === "doubles"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
          }">
            Doppel
          </button>
        </div>
        
        ${state.challengesView === "singles" ? ChallengesSinglesTab() : ChallengesDoublesTab()}
      </div>
    </div>`;
}
