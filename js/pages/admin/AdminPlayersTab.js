// js/pages/admin/AdminPlayersTab.js
// Admin-Tab: Spielerverwaltung - Mobile-First

function AdminPlayersTab() {
  return `
    <div>
      <div class="mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
        <h4 class="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Neuen Spieler hinzufügen</h4>
        <div class="flex gap-2">
          <input type="text" id="playerName" placeholder="Name" class="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg">
          <button onclick="addPlayer()" class="px-4 sm:px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm flex-shrink-0">Hinzufügen</button>
        </div>
      </div>

      <div class="space-y-2">
        ${state.players
          .map((player) =>
            state.editingPlayer === player.id
              ? `
          <div class="p-3 sm:p-4 bg-blue-50 border-2 border-blue-500 rounded-lg">
            <div class="space-y-2">
              <input type="text" id="editName_${player.id}" value="${player.name}" class="w-full px-3 py-2.5 border rounded-lg text-sm">
              <div class="grid grid-cols-2 gap-2">
                <select id="editSingles_${player.id}" class="w-full px-2 py-2.5 border rounded-lg text-sm">
                  <option value="">Kein Einzel</option>
                  <option value="1" ${player.singlesGroup === 1 ? "selected" : ""}>Gruppe 1</option>
                  <option value="2" ${player.singlesGroup === 2 ? "selected" : ""}>Gruppe 2</option>
                </select>
                <select id="editDoubles_${player.id}" class="w-full px-2 py-2.5 border rounded-lg text-sm">
                  <option value="">Kein Doppel</option>
                  <option value="A" ${player.doublesPool === "A" ? "selected" : ""}>Pool A</option>
                  <option value="B" ${player.doublesPool === "B" ? "selected" : ""}>Pool B</option>
                </select>
              </div>
              <div class="flex gap-2">
                <button onclick="savePlayer('${player.id}')" class="flex-1 px-3 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">Speichern</button>
                <button onclick="cancelEdit()" class="flex-1 px-3 py-2.5 bg-gray-400 text-white rounded-lg hover:bg-gray-500 text-sm font-medium">Abbrechen</button>
              </div>
            </div>
          </div>
        `
              : `
          <div class="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
            <div class="min-w-0">
              <span class="font-medium text-gray-800 text-sm truncate block">${player.name}</span>
              <div class="text-xs text-gray-500 mt-0.5">
                ${player.singlesGroup ? `Gr.${player.singlesGroup}` : ""}
                ${player.singlesGroup && player.doublesPool ? " · " : ""}
                ${player.doublesPool ? `Pool ${player.doublesPool}` : ""}
                ${!player.singlesGroup && !player.doublesPool ? "—" : ""}
              </div>
            </div>
            <div class="flex gap-1 ml-2 flex-shrink-0">
              <button onclick="editPlayer('${player.id}')" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">${icons.edit}</button>
              <button onclick="deletePlayer('${player.id}')" class="p-2 text-red-600 hover:bg-red-50 rounded-lg">${icons.trash}</button>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>`;
}
