// js/pages/MatchesPage.js
// Seite für alle Spiele (Einzel, Doppel und KO) mit Toggle-Filter

function MatchesPage() {
  // Filtere und kombiniere alle Spiele
  const allMatches = [];
  const displaySettings = state.matchesDisplaySettings || { showUnconfirmedSingles: false, showUnconfirmedDoubles: false };

  // Einzelspiele (Gruppenphase)
  if (state.matchTypeFilters.showSingles) {
    const singlesMatches = state.singlesMatches
      .filter((match) => {
        // Zeige bestätigte Spiele immer
        if (match.status === 'confirmed' || !match.status) return true;
        // Zeige unbestätigte Spiele nur, wenn Einstellung aktiviert
        if (match.status === 'unconfirmed') return displaySettings.showUnconfirmedSingles;
        // Zeige abgelehnte Spiele nicht
        return false;
      })
      .map((match) => ({
        ...match,
        type: "singles",
      }));
    allMatches.push(...singlesMatches);
  }

  // KO-Spiele (sind auch Einzelspiele)
  if (state.matchTypeFilters.showSingles) {
    const knockoutMatches = state.knockoutMatches
      .filter((match) => {
        // Zeige bestätigte Spiele immer
        if (match.status === 'confirmed' || !match.status) return true;
        // Zeige unbestätigte Spiele nur, wenn Einstellung aktiviert
        if (match.status === 'unconfirmed') return displaySettings.showUnconfirmedSingles;
        // Zeige abgelehnte Spiele nicht
        return false;
      })
      .map((match) => ({
        ...match,
        type: "knockout",
      }));
    allMatches.push(...knockoutMatches);
  }

  // Doppelspiele
  if (state.matchTypeFilters.showDoubles) {
    const doublesMatches = state.doublesMatches
      .filter((match) => {
        // Zeige bestätigte Spiele immer
        if (match.status === 'confirmed' || !match.status) return true;
        // Zeige unbestätigte Spiele nur, wenn Einstellung aktiviert
        if (match.status === 'unconfirmed') return displaySettings.showUnconfirmedDoubles;
        // Zeige abgelehnte Spiele nicht
        return false;
      })
      .map((match) => ({
        ...match,
        type: "doubles",
      }));
    allMatches.push(...doublesMatches);
  }

  // Filtern nach Suchbegriff
  const searchQuery = state.matchesSearchQuery || "";
  const filteredMatches = allMatches.filter((match) => {
    if (!searchQuery) return true;

    if (match.type === "singles" || match.type === "knockout") {
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

  // Sortieren nach Datum (neueste zuerst)
  filteredMatches.sort((a, b) => {
    const aTime = a.date?.seconds || a.createdAt?.seconds || 0;
    const bTime = b.date?.seconds || b.createdAt?.seconds || 0;
    return bTime - aTime;
  });

  return `
    <div class="space-y-6">
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Spiele</h2>
        
        <!-- Toggle-Filter für Spieltypen -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <div class="flex flex-wrap gap-2  mb-4">
            <button 
              onclick="toggleMatchTypeFilter('singles')" 
              class="px-4 py-2 rounded-lg border-2 transition-colors ${
                state.matchTypeFilters.showSingles
                  ? "bg-yellow-100 border-yellow-400 text-yellow-800 font-semibold"
                  : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
              }">
              Einzel
            </button>
            <button 
              onclick="toggleMatchTypeFilter('doubles')" 
              class="px-4 py-2 rounded-lg border-2 transition-colors ${
                state.matchTypeFilters.showDoubles
                  ? "bg-blue-100 border-blue-400 text-blue-800 font-semibold"
                  : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
              }">
              Doppel
            </button>
          </div>

          <!-- Suchfeld -->
          <div>
            <input 
              type="text" 
              id="matchesSearchInput" 
              placeholder="Nach Spielername suchen..." 
              value="${searchQuery}" 
              onkeyup="updateMatchesSearch(this.value)" 
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
          </div>
        </div>
        

        
        <!-- Spiele-Liste -->
        <div class="space-y-3">
          ${
            filteredMatches.length === 0
              ? `
            <p class="text-gray-500 text-center py-8">
              ${allMatches.length === 0 ? "Keine Spiele gefunden" : "Keine Spiele mit den ausgewählten Filtern gefunden"}
            </p>
          `
              : filteredMatches
                  .map((match) => MatchCard(match, "matches"))
                  .join("")
          }
        </div>
      </div>
    </div>`;
}