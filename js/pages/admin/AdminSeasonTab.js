// js/pages/admin/AdminSeasonTab.js
// Admin-Tab: Saison-Verwaltung

function AdminSeasonTab() {
  const activeSeason = state.activeSeason;
  const seasons = state.seasons || [];
  const currentYear = new Date().getFullYear();

  return `
    <div class="space-y-6">

      <!-- Aktive Saison -->
      <div class="bg-white rounded-lg p-6 border border-gray-200">
        <h3 class="text-xl font-bold text-gray-800 mb-4">Aktive Saison</h3>
        <p class="text-sm text-gray-500 mb-4">Die aktive Saison bestimmt, welche Daten in der App angezeigt und bearbeitet werden.</p>

        <div class="flex items-center gap-4">
          <select id="activeSeasonSelect"
            class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            onchange="changeActiveSeason(this.value)">
            ${seasons.length === 0
              ? `<option value="${activeSeason}">${activeSeason}</option>`
              : seasons
                  .sort((a, b) => b.year - a.year)
                  .map(s => `<option value="${s.year}" ${s.year === activeSeason ? 'selected' : ''}>${s.label || 'Saison ' + s.year}</option>`)
                  .join('')
            }
          </select>
          <span class="text-sm text-gray-500">
            ${activeSeason === currentYear ? '(aktuelles Jahr)' : ''}
          </span>
        </div>
      </div>

      <!-- Neue Saison anlegen -->
      <div class="bg-white rounded-lg p-6 border border-gray-200">
        <h3 class="text-xl font-bold text-gray-800 mb-4">Neue Saison anlegen</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Jahr</label>
            <input type="number" id="newSeasonYear" min="2020" max="2099" value="${currentYear + 1}"
              class="px-4 py-2 border border-gray-300 rounded-lg text-sm w-32 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          </div>

          <div class="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
            <label class="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" id="copyPlayers" checked
                class="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                onchange="document.getElementById('copyPlayersOptions').classList.toggle('hidden', !this.checked)">
              <span class="text-sm font-medium text-gray-700">Spieler aus Vorsaison übernehmen</span>
            </label>

            <div id="copyPlayersOptions" class="ml-7 space-y-2">
              <p class="text-xs text-gray-500">Spieler werden aus der aktuell aktiven Saison (${activeSeason}) kopiert.</p>
              <label class="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" id="copyPlayerSettings" checked
                  class="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500">
                <span class="text-sm text-gray-600">Einzel-Gruppe & Doppel-Pool übernehmen</span>
              </label>
            </div>
          </div>

          <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <label class="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" id="newSeasonArchiveVisible" checked
                class="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500">
              <span class="text-sm font-medium text-gray-700">Im Archiv anzeigen</span>
            </label>
            <p class="text-xs text-gray-500 ml-7 mt-1">Wenn aktiviert, wird diese Saison später im öffentlichen Archiv sichtbar sein.</p>
          </div>

          <button onclick="createNewSeason()" class="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
            Saison anlegen
          </button>
        </div>
      </div>

      <!-- Bestehende Saisons -->
      ${seasons.length > 0 ? `
      <div class="bg-white rounded-lg p-6 border border-gray-200">
        <h3 class="text-xl font-bold text-gray-800 mb-4">Bestehende Saisons</h3>
        <div class="space-y-3">
          ${seasons
            .sort((a, b) => b.year - a.year)
            .map(s => `
              <div class="flex items-center justify-between p-4 rounded-lg border ${s.year === activeSeason ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 bg-gray-50'}">
                <div class="flex items-center gap-3">
                  <span class="text-base font-bold ${s.year === activeSeason ? 'text-indigo-700' : 'text-gray-800'}">${s.label || 'Saison ' + s.year}</span>
                  ${s.year === activeSeason ? '<span class="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">aktiv</span>' : ''}
                </div>
                <div class="flex items-center gap-3">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" ${s.archiveVisible !== false ? 'checked' : ''}
                      class="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      onchange="updateSeasonArchiveVisibility(${s.year}, this.checked)">
                    <span class="text-xs text-gray-500">Archiv</span>
                  </label>
                </div>
              </div>
            `).join('')
          }
        </div>
      </div>
      ` : ''}

    </div>
  `;
}
