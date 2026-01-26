// js/components/GroupTable.js
// Gruppen-Tabelle Komponente

function GroupTable(groupNum, standings) {
  return `
    <div class="bg-gray-50 rounded-lg p-4">
      <h3 class="text-xl font-bold mb-4 text-gray-800">Gruppe ${groupNum}</h3>
      <table class="w-full">
        <thead>
          <tr class="text-left text-sm text-gray-600 border-b">
            <th class="pb-2">Platz</th>
            <th class="pb-2">Spieler</th>
            <th class="pb-2">Sp</th>
            <th class="pb-2">Pkt</th>
            <th class="pb-2">Sätze</th>
          </tr>
        </thead>
        <tbody>
          ${
            standings.length === 0
              ? `
              <tr>
                <td colspan="5" class="text-center py-4 text-gray-500">Keine Spieler in Gruppe ${groupNum}</td>
              </tr>
            `
              : standings
                  .map(
                    (player, idx) => `
              <tr class="border-b border-gray-200">
                <td class="py-2 font-bold">${idx + 1}</td>
                <td class="py-2">${player.name}</td>
                <td class="py-2">${player.matches}</td>
                <td class="py-2 font-semibold">${player.points}</td>
                <td class="py-2">${player.setsWon}:${player.setsLost}</td>
              </tr>
            `
                  )
                  .join("")
          }
        </tbody>
      </table>
    </div>
  `;
}

function FrozenGroupTable(groupNum, standings) {
  return `
    <div class="bg-gray-50 rounded-lg p-4">
      <h3 class="text-xl font-bold mb-4 text-gray-800">Gruppe ${groupNum} <span class="text-sm font-normal text-gray-500">(Endstand)</span></h3>
      <table class="w-full">
        <thead>
          <tr class="text-left text-sm text-gray-600 border-b">
            <th class="pb-2">Platz</th>
            <th class="pb-2">Spieler</th>
            <th class="pb-2">Sp</th>
            <th class="pb-2">Pkt</th>
            <th class="pb-2">Sätze</th>
          </tr>
        </thead>
        <tbody>
          ${
            !standings || standings.length === 0
              ? `
              <tr>
                <td colspan="5" class="text-center py-4 text-gray-500">Keine Spieler in Gruppe ${groupNum}</td>
              </tr>
            `
              : standings
                  .map(
                    (player, idx) => `
              <tr class="border-b border-gray-200">
                <td class="py-2 font-bold">${idx + 1}</td>
                <td class="py-2">${player.name}</td>
                <td class="py-2">${player.matches}</td>
                <td class="py-2 font-semibold">${player.points}</td>
                <td class="py-2">${player.setsWon}:${player.setsLost}</td>
              </tr>
            `
                  )
                  .join("")
          }
        </tbody>
      </table>
    </div>
  `;
}