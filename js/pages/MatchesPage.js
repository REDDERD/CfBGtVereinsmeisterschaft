// js/pages/MatchesPage.js
// Seite für alle Spiele (Einzel und Doppel)

function MatchesPage() {
  return `
    <div class="space-y-6">
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Spiele</h2>
        
        <div class="mb-6 flex flex-col sm:flex-row gap-2">
          <button onclick="setMatchesView('singles')" class="flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
            state.matchesView === "singles"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
          }">
            Einzel
          </button>
          <button onclick="setMatchesView('doubles')" class="flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
            state.matchesView === "doubles"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
          }">
            Doppel
          </button>
        </div>
        
        ${state.matchesView === "singles" ? MatchesSinglesTab() : MatchesDoublesTab()}
      </div>
    </div>`;
}

function MatchesSinglesTab() {
  const searchQuery = state.singlesSearchQuery || "";
  const filteredMatches = state.singlesMatches.filter((match) => {
    if (!searchQuery) return true;
    const p1Name = getPlayerName(match.player1Id).toLowerCase();
    const p2Name = getPlayerName(match.player2Id).toLowerCase();
    return p1Name.includes(searchQuery.toLowerCase()) || p2Name.includes(searchQuery.toLowerCase());
  });

  return `
    <div>
      <div class="mb-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
        <input type="text" id="singlesSearchInput" placeholder="Nach Spielername suchen..." value="${searchQuery}" onkeyup="updateSinglesSearch(this.value)" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg">
        ${state.user ? `<button onclick="exportSinglesMatches()" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Excel Export</button>` : ""}
      </div>
      <div class="space-y-3">
        ${filteredMatches.length === 0 ? `<p class="text-gray-500 text-center py-8">Keine Spiele gefunden</p>` :
          filteredMatches.map((match) => {
            const p1Name = getPlayerName(match.player1Id);
            const p2Name = getPlayerName(match.player2Id);
            const scoreText = match.sets ? match.sets.map((s) => `${s.p1}:${s.p2}`).join(", ") : "Ausstehend";
            let p1Sets = 0, p2Sets = 0;
            if (match.sets) match.sets.forEach((set) => { if (set.p1 > set.p2) p1Sets++; else p2Sets++; });
            const dateStr = match.date ? new Date(match.date.toDate()).toLocaleDateString("de-DE") : "";
            return `
              <div class="p-4 bg-white border border-gray-200 rounded-lg">
                <div class="font-semibold text-gray-800">${p1Name} <span class="text-indigo-600 font-bold">${p1Sets}</span> : <span class="text-indigo-600 font-bold">${p2Sets}</span> ${p2Name}</div>
                <div class="text-sm text-gray-500 mt-1">${scoreText}</div>
                ${dateStr ? `<div class="text-xs text-gray-400 mt-1">${dateStr}</div>` : ""}
              </div>`;
          }).join("")}
      </div>
    </div>`;
}

function MatchesDoublesTab() {
  const searchQuery = state.doublesSearchQuery || "";
  const filteredMatches = state.doublesMatches.filter((match) => {
    if (!searchQuery) return true;
    const names = [match.team1.player1Id, match.team1.player2Id, match.team2.player1Id, match.team2.player2Id]
      .map((id) => getPlayerName(id).toLowerCase());
    return names.some((n) => n.includes(searchQuery.toLowerCase()));
  });

  return `
    <div>
      <div class="mb-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
        <input type="text" id="doublesSearchInput" placeholder="Nach Spielername suchen..." value="${searchQuery}" onkeyup="updateDoublesSearch(this.value)" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg">
        ${state.user ? `<button onclick="exportDoublesMatches()" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Excel Export</button>` : ""}
      </div>
      <div class="space-y-3">
        ${filteredMatches.length === 0 ? `<p class="text-gray-500 text-center py-8">Keine Spiele gefunden</p>` :
          filteredMatches.map((match) => {
            const t1 = `${getPlayerName(match.team1.player1Id)} / ${getPlayerName(match.team1.player2Id)}`;
            const t2 = `${getPlayerName(match.team2.player1Id)} / ${getPlayerName(match.team2.player2Id)}`;
            const scoreText = match.sets ? match.sets.map((s) => `${s.t1}:${s.t2}`).join(", ") : "Ausstehend";
            let t1Sets = 0, t2Sets = 0;
            if (match.sets) match.sets.forEach((set) => { if (set.t1 > set.t2) t1Sets++; else t2Sets++; });
            const dateStr = match.date ? new Date(match.date.toDate()).toLocaleDateString("de-DE") : "";
            return `
              <div class="p-4 bg-white border border-gray-200 rounded-lg">
                <div class="font-semibold text-gray-800">${t1} <span class="text-indigo-600 font-bold">${t1Sets}</span> : <span class="text-indigo-600 font-bold">${t2Sets}</span> ${t2}</div>
                <div class="text-sm text-gray-500 mt-1">${scoreText}</div>
                ${dateStr ? `<div class="text-xs text-gray-400 mt-1">${dateStr}</div>` : ""}
              </div>`;
          }).join("")}
      </div>
    </div>`;
}
