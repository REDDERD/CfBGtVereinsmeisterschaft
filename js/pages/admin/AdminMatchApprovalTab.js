// js/pages/admin/AdminMatchApprovalTab.js
// Admin-Tab: Spiele-Verwaltung und Bestätigung - Mobile-First

function AdminMatchApprovalTab() {
  const allMatches = [];

  if (state.adminMatchTypeFilters.showSingles) {
    state.singlesMatches.forEach((match) => {
      allMatches.push({ ...match, type: "singles" });
    });
  }

  if (state.adminMatchTypeFilters.showDoubles) {
    state.doublesMatches.forEach((match) => {
      allMatches.push({ ...match, type: "doubles" });
    });
  }

  const statusFiltered = allMatches.filter((match) => {
    const status = match.status || "confirmed";
    if (status === "unconfirmed" && state.matchApprovalFilters.showUnconfirmed) return true;
    if (status === "confirmed" && state.matchApprovalFilters.showConfirmed) return true;
    if (status === "rejected" && state.matchApprovalFilters.showRejected) return true;
    return false;
  });

  const searchQuery = state.adminMatchesSearchQuery || "";
  const filteredMatches = statusFiltered.filter((match) => {
    if (!searchQuery) return true;

    if (match.type === "singles") {
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
    const aTime = a.date?.seconds || 0;
    const bTime = b.date?.seconds || 0;
    return bTime - aTime;
  });

  return `
    <div>
      <div class="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
        <!-- Type filters -->
        <div class="flex gap-2 mb-3">
          <button
            onclick="toggleAdminMatchTypeFilter('singles')"
            class="flex-1 px-3 py-2 rounded-lg border-2 transition-colors text-xs sm:text-sm font-medium ${
              state.adminMatchTypeFilters.showSingles
                ? "bg-yellow-100 border-yellow-400 text-yellow-800"
                : "bg-white border-gray-300 text-gray-700"
            }">
            Einzel
          </button>
          <button
            onclick="toggleAdminMatchTypeFilter('doubles')"
            class="flex-1 px-3 py-2 rounded-lg border-2 transition-colors text-xs sm:text-sm font-medium ${
              state.adminMatchTypeFilters.showDoubles
                ? "bg-blue-100 border-blue-400 text-blue-800"
                : "bg-white border-gray-300 text-gray-700"
            }">
            Doppel
          </button>
        </div>

        <!-- Status filters -->
        <div class="flex gap-1.5 mb-3">
          <button
            onclick="toggleMatchStatusFilter('unconfirmed')"
            class="flex-1 px-2 py-1.5 rounded-lg border-2 transition-colors text-xs font-medium ${
              state.matchApprovalFilters.showUnconfirmed
                ? "bg-orange-100 border-orange-400 text-orange-800"
                : "bg-white border-gray-300 text-gray-600"
            }">
            Offen
          </button>
          <button
            onclick="toggleMatchStatusFilter('confirmed')"
            class="flex-1 px-2 py-1.5 rounded-lg border-2 transition-colors text-xs font-medium ${
              state.matchApprovalFilters.showConfirmed
                ? "bg-green-100 border-green-400 text-green-800"
                : "bg-white border-gray-300 text-gray-600"
            }">
            Bestätigt
          </button>
          <button
            onclick="toggleMatchStatusFilter('rejected')"
            class="flex-1 px-2 py-1.5 rounded-lg border-2 transition-colors text-xs font-medium ${
              state.matchApprovalFilters.showRejected
                ? "bg-red-100 border-red-400 text-red-800"
                : "bg-white border-gray-300 text-gray-600"
            }">
            Abgelehnt
          </button>
        </div>

        <input
          type="text"
          id="adminMatchesSearchInput"
          placeholder="Spieler suchen..."
          value="${searchQuery}"
          onkeyup="updateAdminMatchesSearch(this.value)"
          class="w-full px-3 py-2.5 border border-gray-300 rounded-lg">
      </div>

      ${
        filteredMatches.length === 0
          ? `
        <div class="text-center py-8 bg-gray-50 rounded-lg">
          <svg class="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <p class="text-gray-500 text-sm">Keine Spiele gefunden</p>
        </div>
      `
          : `
        <div class="space-y-2">
          ${filteredMatches.map((match) => MatchCard(match, "admin")).join("")}
        </div>
      `
      }
    </div>`;
}
