<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useAppStore } from '@/stores/app.js'
import {
  Chart, LineController, LineElement, PointElement,
  LinearScale, TimeScale, Tooltip,
} from 'chart.js'
import 'chartjs-adapter-date-fns'

Chart.register(LineController, LineElement, PointElement, LinearScale, TimeScale, Tooltip)

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue'])

const store = useAppStore()
const canvasRef = ref(null)
let chartInstance = null
const hiddenPlayers = ref(new Set())
const chipPositions = ref([])

const doublesPlayers = computed(() => {
  const flat = (store.pyramid.levels || []).flat()
  return store.players
    .filter(p => p.doublesPool && p.doublesStartingPosition)
    .sort((a, b) => {
      const ia = flat.indexOf(a.id), ib = flat.indexOf(b.id)
      if (ia === -1 && ib === -1) return a.doublesStartingPosition - b.doublesStartingPosition
      if (ia === -1) return 1
      if (ib === -1) return -1
      return ia - ib
    })
})

const hasData = computed(() =>
  (store.doublesMatches || []).some(m =>
    (m.status || 'confirmed') === 'confirmed' && m.team1 && m.team2 && m.sets?.length,
  ),
)

// Builds position history with exactly one entry per day (end-of-day state).
function buildHistory() {
  const players = doublesPlayers.value
  if (!players.length) return []

  const maxPos = Math.max(...players.map(p => p.doublesStartingPosition))
  const arr = new Array(maxPos).fill(null)
  players.forEach(p => { arr[p.doublesStartingPosition - 1] = p.id })
  let flat = arr.filter(Boolean)

  const matches = (store.doublesMatches || [])
    .filter(m => (m.status || 'confirmed') === 'confirmed' && m.team1 && m.team2 && m.sets?.length)
    .sort((a, b) => (a.date?.seconds || 0) - (b.date?.seconds || 0))

  if (!matches.length) return []

  const byDay = new Map()
  matches.forEach(m => {
    const d = m.date?.toDate ? m.date.toDate() : new Date((m.date?.seconds || 0) * 1000)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (!byDay.has(key)) byDay.set(key, [])
    byDay.get(key).push(m)
  })

  const history = []
  byDay.forEach((dayMatches, key) => {
    dayMatches.forEach(match => {
      let t1 = 0, t2 = 0
      match.sets.forEach(s => { (s.t1 ?? s.p1) > (s.t2 ?? s.p2) ? t1++ : t2++ })
      const winnerId = t1 > t2 ? match.team1.player1Id : match.team2.player1Id
      const loserId  = t1 > t2 ? match.team2.player1Id : match.team1.player1Id
      const wi = flat.indexOf(winnerId), li = flat.indexOf(loserId)
      if (wi === -1 || li === -1) return
      if (wi > li) { flat.splice(wi, 1); flat.splice(li, 0, winnerId) }
    })
    history.push({ date: new Date(key), positions: [...flat] })
  })

  return history
}

function playerColor(i, total) {
  return `hsl(${Math.round((360 / Math.max(total, 1)) * i)},70%,45%)`
}

function chipStyle(i, total) {
  const hue = Math.round((360 / Math.max(total, 1)) * i)
  return {
    background: `hsl(${hue},60%,93%)`,
    borderColor: `hsl(${hue},65%,58%)`,
    color: `hsl(${hue},65%,27%)`,
  }
}

// Called by Chart.js afterRender plugin — positions chips at current-rank Y pixels.
function updateChipPositions() {
  if (!chartInstance?.scales?.y) return
  const history = buildHistory()
  if (!history.length) return
  const last = history[history.length - 1]
  chipPositions.value = doublesPlayers.value
    .map((p, i) => {
      const rank = last.positions.indexOf(p.id) + 1
      if (rank === 0) return null
      return { id: p.id, name: p.name, i, y: chartInstance.scales.y.getPixelForValue(rank) }
    })
    .filter(Boolean)
}

function initChart() {
  if (chartInstance) { chartInstance.destroy(); chartInstance = null }
  chipPositions.value = []
  if (!canvasRef.value) return

  const history = buildHistory()
  const players = doublesPlayers.value
  if (!history.length || !players.length) return

  const total = players.length
  const isDark = document.documentElement.classList.contains('dark')
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
  const labelColor = isDark ? '#94a3b8' : '#6b7280'

  chartInstance = new Chart(canvasRef.value, {
    type: 'line',
    data: {
      datasets: players.map((p, i) => ({
        label: p.name,
        data: history.flatMap(snap => {
          const y = snap.positions.indexOf(p.id) + 1
          return y > 0 ? [{ x: snap.date.getTime(), y }] : []
        }),
        borderColor: playerColor(i, total),
        backgroundColor: playerColor(i, total),
        fill: false,
        stepped: false,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 5,
        borderWidth: 2,
        hidden: hiddenPlayers.value.has(p.id),
      })),
    },
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
    // Local plugin: recalculate chip positions after every render (including resize).
    plugins: [{ id: 'chipSync', afterRender: () => updateChipPositions() }],
  })
}

function togglePlayer(player) {
  const s = new Set(hiddenPlayers.value)
  if (s.has(player.id)) s.delete(player.id)
  else s.add(player.id)
  hiddenPlayers.value = s

  if (!chartInstance) return
  const idx = doublesPlayers.value.findIndex(p => p.id === player.id)
  if (idx !== -1) {
    chartInstance.setDatasetVisibility(idx, !hiddenPlayers.value.has(player.id))
    chartInstance.update()
  }
}

watch(() => props.modelValue, async open => {
  if (open) {
    hiddenPlayers.value = new Set()
    await nextTick()
    initChart()
  } else {
    if (chartInstance) { chartInstance.destroy(); chartInstance = null }
    chipPositions.value = []
  }
})

function onKey(e) { if (e.key === 'Escape') emit('update:modelValue', false) }
onMounted(() => document.addEventListener('keydown', onKey))
onUnmounted(() => {
  document.removeEventListener('keydown', onKey)
  if (chartInstance) { chartInstance.destroy(); chartInstance = null }
})
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col">

      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <h2 class="text-base font-bold text-gray-800 dark:text-gray-100">Verlauf Doppel-Pyramide</h2>
        <button @click="emit('update:modelValue', false)"
          class="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Schließen">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- No data -->
      <div v-if="!hasData" class="flex-1 flex items-center justify-center">
        <p class="text-gray-400 dark:text-gray-500 text-sm">Noch keine bestätigten Spielergebnisse vorhanden.</p>
      </div>

      <!-- Chart + chips column -->
      <div v-else class="flex-1 min-h-0 flex">

        <!-- Canvas -->
        <div class="flex-1 relative min-w-0">
          <canvas ref="canvasRef" class="absolute inset-0" />
        </div>

        <!-- Player chips anchored to their current Y-axis position -->
        <div class="relative flex-shrink-0 w-16">
          <button
            v-for="cp in chipPositions" :key="cp.id"
            @click="togglePlayer(cp)"
            :style="{
              ...chipStyle(cp.i, doublesPlayers.length),
              top: cp.y + 'px',
              transform: 'translateY(-50%)',
            }"
            class="absolute inset-x-0 px-2 py-0.5 rounded-full text-xs font-medium border-2 transition-opacity truncate text-center"
            :class="hiddenPlayers.has(cp.id) ? 'opacity-30' : 'opacity-100'">
            {{ cp.name }}
          </button>
        </div>

      </div>

    </div>
  </Teleport>
</template>
