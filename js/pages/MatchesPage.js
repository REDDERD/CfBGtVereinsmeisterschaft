// js/pages/MatchesPage.js
// Seite für alle Spiele - Mobile-First

function MatchesPage() {
  const allMatches = [];
  const displaySettings = state.matchesDisplaySettings || { showUnconfirmedSingles: false, showUnconfirmedDoubles: false };

  if (state.matchTypeFilters.showSingles) {
    const singlesMatches = state.singlesMatches
      .filter((match) => {
        if (match.status === 'confirmed' || !match.status) return true;
        if (match.status === 'unconfirmed') return displaySettings.showUnconfirmedSingles;
        return false;
      })
      .map((match) => ({ ...match, type: "singles" }));
    allMatches.push(...singlesMatches);
  }

  if (state.matchTypeFilters.showSingles) {
    const knockoutMatches = state.knockoutMatches
      .filter((match) => {
        if (match.status === 'confirmed' || !match.status) return true;
        if (match.status === 'unconfirmed') return displaySettings.showUnconfirmedSingles;
        return false;
      })
      .map((match) => ({ ...match, type: "knockout" }));
    allMatches.push(...knockoutMatches);
  }

  if (state.matchTypeFilters.showDoubles) {
    const doublesMatches = state.doublesMatches
      .filter((match) => {
        if (match.status === 'confirmed' || !match.status) return true;
        if (match.status === 'unconfirmed') return displaySettings.showUnconfirmedDoubles;
        return false;
      })
      .map((match) => ({ ...match, type: "doubles" }));
    allMatches.push(...doublesMatches);
  }

  const searchQuery = state.matchesSearchQuery || "";
  const filteredMatches = allMatches.filter((match) => {
    if (!searchQuery) return true;

    if (match.type === "singles" || match.type === "knockout") {
      const p1Name = getPlayerName(match.player1Id).toLowerCase();
      const p2Name = getPlayerName(match.player2Id).toLowerCase();
      return p1Name.includes(searchQuery.toLowerCase()) || p2Name.includes(searchQuery.toLowerCase());
    } else {
      const names = [
        match.team1.player1Id, match.team1.player2Id,
        match.team2.player1Id, match.team2.player2Id,
      ].map((id) => getPlayerName(id).toLowerCase());
      return names.some((n) => n.includes(searchQuery.toLowerCase()));
    }
  });

  filteredMatches.sort((a, b) => {
    const aTime = a.date?.seconds || a.createdAt?.seconds || 0;
    const bTime = b.date?.seconds || b.createdAt?.seconds || 0;
    return bTime - aTime;
  });

  return `
    <div class="space-y-4 sm:space-y-6">
      <div class="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4">Spiele</h2>

        <div class="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
          <div class="flex gap-2 mb-3">
            <button
              onclick="toggleMatchTypeFilter('singles')"
              class="flex-1 px-3 py-2 rounded-lg border-2 transition-colors text-sm font-medium ${
                state.matchTypeFilters.showSingles
                  ? "bg-yellow-100 border-yellow-400 text-yellow-800"
                  : "bg-white border-gray-300 text-gray-700"
              }">
              Einzel
            </button>
            <button
              onclick="toggleMatchTypeFilter('doubles')"
              class="flex-1 px-3 py-2 rounded-lg border-2 transition-colors text-sm font-medium ${
                state.matchTypeFilters.showDoubles
                  ? "bg-blue-100 border-blue-400 text-blue-800"
                  : "bg-white border-gray-300 text-gray-700"
              }">
              Doppel
            </button>
          </div>

          <input
            type="text"
            id="matchesSearchInput"
            placeholder="Spieler suchen..."
            value="${searchQuery}"
            onkeyup="updateMatchesSearch(this.value)"
            class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
        </div>

        <div class="space-y-2">
          ${
            filteredMatches.length === 0
              ? `<p class="text-gray-500 text-center py-6 text-sm">Keine Spiele gefunden</p>`
              : filteredMatches.map((match) => MatchCard(match, "matches")).join("")
          }
        </div>
      </div>
    </div>`;
}
