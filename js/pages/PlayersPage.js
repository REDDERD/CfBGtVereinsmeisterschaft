// js/pages/PlayersPage.js

function PlayersPage() {
  return `
    <div class="bg-white rounded-xl shadow-lg p-6">
      <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Alle Spieler</h2>
      
      ${state.players.length === 0 ? `
        <p class="text-center py-8 text-gray-500">Noch keine Spieler registriert</p>
      ` : `
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${state.players.map((player) => `
            <div onclick="viewPlayerProfile('${player.id}')" class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
              <h3 class="text-lg font-bold text-gray-800">${player.name}</h3>
              <div class="text-sm text-gray-600 mt-2 space-y-1">
                ${player.singlesGroup ? `<div>Einzel: Gruppe ${player.singlesGroup}</div>` : ""}
                ${player.doublesPool ? `<div>Doppel: Pool ${player.doublesPool}</div>` : ""}
                ${!player.singlesGroup && !player.doublesPool ? '<div class="text-gray-400">Kein Turnier</div>' : ""}
              </div>
            </div>
          `).join("")}
        </div>
      `}
    </div>`;
}