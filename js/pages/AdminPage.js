// js/pages/AdminPage.js

function AdminPage() {
  if (!state.user) {
    return `
      <div class="max-w-md mx-auto">
        <div class="bg-white rounded-xl shadow-lg p-8">
          <h2 class="text-xl md:text-2xl font-bold text-gray-800 mb-6">Admin Login</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input type="email" id="loginEmail" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="admin@verein.de">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Passwort</label>
              <input type="password" id="loginPassword" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Passwort">
            </div>
            <div id="loginError" class="text-red-500 text-sm hidden"></div>
            <button onclick="handleLogin()" class="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors">Anmelden</button>
          </div>
        </div>
      </div>`;
  }

  const tabs = [
    { id: "players", label: "Spieler" },
    { id: "singlesTable", label: "Einzel" },
    { id: "doublesRanking", label: "Doppel" },
  ];

  return `
    <div class="space-y-6">
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Admin-Bereich</h2>
        
        <div class="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-2">
          ${tabs.map((tab) => `
            <button onclick="setAdminTab('${tab.id}')" class="px-4 py-2 text-left sm:text-center rounded-t ${state.adminTab === tab.id ? "bg-indigo-600 text-white font-semibold" : "text-gray-600 hover:bg-gray-100"}">
              ${tab.label}
            </button>
          `).join("")}
        </div>

        ${state.adminTab === "players" ? AdminPlayersTab() : ""}
        ${state.adminTab === "singlesTable" ? AdminSinglesTableTab() : ""}
        ${state.adminTab === "doublesRanking" ? AdminDoublesRankingTab() : ""}
      </div>
    </div>`;
}

function AdminPlayersTab() {
  return `
    <div>
      <div class="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 class="font-semibold text-gray-800 mb-3">Neuen Spieler hinzufügen</h4>
        <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <input type="text" id="playerName" placeholder="Name" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg">
          <button onclick="addPlayer()" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Hinzufügen</button>
        </div>
      </div>
      
      <div class="space-y-3">
        ${state.players.map((player) => state.editingPlayer === player.id ? `
          <div class="p-4 bg-blue-50 border-2 border-blue-500 rounded-lg">
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" id="editName_${player.id}" value="${player.name}" class="w-full px-3 py-2 border rounded-lg">
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Einzel-Gruppe</label>
                  <select id="editSingles_${player.id}" class="w-full px-3 py-2 border rounded-lg">
                    <option value="">Nicht dabei</option>
                    <option value="1" ${player.singlesGroup === 1 ? "selected" : ""}>Gruppe 1</option>
                    <option value="2" ${player.singlesGroup === 2 ? "selected" : ""}>Gruppe 2</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Doppel-Pool</label>
                  <select id="editDoubles_${player.id}" class="w-full px-3 py-2 border rounded-lg">
                    <option value="">Nicht dabei</option>
                    <option value="A" ${player.doublesPool === "A" ? "selected" : ""}>Pool A (stark)</option>
                    <option value="B" ${player.doublesPool === "B" ? "selected" : ""}>Pool B (schwach)</option>
                  </select>
                </div>
              </div>
              <div class="flex space-x-2">
                <button onclick="savePlayer('${player.id}')" class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Speichern</button>
                <button onclick="cancelEdit()" class="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500">Abbrechen</button>
              </div>
            </div>
          </div>
        ` : `
          <div class="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300">
            <div>
              <span class="font-medium text-gray-800 break-words">${player.name}</span>
              <div class="text-sm text-gray-500 mt-1">
                ${player.singlesGroup ? `Einzel: Gruppe ${player.singlesGroup}` : ""}
                ${player.singlesGroup && player.doublesPool ? " • " : ""}
                ${player.doublesPool ? `Doppel: Pool ${player.doublesPool}` : ""}
                ${!player.singlesGroup && !player.doublesPool ? "Nimmt nicht teil" : ""}
              </div>
            </div>
            <div class="flex space-x-2">
              <button onclick="editPlayer('${player.id}')" class="p-2 text-blue-600 hover:bg-blue-50 rounded">${icons.edit}</button>
              <button onclick="deletePlayer('${player.id}')" class="p-2 text-red-600 hover:bg-red-50 rounded">${icons.trash}</button>
            </div>
          </div>
        `).join("")}
      </div>
    </div>`;
}

function AdminSinglesTab() {
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
        <button onclick="exportSinglesMatches()" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Excel Export</button>
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

function AdminSinglesTableTab() {
  const group1 = calculateStandings(1);
  const group2 = calculateStandings(2);
  const positions = [
    { value: "g1p1", label: "1. Platz Gruppe 1" }, { value: "g1p2", label: "2. Platz Gruppe 1" },
    { value: "g1p3", label: "3. Platz Gruppe 1" }, { value: "g1p4", label: "4. Platz Gruppe 1" },
    { value: "g2p1", label: "1. Platz Gruppe 2" }, { value: "g2p2", label: "2. Platz Gruppe 2" },
    { value: "g2p3", label: "3. Platz Gruppe 2" }, { value: "g2p4", label: "4. Platz Gruppe 2" },
  ];
  const config = state.knockoutConfig || {};

  return `
    <div>
      <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 class="text-xl font-bold text-gray-800">Einzel-Tabellen</h3>
        <button onclick="exportSinglesTables()" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Tabellen exportieren</button>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        ${GroupTable(1, group1)}
        ${GroupTable(2, group2)}
      </div>
      <div class="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 class="text-xl font-bold text-gray-800 mb-4">K.O.-Phase konfigurieren</h3>
        ${!state.knockoutPhaseActive ? `
          <div class="mb-4 p-4 bg-blue-50 border border-blue-300 rounded-lg">
            <p class="text-sm text-blue-800 mb-3">Konfiguriere die Paarungen nach Platzierung.</p>
            <button onclick="activateKnockoutPhase()" class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold">K.O.-Phase starten</button>
          </div>
        ` : `
          <div class="mb-4 p-4 bg-green-50 border border-green-300 rounded-lg">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <p class="text-sm text-green-800">✅ K.O.-Phase ist aktiv.</p>
              <button onclick="deactivateKnockoutPhase()" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold">K.O.-Phase deaktivieren</button>
            </div>
          </div>
        `}
        <div class="space-y-6">
          <div>
            <h4 class="font-semibold text-gray-700 mb-3">Viertelfinale (4 Spiele)</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${[1, 2, 3, 4].map((i) => `
                <div class="bg-white p-4 rounded-lg border">
                  <div class="font-medium mb-2">Spiel ${i}</div>
                  <div class="grid grid-cols-2 gap-2">
                    <select id="qf_${i}_p1" class="px-3 py-2 border rounded-lg text-sm" ${state.knockoutPhaseActive ? "disabled" : ""}>
                      <option value="">Position wählen</option>
                      ${positions.map((p) => `<option value="${p.value}" ${config[`qf_${i}_p1`] === p.value ? "selected" : ""}>${p.label}</option>`).join("")}
                    </select>
                    <select id="qf_${i}_p2" class="px-3 py-2 border rounded-lg text-sm" ${state.knockoutPhaseActive ? "disabled" : ""}>
                      <option value="">Position wählen</option>
                      ${positions.map((p) => `<option value="${p.value}" ${config[`qf_${i}_p2`] === p.value ? "selected" : ""}>${p.label}</option>`).join("")}
                    </select>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
          ${!state.knockoutPhaseActive ? `<button onclick="saveKnockoutConfig()" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Paarungen speichern</button>` : ""}
        </div>
      </div>
    </div>`;
}

function AdminDoublesTab() {
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
        <button onclick="exportDoublesMatches()" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Excel Export</button>
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

function AdminDoublesRankingTab() {
  const levels = state.pyramid.levels || [];
  const flatPositions = flattenPyramidLevels(levels);

  return `
    <div>
      <div class="mb-6">
        <h3 class="text-xl font-bold text-gray-800 mb-3">Doppel-Rangfolge bearbeiten</h3>
        <p class="text-sm text-gray-600 mb-4">Nutze die Pfeile, um die Spieler in die gewünschte Reihenfolge zu bringen.</p>
      </div>
      ${flatPositions.length === 0 ? `
        <div class="text-center py-12 bg-gray-50 rounded-lg">
          <p class="text-gray-600 mb-4">Pyramide noch nicht initialisiert</p>
          <button onclick="initPyramid()" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Pyramide initialisieren</button>
        </div>
      ` : `
        <div class="space-y-3 mb-6">
          ${flatPositions.map((playerId, idx) => `
            <div class="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300">
              <div class="flex items-center space-x-4">
                <span class="font-bold text-gray-500 w-8">#${idx + 1}</span>
                <span class="font-medium text-gray-800">${getPlayerName(playerId)}</span>
              </div>
              <div class="flex space-x-2">
                ${idx > 0 ? `<button onclick="movePlayerUp(${idx})" class="p-2 text-indigo-600 hover:bg-indigo-50 rounded"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg></button>` : ""}
                ${idx < flatPositions.length - 1 ? `<button onclick="movePlayerDown(${idx})" class="p-2 text-indigo-600 hover:bg-indigo-50 rounded"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg></button>` : ""}
              </div>
            </div>
          `).join("")}
        </div>
        <button onclick="saveDoublesRanking()" class="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">Rangfolge speichern</button>
      `}
    </div>`;
}