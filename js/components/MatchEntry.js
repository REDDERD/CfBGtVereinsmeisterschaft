// js/components/MatchEntry.js
// Eingabe-Formulare für Einzel und Doppel Spiele

function SinglesMatchEntry() {
  const group1Players = getGroupPlayers(1);
  const group2Players = getGroupPlayers(2);
  const allSinglesPlayers = [...group1Players, ...group2Players];

  return `
    <div class="p-4 bg-indigo-50 rounded-lg">
      <h4 class="font-bold text-gray-800 mb-3">Neues Einzel-Spiel eintragen</h4>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <select id="singlesP1" class="px-3 py-2 border rounded-lg">
          <option value="">Spieler 1 wählen</option>
          ${allSinglesPlayers.map((p) => `<option value="${p.id}">${p.name}</option>`).join("")}
        </select>
        <select id="singlesP2" class="px-3 py-2 border rounded-lg">
          <option value="">Spieler 2 wählen</option>
          ${allSinglesPlayers.map((p) => `<option value="${p.id}">${p.name}</option>`).join("")}
        </select>
      </div>
      
      <div class="space-y-3 mb-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Satz 1 - Spieler 1</label>
            <input type="number" id="set1P1" min="0" max="30" oninput="updateMatchEntry('set1P1', this.value)" class="w-full px-3 py-2 border rounded-lg">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Satz 1 - Spieler 2</label>
            <input type="number" id="set1P2" min="0" max="30" oninput="updateMatchEntry('set1P2', this.value)" class="w-full px-3 py-2 border rounded-lg">
          </div>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Satz 2 - Spieler 1</label>
            <input type="number" id="set2P1" min="0" max="30" oninput="updateMatchEntry('set2P1', this.value)" class="w-full px-3 py-2 border rounded-lg">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Satz 2 - Spieler 2</label>
            <input type="number" id="set2P2" min="0" max="30" oninput="updateMatchEntry('set2P2', this.value)" class="w-full px-3 py-2 border rounded-lg">
          </div>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Satz 3 - Spieler 1</label>
            <input type="number" id="set3P1" min="0" max="30" oninput="updateMatchEntry('set3P1', this.value)" ${state.matchEntry.set3Disabled ? "disabled" : ""} class="w-full px-3 py-2 border rounded-lg ${state.matchEntry.set3Disabled ? "bg-gray-200" : ""}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Satz 3 - Spieler 2</label>
            <input type="number" id="set3P2" min="0" max="30" oninput="updateMatchEntry('set3P2', this.value)" ${state.matchEntry.set3Disabled ? "disabled" : ""} class="w-full px-3 py-2 border rounded-lg ${state.matchEntry.set3Disabled ? "bg-gray-200" : ""}">
          </div>
        </div>
      </div>
      
      <button onclick="addSinglesMatch()" class="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
        Spiel eintragen
      </button>
    </div>
  `;
}

function DoublesMatchEntry() {
  const doublesPlayers = state.players.filter((p) => p.doublesPool);
  const prefill = state.prefilledDoubles || {};

  return `
    <div class="p-4 bg-indigo-50 rounded-lg">
      <h4 class="font-bold text-gray-800 mb-3">Doppel-Spiel eintragen</h4>
      
      ${prefill.challengerId ? `
        <div class="mb-3 p-2 bg-blue-100 border border-blue-400 rounded text-sm text-blue-800">
          📌 Herausforderung: ${getPlayerName(prefill.challengerId)} vs ${getPlayerName(prefill.challengedId)}
        </div>
      ` : ""}
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Team 1</label>
          <select id="doublesT1P1" class="w-full px-3 py-2 border rounded-lg mb-2">
            <option value="">Spieler 1</option>
            ${doublesPlayers.map((p) => `<option value="${p.id}" ${prefill.challengerId === p.id ? "selected" : ""}>${p.name}</option>`).join("")}
          </select>
          <select id="doublesT1P2" class="w-full px-3 py-2 border rounded-lg">
            <option value="">Spieler 2</option>
            ${doublesPlayers.map((p) => `<option value="${p.id}">${p.name}</option>`).join("")}
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Team 2</label>
          <select id="doublesT2P1" class="w-full px-3 py-2 border rounded-lg mb-2">
            <option value="">Spieler 1</option>
            ${doublesPlayers.map((p) => `<option value="${p.id}" ${prefill.challengedId === p.id ? "selected" : ""}>${p.name}</option>`).join("")}
          </select>
          <select id="doublesT2P2" class="w-full px-3 py-2 border rounded-lg">
            <option value="">Spieler 2</option>
            ${doublesPlayers.map((p) => `<option value="${p.id}">${p.name}</option>`).join("")}
          </select>
        </div>
      </div>
      
      <div class="space-y-3 mb-4">
        ${[1, 2, 3].map((i) => `
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Satz ${i} - Team 1</label>
              <input type="number" id="doublesSet${i}T1" min="0" max="30" class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Satz ${i} - Team 2</label>
              <input type="number" id="doublesSet${i}T2" min="0" max="30" class="w-full px-3 py-2 border rounded-lg">
            </div>
          </div>
        `).join("")}
      </div>
      
      <button onclick="addDoublesMatch()" class="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
        Doppel-Spiel eintragen
      </button>
    </div>
  `;
}