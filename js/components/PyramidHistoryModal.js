// js/components/PyramidHistoryModal.js

function pyramidHistoryHasData() {
  return (state.doublesMatches || []).some(m =>
    (m.status || 'confirmed') === 'confirmed' && m.team1 && m.team2 && m.sets?.length
  );
}

function PyramidHistoryModalHTML() {
  const hasData = pyramidHistoryHasData();

  const body = hasData
    ? `
      <div class="flex-1 min-h-0 flex">
        <div class="flex-1 relative min-w-0">
          <canvas id="pyramidHistoryChart" class="absolute inset-0"></canvas>
        </div>
        <div id="pyramidHistoryChips" class="relative flex-shrink-0 w-16"></div>
      </div>`
    : `
      <div class="flex-1 flex items-center justify-center">
        <p class="text-gray-400 text-sm">Noch keine bestätigten Spielergebnisse vorhanden.</p>
      </div>`;

  return `
    <div id="pyramidHistoryModal" class="fixed inset-0 z-50 bg-white flex flex-col">
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
        <h2 class="text-base font-bold text-gray-800">Verlauf Doppel-Pyramide</h2>
        <button onclick="closePyramidHistoryModal()" class="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors" aria-label="Schließen">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      ${body}
    </div>`;
}

function openPyramidHistoryModal() {
  const existing = document.getElementById('pyramidHistoryModal');
  if (existing) existing.remove();

  pyramidHistoryHiddenPlayers = new Set();

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
