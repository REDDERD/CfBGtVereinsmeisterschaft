// js/pages/admin/AdminPlayersTab.js
// Admin-Tab: Spielerverwaltung

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
        ${state.players
          .map((player) =>
            state.editingPlayer === player.id
              ? `
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
                    <option value="B" ${player.doublesPool === "B" ? "selected" : ""}>Pool B (normal)</option>
                  </select>
                </div>
              </div>
              <div class="flex space-x-2">
                <button onclick="savePlayer('${player.id}')" class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Speichern</button>
                <button onclick="cancelEdit()" class="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500">Abbrechen</button>
              </div>
            </div>
          </div>
        `
              : `
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
            <div class="flex space-x-2 ml-4">
              <button onclick="editPlayer('${player.id}')" class="p-2 text-red-600 hover:bg-blue-50 rounded-lg transition-colors">${icons.edit}</button>
              <button onclick="deletePlayer('${player.id}')" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">${icons.trash}</button>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>`;
}
