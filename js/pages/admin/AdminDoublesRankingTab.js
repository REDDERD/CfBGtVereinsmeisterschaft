// js/pages/admin/AdminDoublesRankingTab.js
// Admin-Tab: Doppel-Rangfolge

function AdminDoublesRankingTab() {
  const levels = state.pyramid.levels || [];
  const flatPositions = flattenPyramidLevels(levels);
  const settings = state.matchStatusSettings || {};

  return `
    <div>
      <div class="mb-6">
        <h3 class="text-xl font-bold text-gray-800 mb-3">Doppel-Rangfolge bearbeiten</h3>
      </div>

      ${
        flatPositions.length === 0
          ? `
        <div class="text-center py-12 bg-gray-50 rounded-lg">
          <p class="text-gray-600 mb-4">Pyramide noch nicht initialisiert</p>
          <button onclick="initPyramid()" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Pyramide initialisieren</button>
        </div>
      `
          : `
        <div class="space-y-3 mb-6">
          ${flatPositions
            .map(
              (playerId, idx) => `
            <div class="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300">
              <div class="flex items-center space-x-4">
                <span class="font-bold text-gray-500 w-8">#${idx + 1}</span>
                <span class="font-medium text-gray-800">${getPlayerName(playerId)}</span>
              </div>
              <div class="flex space-x-2">
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
        `
      }
    
      <!-- Status-Einstellungen für Doppel-Spiele -->
      <div class="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 class="text-xl font-bold text-gray-800 mb-4">Status-Einstellungen für Doppel-Spiele</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Standard-Status für Admin-eingetragene Spiele</label>
            <select id="doublesAdminStatus" class="w-full px-3 py-2 border border-gray-300 rounded-lg" onchange="updateMatchStatusSettings()">
              <option value="confirmed" ${settings.doublesAdminDefault === "confirmed" ? "selected" : ""}>Bestätigt</option>
              <option value="unconfirmed" ${settings.doublesAdminDefault === "unconfirmed" ? "selected" : ""}>Unbestätigt</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Standard-Status für Nutzer-eingetragene Spiele</label>
            <select id="doublesUserStatus" class="w-full px-3 py-2 border border-gray-300 rounded-lg" onchange="updateMatchStatusSettings()">
              <option value="confirmed" ${settings.doublesUserDefault === "confirmed" ? "selected" : ""}>Bestätigt</option>
              <option value="unconfirmed" ${settings.doublesUserDefault === "unconfirmed" ? "selected" : ""}>Unbestätigt</option>
              <option value="rejected" ${settings.doublesUserDefault === "rejected" ? "selected" : ""}>Abgelehnt</option>
            </select>
          </div>
        </div>
        <p class="text-sm text-gray-600 mt-3">Diese Einstellungen bestimmen, welchen Status neue Doppel-Spiele automatisch erhalten. Nur bestätigte Spiele beeinflussen die Pyramide.</p>
      </div>

    </div>
    `;
}
