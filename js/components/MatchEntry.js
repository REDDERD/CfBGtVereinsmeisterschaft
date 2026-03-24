// js/components/MatchEntry.js
// Eingabe-Formulare für Einzel und Doppel Spiele - Mobile-First

function SinglesMatchEntry() {
  const group1Players = getGroupPlayers(1);
  const group2Players = getGroupPlayers(2);
  const allSinglesPlayers = [...group1Players, ...group2Players];

  const selectedP1 = state.matchEntry.singlesP1 || "";
  const selectedP2 = state.matchEntry.singlesP2 || "";

  const p1Name = selectedP1
    ? state.players.find((p) => p.id === selectedP1)?.name || "Spieler 1"
    : "Spieler 1";
  const p2Name = selectedP2
    ? state.players.find((p) => p.id === selectedP2)?.name || "Spieler 2"
    : "Spieler 2";

  let availableP1 = allSinglesPlayers;
  let availableP2 = allSinglesPlayers;

  if (selectedP1) {
    const p1 = state.players.find((p) => p.id === selectedP1);
    if (p1) {
      availableP2 = getGroupPlayers(p1.singlesGroup).filter(
        (p) => p.id !== selectedP1,
      );
    }
  }

  if (selectedP2) {
    const p2 = state.players.find((p) => p.id === selectedP2);
    if (p2) {
      availableP1 = getGroupPlayers(p2.singlesGroup).filter(
        (p) => p.id !== selectedP2,
      );
    }
  }

  return `
    <div class="p-3 sm:p-4 bg-indigo-50 rounded-lg">
      <h4 class="font-bold text-gray-800 mb-3 text-sm sm:text-base">Neues Einzel-Spiel eintragen</h4>

      <div class="grid grid-cols-2 gap-2 sm:gap-4 mb-4">
        <select id="singlesP1" onchange="updateSinglesPlayerSelection('singlesP1', this.value)" class="w-full px-2 sm:px-3 py-2.5 border rounded-lg bg-white">
          <option value="">Spieler 1</option>
          ${availableP1.map((p) => `<option value="${p.id}" ${selectedP1 === p.id ? "selected" : ""}>${p.name}</option>`).join("")}
        </select>
        <select id="singlesP2" onchange="updateSinglesPlayerSelection('singlesP2', this.value)" class="w-full px-2 sm:px-3 py-2.5 border rounded-lg bg-white">
          <option value="">Spieler 2</option>
          ${availableP2.map((p) => `<option value="${p.id}" ${selectedP2 === p.id ? "selected" : ""}>${p.name}</option>`).join("")}
        </select>
      </div>

      <!-- Compact set entry: Label | Input : Input -->
      <div class="space-y-2 mb-4">
        ${[1, 2, 3].map(i => {
          const disabled = i === 3;
          const disabledClass = disabled ? 'bg-gray-200' : '';
          const disabledAttr = disabled ? 'disabled' : '';
          return `
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-600 w-12 flex-shrink-0">Satz ${i}</span>
            <input type="number" id="set${i}P1" min="0" max="30"
              oninput="updateMatchEntry('set${i}P1', this.value)"
              placeholder="${p1Name.substring(0, 8)}"
              ${disabledAttr}
              class="flex-1 px-2 py-2.5 border rounded-lg text-center ${disabledClass}">
            <span class="text-gray-400 font-bold">:</span>
            <input type="number" id="set${i}P2" min="0" max="30"
              oninput="updateMatchEntry('set${i}P2', this.value)"
              placeholder="${p2Name.substring(0, 8)}"
              ${disabledAttr}
              class="flex-1 px-2 py-2.5 border rounded-lg text-center ${disabledClass}">
          </div>`;
        }).join('')}
      </div>

      <button onclick="addSinglesMatch()" class="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
        Spiel eintragen
      </button>
    </div>
  `;
}

function DoublesMatchEntry() {
  const doublesPlayers = state.players.filter((p) => p.doublesPool);
  const prefill = state.prefilledDoubles || {};

  const selectedT1P1 = state.matchEntry.doublesT1P1 || "";
  const selectedT1P2 = state.matchEntry.doublesT1P2 || "";
  const selectedT2P1 = state.matchEntry.doublesT2P1 || "";
  const selectedT2P2 = state.matchEntry.doublesT2P2 || "";

  const t1p1Obj = selectedT1P1 ? state.players.find((p) => p.id === selectedT1P1) : null;
  const t1p2Obj = selectedT1P2 ? state.players.find((p) => p.id === selectedT1P2) : null;
  const t2p1Obj = selectedT2P1 ? state.players.find((p) => p.id === selectedT2P1) : null;
  const t2p2Obj = selectedT2P2 ? state.players.find((p) => p.id === selectedT2P2) : null;

  const t1p1Name = t1p1Obj?.name || "Spieler 1";
  const t1p2Name = t1p2Obj?.name || "Spieler 2";
  const t2p1Name = t2p1Obj?.name || "Spieler 1";
  const t2p2Name = t2p2Obj?.name || "Spieler 2";

  const team1Label = selectedT1P1 && selectedT1P2 ? `${t1p1Name} & ${t1p2Name}` : "Herausgefordert";
  const team2Label = selectedT2P1 && selectedT2P2 ? `${t2p1Name} & ${t2p2Name}` : "Herausforderer";

  // Short labels for mobile inputs
  const team1Short = selectedT1P1 && selectedT1P2 ? `T1` : "T1";
  const team2Short = selectedT2P1 && selectedT2P2 ? `T2` : "T2";

  let availableT1P1 = doublesPlayers.filter((p) => {
    if (p.id === selectedT2P1 || p.id === selectedT2P2) return false;
    if (selectedT1P2 && t1p2Obj) {
      if (p.doublesPool === t1p2Obj.doublesPool) return false;
    }
    return true;
  });

  let availableT1P2 = doublesPlayers.filter((p) => {
    if (p.id === selectedT2P1 || p.id === selectedT2P2) return false;
    if (p.id === selectedT1P1) return false;
    if (selectedT1P1 && t1p1Obj) {
      if (p.doublesPool === t1p1Obj.doublesPool) return false;
    }
    return true;
  });

  let availableT2P1 = doublesPlayers.filter((p) => {
    if (p.id === selectedT1P1 || p.id === selectedT1P2) return false;
    if (selectedT2P2 && t2p2Obj) {
      if (p.doublesPool === t2p2Obj.doublesPool) return false;
    }
    return true;
  });

  let availableT2P2 = doublesPlayers.filter((p) => {
    if (p.id === selectedT1P1 || p.id === selectedT1P2) return false;
    if (p.id === selectedT2P1) return false;
    if (selectedT2P1 && t2p1Obj) {
      if (p.doublesPool === t2p1Obj.doublesPool) return false;
    }
    return true;
  });

  return `
    <div class="p-3 sm:p-4 bg-indigo-50 rounded-lg">
      <h4 class="font-bold text-gray-800 mb-3 text-sm sm:text-base">Doppel-Spiel eintragen</h4>

      ${
        prefill.challengerId
          ? `
          <div class="mb-3 p-2 bg-blue-100 border border-blue-400 rounded text-xs sm:text-sm text-blue-800 flex items-center gap-2">
            ${icons.link} <span>Herausforderung: ${getPlayerName(prefill.challengerId)} vs ${getPlayerName(prefill.challengedId)}</span>
          </div>
      `
          : ""
      }

      <div class="mb-3 p-2 bg-blue-100 border border-blue-400 rounded text-xs sm:text-sm text-blue-800 flex items-center gap-2">
        ${icons.info} <span>Ergebnis wird nur für Spieler 1 jedes Teams gewertet!</span>
      </div>

      <!-- Team selection -->
      <div class="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5 tracking-wide">Herausgefordert</label>
          <select id="doublesT1P1" onchange="updateDoublesPlayerSelection('doublesT1P1', this.value)" class="w-full px-2 py-2.5 border rounded-lg mb-1.5 bg-white text-sm">
            <option value="">Spieler 1</option>
            ${availableT1P1.map((p) => `<option value="${p.id}" ${prefill.challengerId === p.id || selectedT1P1 === p.id ? "selected" : ""}>${p.name}</option>`).join("")}
          </select>
          <select id="doublesT1P2" onchange="updateDoublesPlayerSelection('doublesT1P2', this.value)" class="w-full px-2 py-2.5 border rounded-lg bg-white text-sm">
            <option value="">Spieler 2</option>
            ${availableT1P2.map((p) => `<option value="${p.id}" ${selectedT1P2 === p.id ? "selected" : ""}>${p.name}</option>`).join("")}
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5 tracking-wide">Herausforderer</label>
          <select id="doublesT2P1" onchange="updateDoublesPlayerSelection('doublesT2P1', this.value)" class="w-full px-2 py-2.5 border rounded-lg mb-1.5 bg-white text-sm">
            <option value="">Spieler 1</option>
            ${availableT2P1.map((p) => `<option value="${p.id}" ${prefill.challengedId === p.id || selectedT2P1 === p.id ? "selected" : ""}>${p.name}</option>`).join("")}
          </select>
          <select id="doublesT2P2" onchange="updateDoublesPlayerSelection('doublesT2P2', this.value)" class="w-full px-2 py-2.5 border rounded-lg bg-white text-sm">
            <option value="">Spieler 2</option>
            ${availableT2P2.map((p) => `<option value="${p.id}" ${selectedT2P2 === p.id ? "selected" : ""}>${p.name}</option>`).join("")}
          </select>
        </div>
      </div>

      <!-- Compact set entry -->
      <div class="space-y-2 mb-4">
        ${[1, 2, 3].map(i => {
          const disabled = i === 3;
          const disabledClass = disabled ? 'bg-gray-200' : '';
          const disabledAttr = disabled ? 'disabled' : '';
          return `
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-600 w-12 flex-shrink-0">Satz ${i}</span>
            <input type="number" id="doublesSet${i}T1" min="0" max="30"
              oninput="updateMatchEntry('doublesSet${i}T1', this.value)"
              placeholder="${team1Short}"
              ${disabledAttr}
              class="flex-1 px-2 py-2.5 border rounded-lg text-center ${disabledClass}">
            <span class="text-gray-400 font-bold">:</span>
            <input type="number" id="doublesSet${i}T2" min="0" max="30"
              oninput="updateMatchEntry('doublesSet${i}T2', this.value)"
              placeholder="${team2Short}"
              ${disabledAttr}
              class="flex-1 px-2 py-2.5 border rounded-lg text-center ${disabledClass}">
          </div>`;
        }).join('')}
      </div>

      <button onclick="addDoublesMatch()" class="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
        Doppel-Spiel eintragen
      </button>
    </div>
  `;
}
