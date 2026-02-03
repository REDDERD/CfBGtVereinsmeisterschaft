// js/components/GroupTable.js
// Gruppen-Tabelle Komponente

function GroupTable(groupNum, standings) {
  return `
    <div class="bg-gray-50 rounded-lg p-4">
      <h3 class="text-xl font-bold mb-4 text-gray-800">Gruppe ${groupNum}</h3>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left text-sm text-gray-600 border-b">
              <th class="pb-2 pr-2"></th>
              <th class="pb-2 pr-2">Spieler</th>
              <th class="pb-2 pr-2 ">Sp</th>
              <th class="pb-2 pr-2">Pkt</th>
              <th class="pb-2 pr-2 hidden md:table-cell">Sätze</th>
              <th class="pb-2 hidden lg:table-cell">Diff</th>
            </tr>
          </thead>
          <tbody>
            ${
              standings.length === 0
                ? `
                <tr>
                  <td colspan="6" class="text-center py-4 text-gray-500">Keine Spieler in Gruppe ${groupNum}</td>
                </tr>
              `
                : standings
                    .map(
                      (player, idx) => `
                <tr class="border-b border-gray-200">
                  <td class="py-2 pr-2 font-bold">${idx + 1}</td>
                  <td class="py-2 pr-2">${player.name}</td>
                  <td class="py-2 pr-2">${player.matches}/${player.totalGames}</td>
                  <td class="py-2 pr-2 font-semibold">${player.points}</td>
                  <td class="py-2 pr-2 hidden md:table-cell">${player.setsWon}:${player.setsLost}</td>
                  <td class="py-2 hidden lg:table-cell ${player.pointDiff > 0 ? 'text-green-600' : player.pointDiff < 0 ? 'text-red-600' : 'text-gray-600'}">${player.pointDiff > 0 ? '+' : ''}${player.pointDiff}</td>
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
    <div class="bg-gray-50 rounded-lg p-4">
      <h3 class="text-xl font-bold mb-4 text-gray-800">Gruppe ${groupNum} <span class="text-sm font-normal text-gray-500">(Endstand)</span></h3>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left text-sm text-gray-600 border-b">
              <th class="pb-2 pr-2">#</th>
              <th class="pb-2 pr-2">Spieler</th>
              <th class="pb-2 pr-2">Sp</th>
              <th class="pb-2 pr-2">Pkt</th>
              <th class="pb-2 pr-2 hidden md:table-cell">Sätze</th>
              <th class="pb-2 hidden lg:table-cell">Diff</th>
            </tr>
          </thead>
          <tbody>
            ${
              !standings || standings.length === 0
                ? `
                <tr>
                  <td colspan="6" class="text-center py-4 text-gray-500">Keine Spieler in Gruppe ${groupNum}</td>
                </tr>
              `
                : standings
                    .map(
                      (player, idx) => `
                <tr class="border-b border-gray-200">
                  <td class="py-2 pr-2 font-bold">${idx + 1}</td>
                  <td class="py-2 pr-2">${player.name}</td>
                  <td class="py-2 pr-2">${player.matches}/${player.totalGames || 0}</td>
                  <td class="py-2 pr-2 font-semibold">${player.points}</td>
                  <td class="py-2 pr-2 hidden md:table-cell">${player.setsWon}:${player.setsLost}</td>
                  <td class="py-2 hidden lg:table-cell ${(player.pointDiff || 0) > 0 ? 'text-green-600' : (player.pointDiff || 0) < 0 ? 'text-red-600' : 'text-gray-600'}">${(player.pointDiff || 0) > 0 ? '+' : ''}${player.pointDiff || 0}</td>
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