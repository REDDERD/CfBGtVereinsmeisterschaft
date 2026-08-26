// js/handlers/pyramid-chart-handler.js
let pyramidChartInstance = null;
let pyramidHistoryHiddenPlayers = new Set();

function getDoublesPlayersSortedByPyramid() {
  const flatPyramid = (state.pyramid.levels || []).flat();
  return state.players
    .filter(p => p.doublesPool && p.doublesStartingPosition)
    .sort((a, b) => {
      const ia = flatPyramid.indexOf(a.id);
      const ib = flatPyramid.indexOf(b.id);
      if (ia === -1 && ib === -1) return a.doublesStartingPosition - b.doublesStartingPosition;
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
}

function getPyramidPlayerColor(index, total) {
  const hue = Math.round((360 / Math.max(total, 1)) * index);
  return {
    line:       `hsl(${hue}, 70%, 45%)`,
    chipBg:     `hsl(${hue}, 60%, 93%)`,
    chipBorder: `hsl(${hue}, 65%, 58%)`,
    chipText:   `hsl(${hue}, 65%, 27%)`,
  };
}

function initPyramidHistoryChart() {
  if (pyramidChartInstance) {
    pyramidChartInstance.destroy();
    pyramidChartInstance = null;
  }

  const canvas = document.getElementById('pyramidHistoryChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const history = buildPyramidHistory();
  const doublesPlayers = getDoublesPlayersSortedByPyramid();

  if (history.length === 0 || doublesPlayers.length === 0) return;

  const total = doublesPlayers.length;

  const datasets = doublesPlayers.map((player, i) => {
    const color = getPyramidPlayerColor(i, total).line;
    const data = [];

    history.forEach(snapshot => {
      const y = snapshot.positions.indexOf(player.id) + 1;
      if (y > 0) data.push({ x: snapshot.date.getTime(), y });
    });

    return {
      label: player.name,
      data,
      borderColor: color,
      backgroundColor: color,
      fill: false,
      stepped: false,
      tension: 0,
      pointRadius: 0,
      pointHoverRadius: 4,
      borderWidth: 2,
      hidden: pyramidHistoryHiddenPlayers.has(player.id),
    };
  });

  const isDark = document.documentElement.classList.contains('dark');
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const labelColor = isDark ? '#94a3b8' : '#6b7280';

  pyramidChartInstance = new Chart(canvas, {
    type: 'line',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: {
          type: 'time',
          time: { unit: 'month', displayFormats: { month: 'MMM yy' }, tooltipFormat: 'dd.MM.yyyy' },
          grid: { color: gridColor },
          ticks: { color: labelColor, maxTicksLimit: 7 },
        },
        y: {
          reverse: true,
          min: 1,
          max: total,
          ticks: {
            stepSize: 1,
            color: labelColor,
            callback: v => Number.isInteger(v) ? `#${v}` : '',
          },
          grid: { color: gridColor },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: items => new Date(items[0].parsed.x).toLocaleDateString('de-DE'),
            label: item => ` ${item.dataset.label}: Platz ${item.parsed.y}`,
          },
        },
      },
    },
    // Anchors the floating name chips to their current-rank Y pixel after every render.
    plugins: [{ id: 'pyramidChipSync', afterRender: () => updatePyramidHistoryChips() }],
  });
}

function updatePyramidHistoryChips() {
  const container = document.getElementById('pyramidHistoryChips');
  if (!container || !pyramidChartInstance?.scales?.y) return;

  const history = buildPyramidHistory();
  if (!history.length) return;
  const last = history[history.length - 1];

  const doublesPlayers = getDoublesPlayersSortedByPyramid();
  const total = doublesPlayers.length;

  container.innerHTML = doublesPlayers.map((p, i) => {
    const rank = last.positions.indexOf(p.id) + 1;
    if (rank === 0) return '';
    const y = pyramidChartInstance.scales.y.getPixelForValue(rank);
    const c = getPyramidPlayerColor(i, total);
    const hidden = pyramidHistoryHiddenPlayers.has(p.id);
    return `<button
      id="pht_${p.id}"
      onclick="togglePyramidHistoryPlayer('${p.id}')"
      class="absolute inset-x-0 px-2 py-0.5 rounded-full text-xs font-medium border-2 transition-opacity truncate text-center"
      style="top:${y}px; transform:translateY(-50%); background:${c.chipBg}; border-color:${c.chipBorder}; color:${c.chipText}; opacity:${hidden ? '0.3' : '1'}">${p.name}</button>`;
  }).join('');
}

function togglePyramidHistoryPlayer(playerId) {
  if (pyramidHistoryHiddenPlayers.has(playerId)) {
    pyramidHistoryHiddenPlayers.delete(playerId);
  } else {
    pyramidHistoryHiddenPlayers.add(playerId);
  }

  if (!pyramidChartInstance) return;

  const idx = getDoublesPlayersSortedByPyramid().findIndex(p => p.id === playerId);
  if (idx === -1) return;

  pyramidChartInstance.setDatasetVisibility(idx, !pyramidHistoryHiddenPlayers.has(playerId));
  pyramidChartInstance.update();
}
