// js/pages/ArchivePage.js
// Archiv-Seite: Listet alle archivierten Saisons auf

function ArchivePage() {
  const archiveSeasons = (state.seasons || [])
    .filter(s => s.archiveVisible !== false)
    .filter(s => s.year !== state.liveActiveSeason) // Aktive Saison nicht im Archiv zeigen
    .sort((a, b) => b.year - a.year);

  return `
    <div class="space-y-4 sm:space-y-6">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
        <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Archiv</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Vergangene Saisons einsehen</p>

        ${archiveSeasons.length === 0 ? `
          <div class="text-center py-12">
            <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8"/>
            </svg>
            <p class="text-gray-500 dark:text-gray-400">Noch keine archivierten Saisons vorhanden.</p>
          </div>
        ` : `
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            ${archiveSeasons.map(s => `
              <a href="#/archive/${s.year}" class="block p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all bg-white dark:bg-gray-800 group">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-2xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">${s.year}</span>
                  <svg class="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400">${s.label || 'Saison ' + s.year}</p>
              </a>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}
