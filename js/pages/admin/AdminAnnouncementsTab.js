// js/pages/admin/AdminAnnouncementsTab.js
// Admin-Tab: Ankündigungen verwalten

function AdminAnnouncementsTab() {
  const announcements = state.announcements;

  return `
    <div class="space-y-6">

      <!-- Neue Ankündigung -->
      <div class="bg-gray-50 rounded-lg p-5 border border-gray-200">
        <h3 class="text-lg font-bold text-gray-800 mb-3">Neue Ankündigung</h3>
        <textarea
          id="announcementText"
          rows="3"
          placeholder="Text der Ankündigung... Links mit [Linktext](page) einbinden, z.B. [Statistiken](statistics)"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
        ></textarea>
        <div class="mt-2 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
          <strong>Links einbinden:</strong> Schreibe <code class="bg-blue-100 px-1 rounded">[Linktext](page)</code> um eine Seite zu verlinken.
          Gültige Seiten: <code class="bg-blue-100 px-1 rounded">home</code>, <code class="bg-blue-100 px-1 rounded">singles</code>, <code class="bg-blue-100 px-1 rounded">doubles</code>, <code class="bg-blue-100 px-1 rounded">challenges</code>, <code class="bg-blue-100 px-1 rounded">statistics</code>, <code class="bg-blue-100 px-1 rounded">matches</code>, <code class="bg-blue-100 px-1 rounded">players</code>.<br>
          Beispiel: <code class="bg-blue-100 px-1 rounded">Schau dir die [Statistiken](statistics) an!</code>
        </div>
        <button
          onclick="addAnnouncement()"
          class="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition-colors text-sm">
          Ankündigung speichern
        </button>
      </div>

      <!-- Vorhandene Ankündigungen -->
      <div>
        <h3 class="text-lg font-bold text-gray-800 mb-3">Alle Ankündigungen</h3>
        ${announcements.length === 0 ? `
          <p class="text-gray-400 text-sm">Noch keine Ankündigungen vorhanden.</p>
        ` : `
          <div class="space-y-3">
            ${announcements.map(a => `
              <div class="flex items-start gap-3 p-4 rounded-lg border ${a.active ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-200'}">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${a.active ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'}">
                      ${a.active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </div>
                  <p class="text-sm text-gray-700 break-words">${a.text}</p>
                </div>
                <div class="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onclick="toggleAnnouncement('${a.id}', ${a.active})"
                    class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${a.active ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-indigo-600 text-white hover:bg-indigo-700'}">
                    ${a.active ? 'Deaktivieren' : 'Aktivieren'}
                  </button>
                  <button
                    onclick="deleteAnnouncement('${a.id}')"
                    class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors">
                    Löschen
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>`;
}
