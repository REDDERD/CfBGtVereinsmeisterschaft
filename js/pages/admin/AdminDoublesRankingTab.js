// js/pages/admin/AdminDoublesRankingTab.js
// Admin-Tab: Doppel-Rangfolge

function AdminDoublesRankingTab() {
  const levels = state.pyramid.levels || [];
  const flatPositions = flattenPyramidLevels(levels);
  const isManualOrderExpanded = state.manualDoublesOrderExpanded || false;

  return `
    <div>
      <div class="mb-6">
        <h3 class="text-xl font-bold text-gray-800 mb-3">Doppel-Rangfolge bearbeiten</h3>
      </div>

      ${state.doublesKnockoutPhaseActive ? "" : `
      <div class="bg-gray-50 rounded-lg p-3 sm:p-4 mb-6">
        <h3 class="text-base sm:text-lg font-bold text-gray-800 mb-3">Kampfloses Spiel eintragen</h3>
        <p class="text-xs text-gray-500 mb-3">Nur die ersten Spieler jedes Teams angeben. Die Pyramide wird automatisch aktualisiert.</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label class="block text-xs font-bold text-green-700 mb-1">Gewinner (Spieler 1)</label>
            <select id="walkoverDoublesWinner" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-green-50 focus:ring-2 focus:ring-green-400 focus:border-transparent">
              <option value="">Spieler wählen...</option>
              ${state.players.filter(p => p.doublesPool).map(p => `<option value="${p.id}">${p.name} (Pool ${p.doublesPool})</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-red-700 mb-1">Verlierer (Spieler 1)</label>
            <select id="walkoverDoublesLoser" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-red-50 focus:ring-2 focus:ring-red-400 focus:border-transparent">
              <option value="">Spieler wählen...</option>
              ${state.players.filter(p => p.doublesPool).map(p => `<option value="${p.id}">${p.name} (Pool ${p.doublesPool})</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button onclick="addDoublesWalkover()" class="px-5 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 text-sm font-semibold transition-colors">Kampflos eintragen</button>
          <span class="text-xs text-gray-400">Ergebnis wird als 21:0, 21:0 gespeichert</span>
        </div>
      </div>
      `}

      ${
        flatPositions.length === 0
          ? `
        <div class="text-center py-12 bg-gray-50 rounded-lg">
          <p class="text-gray-600 mb-4">Pyramide noch nicht initialisiert</p>
          <button onclick="initPyramid()" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Pyramide initialisieren</button>
        </div>
      `
          : `
        <!-- Ausklappbarer Container für manuelle Rangfolgen-Anpassung -->
        <div class="mb-6 bg-white rounded-lg border border-gray-200">
          <button 
            onclick="toggleManualDoublesOrder()" 
            class="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
              </svg>
              <span class="font-semibold text-gray-800">Manuelle Rangfolgen-Anpassung</span>
            </div>
            <svg class="w-5 h-5 text-gray-600 transform transition-transform ${isManualOrderExpanded ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          
          <div class="${isManualOrderExpanded ? 'block' : 'hidden'} p-4 border-t border-gray-200">
            <p class="text-sm text-gray-600 mb-4">Hier kannst du die Reihenfolge in der Pyramide manuell anpassen.</p>
            
            <div class="space-y-3 mb-6">
              ${flatPositions
                .map(
                  (playerId, idx) => `
                <div class="flex items-center justify-between p-2.5 sm:p-4 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300">
                  <div class="flex items-center gap-2 sm:gap-4 min-w-0">
                    <span class="font-bold text-gray-500 w-6 sm:w-8 text-sm flex-shrink-0">#${idx + 1}</span>
                    <span class="font-medium text-gray-800 text-sm truncate">${getPlayerName(playerId)}</span>
                  </div>
                  <div class="flex gap-1 flex-shrink-0">
                    ${idx > 0 ? `<button onclick="movePlayerUp(${idx})" class="p-2 text-indigo-600 hover:bg-indigo-50 rounded" title="Nach oben"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg></button>` : ""}
                    ${idx < flatPositions.length - 1 ? `<button onclick="movePlayerDown(${idx})" class="p-2 text-indigo-600 hover:bg-indigo-50 rounded" title="Nach unten"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg></button>` : ""}
                    <button onclick="removePlayerFromRanking(${idx}, '${playerId}')" class="p-2 text-red-600 hover:bg-red-50 rounded" title="Aus Rangfolge löschen"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                  </div>
                </div>
              `,
                )
                .join("")}

              <button onclick="saveDoublesRanking()" class="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">Rangfolge speichern</button>
            </div>
          </div>
        </div>
        `
      }

      ${AdminDoublesKnockoutConfig()}
    </div>
    `;
}

// ========== K.O.-Phase konfigurieren ==========

function AdminDoublesKnockoutConfig() {
  const active = state.doublesKnockoutPhaseActive;
  const config = state.doublesKnockoutConfig || {};
  const mode = getDoublesKnockoutStartRound();
  const prefix = mode === "semi" ? "sf" : "qf";
  const slotCount = getDoublesKnockoutSlotCount();

  const ranking = getDoublesRankingList();
  const doublesPlayers = state.players.filter((p) => p.doublesPool);

  // Positionen der Top 8 aus der (ggf. eingefrorenen) Pyramiden-Rangfolge
  const positions = [1, 2, 3, 4, 5, 6, 7, 8].map((place) => ({
    value: `p${place}`,
    label: ranking[place - 1]
      ? `Rang ${place} – ${getPlayerName(ranking[place - 1])}`
      : `Rang ${place}`,
  }));

  const teamSelects = (matchNum, slot, label) => {
    const posKey = `${prefix}_${matchNum}_${slot}_pos`;
    const partnerKey = `${prefix}_${matchNum}_${slot}_partner`;
    return `
      <div class="mb-2 last:mb-0">
        <label class="block text-xs font-semibold text-gray-600 mb-1">${label}</label>
        <select id="d${posKey}" class="w-full px-3 py-2 border rounded-lg text-sm mb-1.5" ${active ? "disabled" : ""}>
          <option value="">Position wählen</option>
          ${positions.map((p) => `<option value="${p.value}" ${config[posKey] === p.value ? "selected" : ""}>${p.label}</option>`).join("")}
        </select>
        <select id="d${partnerKey}" class="w-full px-3 py-2 border rounded-lg text-sm">
          <option value="">Partner wählen</option>
          ${doublesPlayers.map((p) => `<option value="${p.id}" ${config[partnerKey] === p.id ? "selected" : ""}>${p.name}</option>`).join("")}
        </select>
      </div>`;
  };

  return `
    <div class="bg-gray-50 rounded-lg p-3 sm:p-6 mb-4 sm:mb-6">
      <h3 class="text-base sm:text-xl font-bold text-gray-800 mb-3">K.O.-Phase konfigurieren</h3>

      ${
        !active
          ? `
        <div class="mb-4 p-4 bg-blue-50 border border-blue-300 rounded-lg">
          <p class="text-sm text-blue-800 mb-3">Konfiguriere die Paarungen nach Pyramiden-Platzierung (Top 8). Beim Start wird die Rangfolge eingefroren.</p>
          <button onclick="activateDoublesKnockoutPhase()" class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold">K.O.-Phase starten</button>
        </div>
      `
          : `
        <div class="mb-4 p-4 bg-green-50 border border-green-300 rounded-lg">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <p class="text-sm text-green-800">✅ Doppel-K.O.-Phase ist aktiv.</p>
            <button onclick="deactivateDoublesKnockoutPhase()" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold">K.O.-Phase deaktivieren</button>
          </div>
        </div>
      `
      }

      <div class="mb-4">
        <label class="block text-xs font-semibold text-gray-600 mb-1">Spielmodus</label>
        <select onchange="setDoublesKnockoutMode(this.value)" class="w-full sm:w-auto px-3 py-2 border rounded-lg text-sm" ${active ? "disabled" : ""}>
          <option value="quarter" ${mode === "quarter" ? "selected" : ""}>8 Teams – ab Viertelfinale (jeder der Top 8 mit eigenem Partner)</option>
          <option value="semi" ${mode === "semi" ? "selected" : ""}>4 Teams – ab Halbfinale (je 2 Top-8-Spieler bilden ein Team)</option>
        </select>
        <p class="text-xs text-gray-500 mt-1">
          Spieler 1 jedes Teams wird über die Pyramiden-Position bestimmt, der Partner wird als konkreter Spieler hinterlegt
          und kann auch nach dem Start noch angepasst werden (z.&nbsp;B. nach einer Auslosung).
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        ${Array.from({ length: slotCount }, (_, idx) => idx + 1)
          .map(
            (i) => `
          <div class="bg-white p-4 rounded-lg border">
            <div class="font-medium mb-2">${mode === "semi" ? "Halbfinale" : "Viertelfinale"} ${i}</div>
            ${teamSelects(i, "t1", "Team 1")}
            <div class="text-center text-xs text-gray-400 my-1">vs</div>
            ${teamSelects(i, "t2", "Team 2")}
          </div>
        `,
          )
          .join("")}
      </div>

      <button onclick="saveDoublesKnockoutConfig()" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Paarungen speichern</button>
    </div>`;
}