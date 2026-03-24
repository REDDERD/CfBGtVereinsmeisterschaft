// js/components/GroupTable.js
// Gruppen-Tabelle Komponente - Mobile-First

function GroupTable(groupNum, standings) {
  return `
    <div class="bg-gray-50 rounded-lg p-3 sm:p-4">
      <h3 class="text-lg sm:text-xl font-bold mb-3 text-gray-800">Gruppe ${groupNum}</h3>
      <div class="overflow-x-auto -mx-1">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-xs text-gray-500 border-b">
              <th class="pb-2 pr-1 w-6">#</th>
              <th class="pb-2 pr-2">Spieler</th>
              <th class="pb-2 pr-1 text-center w-10">Sp</th>
              <th class="pb-2 pr-1 text-center w-10">Pkt</th>
              <th class="pb-2 pr-1 text-center hidden sm:table-cell w-14">Sätze</th>
              <th class="pb-2 text-center hidden md:table-cell w-12">Diff</th>
            </tr>
          </thead>
          <tbody>
            ${
              standings.length === 0
                ? `
                <tr>
                  <td colspan="6" class="text-center py-4 text-gray-500 text-sm">Keine Spieler</td>
                </tr>
              `
                : standings
                    .map(
                      (player, idx) => `
                <tr class="border-b border-gray-200">
                  <td class="py-2 pr-1 font-bold text-gray-600">${idx + 1}</td>
                  <td class="py-2 pr-2 font-medium truncate max-w-[120px] text-gray-800">${player.name}</td>
                  <td class="py-2 pr-1 text-center text-gray-600">${player.matches}/${player.totalGames}</td>
                  <td class="py-2 pr-1 text-center font-semibold text-gray-800">${player.points}</td>
                  <td class="py-2 pr-1 text-center hidden sm:table-cell text-gray-600">${player.setsWon}:${player.setsLost}</td>
                  <td class="py-2 text-center hidden md:table-cell ${player.pointDiff > 0 ? 'text-green-600' : player.pointDiff < 0 ? 'text-red-600' : 'text-gray-600'}">${player.pointDiff > 0 ? '+' : ''}${player.pointDiff}</td>
                </tr>
              `
                    )
                    .join("")
            }
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function FrozenGroupTable(groupNum, standings) {
  return `
    <div class="bg-gray-50 rounded-lg p-3 sm:p-4">
      <h3 class="text-lg sm:text-xl font-bold mb-3 text-gray-800">Gruppe ${groupNum} <span class="text-xs font-normal text-gray-500">(Endstand)</span></h3>
      <div class="overflow-x-auto -mx-1">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-xs text-gray-500 border-b">
              <th class="pb-2 pr-1 w-6">#</th>
              <th class="pb-2 pr-2">Spieler</th>
              <th class="pb-2 pr-1 text-center w-10">Sp</th>
              <th class="pb-2 pr-1 text-center w-10">Pkt</th>
              <th class="pb-2 pr-1 text-center hidden sm:table-cell w-14">Sätze</th>
              <th class="pb-2 text-center hidden md:table-cell w-12">Diff</th>
            </tr>
          </thead>
          <tbody>
            ${
              !standings || standings.length === 0
                ? `
                <tr>
                  <td colspan="6" class="text-center py-4 text-gray-500 text-sm">Keine Spieler</td>
                </tr>
              `
                : standings
                    .map(
                      (player, idx) => `
                <tr class="border-b border-gray-200">
                  <td class="py-2 pr-1 font-bold text-gray-600">${idx + 1}</td>
                  <td class="py-2 pr-2 font-medium truncate max-w-[120px] text-gray-800">${player.name}</td>
                  <td class="py-2 pr-1 text-center text-gray-600">${player.matches}/${player.totalGames || 0}</td>
                  <td class="py-2 pr-1 text-center font-semibold text-gray-800">${player.points}</td>
                  <td class="py-2 pr-1 text-center hidden sm:table-cell text-gray-600">${player.setsWon}:${player.setsLost}</td>
                  <td class="py-2 text-center hidden md:table-cell ${(player.pointDiff || 0) > 0 ? 'text-green-600' : (player.pointDiff || 0) < 0 ? 'text-red-600' : 'text-gray-600'}">${(player.pointDiff || 0) > 0 ? '+' : ''}${player.pointDiff || 0}</td>
                </tr>
              `
                    )
                    .join("")
            }
          </tbody>
        </table>
      </div>
    </div>
  `;
}
