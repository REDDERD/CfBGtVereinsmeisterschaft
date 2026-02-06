// js/pages/admin/AdminMatchApprovalTab.js
// Admin-Tab: Spiele-Verwaltung und Bestätigung

function AdminMatchApprovalTab() {
  // Filtere Spiele basierend auf Spieltyp
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

  // Filtere nach Status
  const statusFiltered = allMatches.filter((match) => {
    const status = match.status || "confirmed";
    if (status === "unconfirmed" && state.matchApprovalFilters.showUnconfirmed) return true;
    if (status === "confirmed" && state.matchApprovalFilters.showConfirmed) return true;
    if (status === "rejected" && state.matchApprovalFilters.showRejected) return true;
    return false;
  });

  // Filtern nach Suchbegriff
  const searchQuery = state.adminMatchesSearchQuery || "";
  const filteredMatches = statusFiltered.filter((match) => {
    if (!searchQuery) return true;

    if (match.type === "singles") {
      const p1Name = getPlayerName(match.player1Id).toLowerCase();
      const p2Name = getPlayerName(match.player2Id).toLowerCase();
      return (
        p1Name.includes(searchQuery.toLowerCase()) ||
        p2Name.includes(searchQuery.toLowerCase())
      );
    } else {
      const names = [
        match.team1.player1Id,
        match.team1.player2Id,
        match.team2.player1Id,
        match.team2.player2Id,
      ].map((id) => getPlayerName(id).toLowerCase());
      return names.some((n) => n.includes(searchQuery.toLowerCase()));
    }
  });

  // Sortieren nach Datum
  filteredMatches.sort((a, b) => {
    const aTime = a.date?.seconds || 0;
    const bTime = b.date?.seconds || 0;
    return bTime - aTime;
  });

  return `
    <div>
      <!-- Toggle-Filter für Spieltypen -->
      <div class="bg-gray-50 rounded-lg p-4 mb-6">
        
        <div class="flex flex-wrap gap-2 mb-4">
          <button 
            onclick="toggleAdminMatchTypeFilter('singles')" 
            class="px-4 py-2 rounded-lg border-2 transition-colors ${
              state.adminMatchTypeFilters.showSingles
                ? "bg-yellow-100 border-yellow-400 text-yellow-800 font-semibold"
                : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
            }">
            Einzel
          </button>
          <button 
            onclick="toggleAdminMatchTypeFilter('doubles')" 
            class="px-4 py-2 rounded-lg border-2 transition-colors ${
              state.adminMatchTypeFilters.showDoubles
                ? "bg-blue-100 border-blue-400 text-blue-800 font-semibold"
                : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
            }">
            Doppel
          </button>
        </div>

        <!-- Status-Filter -->
        <div class="flex flex-wrap gap-2 mb-4">
          <button 
            onclick="toggleMatchStatusFilter('unconfirmed')" 
            class="px-4 py-2 rounded-lg border-2 transition-colors ${state.matchApprovalFilters.showUnconfirmed ? "bg-orange-100 border-orange-400 text-orange-800 font-semibold" : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"}">
            Unbestätigt
          </button>
          <button 
            onclick="toggleMatchStatusFilter('confirmed')" 
            class="px-4 py-2 rounded-lg border-2 transition-colors ${state.matchApprovalFilters.showConfirmed ? "bg-green-100 border-green-400 text-green-800 font-semibold" : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"}">
            Bestätigt
          </button>
          <button 
            onclick="toggleMatchStatusFilter('rejected')" 
            class="px-4 py-2 rounded-lg border-2 transition-colors ${state.matchApprovalFilters.showRejected ? "bg-red-100 border-red-400 text-red-800 font-semibold" : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"}">
            Abgelehnt
          </button>
        </div>

        <!-- Suchfeld -->
        <div>
          <input 
            type="text" 
            id="adminMatchesSearchInput" 
            placeholder="Nach Spielername suchen..." 
            value="${searchQuery}" 
            onkeyup="updateAdminMatchesSearch(this.value)" 
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
        </div>

      </div>

      <!-- Spiele-Liste -->
      ${
        filteredMatches.length === 0
          ? `
        <div class="text-center py-12 bg-gray-50 rounded-lg">
          <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <p class="text-gray-600">Keine Spiele mit den ausgewählten Filtern gefunden</p>
        </div>
      `
          : `
        <div class="space-y-3">
          ${filteredMatches.map((match) => MatchCard(match, "admin")).join("")}
        </div>
      `
      }
    </div>`;
}
