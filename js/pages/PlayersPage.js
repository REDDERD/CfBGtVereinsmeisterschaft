// js/pages/PlayersPage.js

function PlayersPage() {
  return `
    <div class="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Alle Spieler</h2>

      ${state.matchesLoading ? `
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          ${Array(8).fill(0).map(() => `
            <div class="p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div class="skeleton h-4 w-24 mb-2 rounded"></div>
              <div class="skeleton h-3 w-14 mt-1 rounded"></div>
            </div>
          `).join('')}
        </div>
      ` : state.players.length === 0 ? `
        <p class="text-center py-6 text-gray-500 text-sm">Noch keine Spieler registriert</p>
      ` : `
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          ${state.players.map((player) => `
            <div onclick="viewPlayerProfile('${player.id}')" class="p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors active:scale-[0.98]">
              <h3 class="text-sm sm:text-base font-bold text-gray-800 truncate">${player.name}</h3>
              <div class="text-xs text-gray-500 mt-1 space-y-0.5">
                ${player.singlesGroup ? `<div>Gr. ${player.singlesGroup}</div>` : ""}
                ${player.doublesPool ? `<div>Pool ${player.doublesPool}</div>` : ""}
                ${!player.singlesGroup && !player.doublesPool ? '<div class="text-gray-400">-</div>' : ""}
              </div>
            </div>
          `).join("")}
        </div>
      `}
    </div>`;
}
