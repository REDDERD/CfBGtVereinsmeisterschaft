// js/pages/ChallengesPage.js
// Herausforderungen-Seite - Mobile-First

function ChallengesPage() {
  return `
    <div class="space-y-4 sm:space-y-6">
      <div class="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4">Herausforderungen</h2>

        <div class="mb-4 flex gap-2">
          <button onclick="setChallengesView('singles')" class="flex-1 px-3 sm:px-6 py-2.5 rounded-lg font-semibold transition-all text-sm sm:text-base ${
            state.challengesView === "singles"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
          }">
            Einzel
          </button>
          <button onclick="setChallengesView('doubles')" class="flex-1 px-3 sm:px-6 py-2.5 rounded-lg font-semibold transition-all text-sm sm:text-base ${
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
