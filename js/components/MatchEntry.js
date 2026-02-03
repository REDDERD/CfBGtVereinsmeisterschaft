// js/components/MatchEntry.js
// Eingabe-Formulare für Einzel und Doppel Spiele

function SinglesMatchEntry() {
  const group1Players = getGroupPlayers(1);
  const group2Players = getGroupPlayers(2);
  const allSinglesPlayers = [...group1Players, ...group2Players];

  // Get currently selected players
  const selectedP1 = state.matchEntry.singlesP1 || "";
  const selectedP2 = state.matchEntry.singlesP2 || "";

  // Get player names
  const p1Name = selectedP1
    ? state.players.find((p) => p.id === selectedP1)?.name || "Spieler 1"
    : "Spieler 1";
  const p2Name = selectedP2
    ? state.players.find((p) => p.id === selectedP2)?.name || "Spieler 2"
    : "Spieler 2";

  // Determine which players to show based on selection
  let availableP1 = allSinglesPlayers;
  let availableP2 = allSinglesPlayers;

  if (selectedP1) {
    const p1 = state.players.find((p) => p.id === selectedP1);
    if (p1) {
      // Filter to same group and exclude the selected player
      availableP2 = getGroupPlayers(p1.singlesGroup).filter(
        (p) => p.id !== selectedP1,
      );
    }
  }

  if (selectedP2) {
    const p2 = state.players.find((p) => p.id === selectedP2);
    if (p2) {
      // Filter to same group and exclude the selected player
      availableP1 = getGroupPlayers(p2.singlesGroup).filter(
        (p) => p.id !== selectedP2,
      );
    }
  }

  return `
    <div class="p-4 bg-indigo-50 rounded-lg">
      <h4 class="font-bold text-gray-800 mb-3">Neues Einzel-Spiel eintragen</h4>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <select id="singlesP1" onchange="updateSinglesPlayerSelection('singlesP1', this.value)" class="px-3 py-2 border rounded-lg">
          <option value="">Spieler 1 wählen</option>
          ${availableP1.map((p) => `<option value="${p.id}" ${selectedP1 === p.id ? "selected" : ""}>${p.name}</option>`).join("")}
        </select>
        <select id="singlesP2" onchange="updateSinglesPlayerSelection('singlesP2', this.value)" class="px-3 py-2 border rounded-lg">
          <option value="">Spieler 2 wählen</option>
          ${availableP2.map((p) => `<option value="${p.id}" ${selectedP2 === p.id ? "selected" : ""}>${p.name}</option>`).join("")}
        </select>
      </div>
      
      <div class="space-y-3 mb-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Satz 1 - ${p1Name}</label>
            <input type="number" id="set1P1" min="0" max="30" oninput="updateMatchEntry('set1P1', this.value)" class="w-full px-3 py-2 border rounded-lg">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Satz 1 - ${p2Name}</label>
            <input type="number" id="set1P2" min="0" max="30" oninput="updateMatchEntry('set1P2', this.value)" class="w-full px-3 py-2 border rounded-lg">
          </div>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Satz 2 - ${p1Name}</label>
            <input type="number" id="set2P1" min="0" max="30" oninput="updateMatchEntry('set2P1', this.value)" class="w-full px-3 py-2 border rounded-lg">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Satz 2 - ${p2Name}</label>
            <input type="number" id="set2P2" min="0" max="30" oninput="updateMatchEntry('set2P2', this.value)" class="w-full px-3 py-2 border rounded-lg">
          </div>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Satz 3 - ${p1Name}</label>
            <input type="number" id="set3P1" min="0" max="30" oninput="updateMatchEntry('set3P1', this.value)" disabled class="w-full px-3 py-2 border rounded-lg bg-gray-200">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Satz 3 - ${p2Name}</label>
            <input type="number" id="set3P2" min="0" max="30" oninput="updateMatchEntry('set3P2', this.value)" disabled class="w-full px-3 py-2 border rounded-lg bg-gray-200">
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

  // Get currently selected players from matchEntry state
  const selectedT1P1 = state.matchEntry.doublesT1P1 || "";
  const selectedT1P2 = state.matchEntry.doublesT1P2 || "";
  const selectedT2P1 = state.matchEntry.doublesT2P1 || "";
  const selectedT2P2 = state.matchEntry.doublesT2P2 || "";

  // Get player objects
  const t1p1Obj = selectedT1P1
    ? state.players.find((p) => p.id === selectedT1P1)
    : null;
  const t1p2Obj = selectedT1P2
    ? state.players.find((p) => p.id === selectedT1P2)
    : null;
  const t2p1Obj = selectedT2P1
    ? state.players.find((p) => p.id === selectedT2P1)
    : null;
  const t2p2Obj = selectedT2P2
    ? state.players.find((p) => p.id === selectedT2P2)
    : null;

  // Get player names
  const t1p1Name = t1p1Obj?.name || "Spieler 1";
  const t1p2Name = t1p2Obj?.name || "Spieler 2";
  const t2p1Name = t2p1Obj?.name || "Spieler 1";
  const t2p2Name = t2p2Obj?.name || "Spieler 2";

  // Build team labels
  const team1Label =
    selectedT1P1 && selectedT1P2 ? `${t1p1Name} & ${t1p2Name}` : "Team 1";
  const team2Label =
    selectedT2P1 && selectedT2P2 ? `${t2p1Name} & ${t2p2Name}` : "Team 2";

  // Determine available players for each dropdown
  // Regel 1: Spieler 1 von beiden Teams müssen im selben Pool sein
  // Regel 2: Spieler 2 von beiden Teams müssen im selben Pool sein
  // Regel 3: Pro Team muss ein Spieler aus Pool A und einer aus Pool B sein
  // Regel 4: Ein Spieler darf nicht in beiden Teams spielen

  // Available players for Team 1, Spieler 1
  let availableT1P1 = doublesPlayers.filter((p) => {
    // Regel 4: Nicht in Team 2 spielen
    if (p.id === selectedT2P1 || p.id === selectedT2P2) return false;

    // // Regel 1: Wenn Team 2 Spieler 1 ausgewählt ist, muss selber Pool sein
    // if (selectedT2P1 && t2p1Obj) {
    //   if (p.doublesPool !== t2p1Obj.doublesPool) return false;
    // }

    // Regel 3: Wenn Team 1 Spieler 2 ausgewählt ist, muss anderer Pool sein
    if (selectedT1P2 && t1p2Obj) {
      if (p.doublesPool === t1p2Obj.doublesPool) return false;
    }

    return true;
  });

  // Available players for Team 1, Spieler 2
  let availableT1P2 = doublesPlayers.filter((p) => {
    // Regel 4: Nicht in Team 2 spielen
    if (p.id === selectedT2P1 || p.id === selectedT2P2) return false;

    // Regel 4: Nicht der gleiche Spieler wie Team 1 Spieler 1
    if (p.id === selectedT1P1) return false;

    // // Regel 2: Wenn Team 2 Spieler 2 ausgewählt ist, muss selber Pool sein
    // if (selectedT2P2 && t2p2Obj) {
    //   if (p.doublesPool !== t2p2Obj.doublesPool) return false;
    // }

    // Regel 3: Wenn Team 1 Spieler 1 ausgewählt ist, muss anderer Pool sein
    if (selectedT1P1 && t1p1Obj) {
      if (p.doublesPool === t1p1Obj.doublesPool) return false;
    }

    return true;
  });

  // Available players for Team 2, Spieler 1
  let availableT2P1 = doublesPlayers.filter((p) => {
    // Regel 4: Nicht in Team 1 spielen
    if (p.id === selectedT1P1 || p.id === selectedT1P2) return false;

    // // Regel 1: Wenn Team 1 Spieler 1 ausgewählt ist, muss selber Pool sein
    // if (selectedT1P1 && t1p1Obj) {
    //   if (p.doublesPool !== t1p1Obj.doublesPool) return false;
    // }

    // Regel 3: Wenn Team 2 Spieler 2 ausgewählt ist, muss anderer Pool sein
    if (selectedT2P2 && t2p2Obj) {
      if (p.doublesPool === t2p2Obj.doublesPool) return false;
    }

    return true;
  });

  // Available players for Team 2, Spieler 2
  let availableT2P2 = doublesPlayers.filter((p) => {
    // Regel 4: Nicht in Team 1 spielen
    if (p.id === selectedT1P1 || p.id === selectedT1P2) return false;

    // Regel 4: Nicht der gleiche Spieler wie Team 2 Spieler 1
    if (p.id === selectedT2P1) return false;

    // // Regel 2: Wenn Team 1 Spieler 2 ausgewählt ist, muss selber Pool sein
    // if (selectedT1P2 && t1p2Obj) {
    //   if (p.doublesPool !== t1p2Obj.doublesPool) return false;
    // }

    // Regel 3: Wenn Team 2 Spieler 1 ausgewählt ist, muss anderer Pool sein
    if (selectedT2P1 && t2p1Obj) {
      if (p.doublesPool === t2p1Obj.doublesPool) return false;
    }

    return true;
  });

  return `
    <div class="p-4 bg-indigo-50 rounded-lg">
      <h4 class="font-bold text-gray-800 mb-3">Doppel-Spiel eintragen</h4>
      
      ${
        prefill.challengerId
          ? `
          <div class="mb-3 p-2 bg-blue-100 border border-blue-400 rounded text-sm text-blue-800 flex items-center gap-2">
            ${icons.link} <span> Herausforderung: ${getPlayerName(prefill.challengerId)} vs ${getPlayerName(prefill.challengedId)}</span>
          </div>

      `
          : ""
      }
      
      <div class="mb-3 p-2 bg-blue-100 border border-blue-400 rounded text-sm text-blue-800 flex items-center gap-2">
        ${icons.info} <span>Das Ergebnis wird nur für den ersten Spieler jedes Teams gewertet!</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Team 1</label>
          <select id="doublesT1P1" onchange="updateDoublesPlayerSelection('doublesT1P1', this.value)" class="w-full px-3 py-2 border rounded-lg mb-2">
            <option value="">Spieler 1</option>
            ${availableT1P1.map((p) => `<option value="${p.id}" ${prefill.challengerId === p.id || selectedT1P1 === p.id ? "selected" : ""}>${p.name}</option>`).join("")}
          </select>
          <select id="doublesT1P2" onchange="updateDoublesPlayerSelection('doublesT1P2', this.value)" class="w-full px-3 py-2 border rounded-lg">
            <option value="">Spieler 2</option>
            ${availableT1P2.map((p) => `<option value="${p.id}" ${selectedT1P2 === p.id ? "selected" : ""}>${p.name}</option>`).join("")}
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Team 2</label>
          <select id="doublesT2P1" onchange="updateDoublesPlayerSelection('doublesT2P1', this.value)" class="w-full px-3 py-2 border rounded-lg mb-2">
            <option value="">Spieler 1</option>
            ${availableT2P1.map((p) => `<option value="${p.id}" ${prefill.challengedId === p.id || selectedT2P1 === p.id ? "selected" : ""}>${p.name}</option>`).join("")}
          </select>
          <select id="doublesT2P2" onchange="updateDoublesPlayerSelection('doublesT2P2', this.value)" class="w-full px-3 py-2 border rounded-lg">
            <option value="">Spieler 2</option>
            ${availableT2P2.map((p) => `<option value="${p.id}" ${selectedT2P2 === p.id ? "selected" : ""}>${p.name}</option>`).join("")}
          </select>
        </div>
      </div>
      
      <div class="space-y-3 mb-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Satz 1 - ${team1Label}</label>
            <input type="number" id="doublesSet1T1" min="0" max="30" oninput="updateMatchEntry('doublesSet1T1', this.value)" class="w-full px-3 py-2 border rounded-lg">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Satz 1 - ${team2Label}</label>
            <input type="number" id="doublesSet1T2" min="0" max="30" oninput="updateMatchEntry('doublesSet1T2', this.value)" class="w-full px-3 py-2 border rounded-lg">
          </div>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Satz 2 - ${team1Label}</label>
            <input type="number" id="doublesSet2T1" min="0" max="30" oninput="updateMatchEntry('doublesSet2T1', this.value)" class="w-full px-3 py-2 border rounded-lg">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Satz 2 - ${team2Label}</label>
            <input type="number" id="doublesSet2T2" min="0" max="30" oninput="updateMatchEntry('doublesSet2T2', this.value)" class="w-full px-3 py-2 border rounded-lg">
          </div>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Satz 3 - ${team1Label}</label>
            <input type="number" id="doublesSet3T1" min="0" max="30" oninput="updateMatchEntry('doublesSet3T1', this.value)" disabled class="w-full px-3 py-2 border rounded-lg bg-gray-200">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Satz 3 - ${team2Label}</label>
            <input type="number" id="doublesSet3T2" min="0" max="30" oninput="updateMatchEntry('doublesSet3T2', this.value)" disabled class="w-full px-3 py-2 border rounded-lg bg-gray-200">
          </div>
        </div>
      </div>
      
      <button onclick="addDoublesMatch()" class="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
        Doppel-Spiel eintragen
      </button>
    </div>
  `;
}
