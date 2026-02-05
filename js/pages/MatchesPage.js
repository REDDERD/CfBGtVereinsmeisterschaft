// js/pages/MatchesPage.js
// Seite für alle Spiele (Einzel und Doppel) mit Toggle-Filter

function MatchesPage() {
  // Filtere und kombiniere alle Spiele
  const allMatches = [];
  
  // Einzelspiele (inkl. KO-Spiele)
  if (state.matchTypeFilters.showSingles) {
    const singlesMatches = state.singlesMatches.map(match => ({
      ...match,
      type: 'singles'
    }));
    allMatches.push(...singlesMatches);
  }
  
  // Doppelspiele
  if (state.matchTypeFilters.showDoubles) {
    const doublesMatches = state.doublesMatches.map(match => ({
      ...match,
      type: 'doubles'
    }));
    allMatches.push(...doublesMatches);
  }
  
  // Filtern nach Suchbegriff
  const searchQuery = state.matchesSearchQuery || '';
  const filteredMatches = allMatches.filter(match => {
    if (!searchQuery) return true;
    
    if (match.type === 'singles') {
      const p1Name = getPlayerName(match.player1Id).toLowerCase();
      const p2Name = getPlayerName(match.player2Id).toLowerCase();
      return p1Name.includes(searchQuery.toLowerCase()) || p2Name.includes(searchQuery.toLowerCase());
    } else {
      const names = [
        match.team1.player1Id,
        match.team1.player2Id,
        match.team2.player1Id,
        match.team2.player2Id
      ].map(id => getPlayerName(id).toLowerCase());
      return names.some(n => n.includes(searchQuery.toLowerCase()));
    }
  });
  
  // Sortieren nach Datum (neueste zuerst)
  filteredMatches.sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0));
  
  return `
    <div class="space-y-6">
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Spiele</h2>
        
        <!-- Toggle-Filter für Spieltypen -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 class="font-semibold text-gray-700 mb-3">Filter nach Spieltyp</h4>
          <div class="flex flex-wrap gap-2">
            <button 
              onclick="toggleMatchTypeFilter('singles')" 
              class="px-4 py-2 rounded-lg border-2 transition-colors ${
                state.matchTypeFilters.showSingles
                  ? 'bg-yellow-100 border-yellow-400 text-yellow-800 font-semibold'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
              }">
              Einzel
            </button>
            <button 
              onclick="toggleMatchTypeFilter('doubles')" 
              class="px-4 py-2 rounded-lg border-2 transition-colors ${
                state.matchTypeFilters.showDoubles
                  ? 'bg-blue-100 border-blue-400 text-blue-800 font-semibold'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
              }">
              Doppel
            </button>
          </div>
        </div>
        
        <!-- Suchfeld und Export -->
        <div class="mb-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <input 
            type="text" 
            id="matchesSearchInput" 
            placeholder="Nach Spielername suchen..." 
            value="${searchQuery}" 
            onkeyup="updateMatchesSearch(this.value)" 
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
          ${state.user ? `
            <button 
              onclick="exportAllMatches()" 
              class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
              Excel Export
            </button>
          ` : ''}
        </div>
        
        <!-- Spiele-Liste -->
        <div class="space-y-3">
          ${filteredMatches.length === 0 ? `
            <p class="text-gray-500 text-center py-8">
              ${allMatches.length === 0 ? 'Keine Spiele gefunden' : 'Keine Spiele mit den ausgewählten Filtern gefunden'}
            </p>
          ` : filteredMatches.map(match => MatchCard(match, 'matches')).join('')}
        </div>
      </div>
    </div>`;
}