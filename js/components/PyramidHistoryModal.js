// js/components/PyramidHistoryModal.js

function PyramidHistoryModalHTML() {
  const doublesPlayers = getDoublesPlayersSortedByPyramid();
  const total = doublesPlayers.length;

  const chips = doublesPlayers.map((p, i) => {
    const c = getPyramidPlayerColor(i, total);
    const hidden = pyramidHistoryHiddenPlayers.has(p.id);
    return `<button
      id="pht_${p.id}"
      onclick="togglePyramidHistoryPlayer('${p.id}')"
      class="px-2 py-0.5 rounded-full text-xs font-medium border-2 transition-opacity"
      style="background:${c.chipBg}; border-color:${c.chipBorder}; color:${c.chipText}; opacity:${hidden ? '0.3' : '1'}">${p.name}</button>`;
  }).join('');

  return `
    <div id="pyramidHistoryModal" class="fixed inset-0 z-50 bg-white flex flex-col">
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
        <h2 class="text-base font-bold text-gray-800">Verlauf Doppel</h2>
        <button onclick="closePyramidHistoryModal()" class="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors" aria-label="Schließen">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="px-4 py-2.5 border-b border-gray-100 flex-shrink-0 flex flex-wrap gap-1.5">
        ${chips}
      </div>
      <div style="flex:1; min-height:0; padding:1rem; position:relative;">
        <canvas id="pyramidHistoryChart" style="position:absolute; inset:1rem;"></canvas>
      </div>
    </div>`;
}

function openPyramidHistoryModal() {
  const existing = document.getElementById('pyramidHistoryModal');
  if (existing) existing.remove();

  // Beim Öffnen: erste 5 einblenden, Rest ausblenden
  const sorted = getDoublesPlayersSortedByPyramid();
  pyramidHistoryHiddenPlayers = new Set(sorted.slice(5).map(p => p.id));

  const tmp = document.createElement('div');
  tmp.innerHTML = PyramidHistoryModalHTML();
  document.body.appendChild(tmp.firstElementChild);

  initPyramidHistoryChart();

  document.addEventListener('keydown', _pyramidModalEscHandler);
}

function closePyramidHistoryModal() {
  document.removeEventListener('keydown', _pyramidModalEscHandler);
  if (pyramidChartInstance) {
    pyramidChartInstance.destroy();
    pyramidChartInstance = null;
  }
  const modal = document.getElementById('pyramidHistoryModal');
  if (modal) modal.remove();
}

function _pyramidModalEscHandler(e) {
  if (e.key === 'Escape') closePyramidHistoryModal();
}
