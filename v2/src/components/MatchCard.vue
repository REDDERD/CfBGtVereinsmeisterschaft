<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/app.js'
import { formatDate } from '@/utils/helpers.js'

const props = defineProps({
  match: { type: Object, required: true },
  context: { type: String, default: 'home' },
})

const store = useAppStore()

const isSingles = computed(() =>
  props.match.type === 'singles' || (props.match.player1Id && props.match.round)
)
const isKnockout = computed(() =>
  props.match.round && props.match.round !== 'group1' && props.match.round !== 'group2'
)
const status = computed(() => props.match.status || 'confirmed')

const dateStr = computed(() => {
  if (props.match.date) return formatDate(props.match.date)
  if (props.match.createdAt) return formatDate(props.match.createdAt)
  return ''
})

function getPlayerName(id) {
  const p = store.players.find(p => p.id === id)
  return p ? p.name : 'Gelöschter Spieler'
}

const player1Name = computed(() => {
  if (isSingles.value) return getPlayerName(props.match.player1Id)
  const t1p2 = props.match.team1?.player2Id
  return t1p2
    ? `${getPlayerName(props.match.team1.player1Id)} / ${getPlayerName(t1p2)}`
    : getPlayerName(props.match.team1?.player1Id)
})
const player2Name = computed(() => {
  if (isSingles.value) return getPlayerName(props.match.player2Id)
  const t2p2 = props.match.team2?.player2Id
  return t2p2
    ? `${getPlayerName(props.match.team2.player1Id)} / ${getPlayerName(t2p2)}`
    : getPlayerName(props.match.team2?.player1Id)
})

const scoreText = computed(() => {
  if (!props.match.sets) return 'Ausstehend'
  return isSingles.value
    ? props.match.sets.map(s => `${s.p1}:${s.p2}`).join(', ')
    : props.match.sets.map(s => `${s.t1}:${s.t2}`).join(', ')
})

const player1Sets = computed(() => {
  if (!props.match.sets) return 0
  return isSingles.value
    ? props.match.sets.filter(s => s.p1 > s.p2).length
    : props.match.sets.filter(s => s.t1 > s.t2).length
})
const player2Sets = computed(() => {
  if (!props.match.sets) return 0
  return isSingles.value
    ? props.match.sets.filter(s => s.p2 > s.p1).length
    : props.match.sets.filter(s => s.t2 > s.t1).length
})

const p1Wins = computed(() => player1Sets.value > player2Sets.value)
const p2Wins = computed(() => player2Sets.value > player1Sets.value)

const roundName = computed(() => {
  const map = { final: 'Finale', semifinal: 'HF', semi: 'HF', quarterfinal: 'VF', quarter: 'VF', round16: 'AF', thirdPlace: 'Pl.3' }
  return map[props.match.round] || props.match.round
})

const showStatus = computed(() => {
  if (props.context !== 'admin' && props.context !== 'matches') return false
  if (props.context === 'matches' && status.value !== 'unconfirmed') return false
  return true
})

const statusLabel = computed(() => ({ unconfirmed: 'Offen', confirmed: 'OK', rejected: 'Abgelehnt' }[status.value] || 'OK'))
const statusClass = computed(() => ({
  unconfirmed: 'bg-orange-100 text-orange-800 border-orange-300',
  confirmed: 'bg-green-100 text-green-800 border-green-300',
  rejected: 'bg-red-100 text-red-800 border-red-300',
}[status.value] || 'bg-green-100 text-green-800 border-green-300'))
</script>

<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:border-gray-300 transition-colors">
    <div class="flex items-start justify-between gap-2">
      <div class="flex-1 min-w-0">
        <div class="flex flex-wrap items-center gap-1 mb-1.5">
          <span v-if="isSingles" class="px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold rounded bg-yellow-100 text-yellow-800 border border-yellow-300">Einzel</span>
          <span v-else class="px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold rounded bg-blue-100 text-blue-800 border border-blue-300">Doppel</span>
          <span v-if="isKnockout" class="px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold rounded bg-purple-100 text-purple-800 border border-purple-300">{{ roundName }}</span>
          <span v-if="match.walkover" class="px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold rounded bg-gray-100 text-gray-500 border border-gray-300">Kampflos</span>
          <span v-if="showStatus" :class="['px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold rounded border', statusClass]">{{ statusLabel }}</span>
          <span v-if="dateStr" class="text-xs text-gray-400">{{ dateStr }}</span>
        </div>

        <div class="flex items-center gap-1.5 text-sm sm:text-base mb-0.5">
          <span class="truncate" :class="p1Wins ? 'text-green-600 font-bold' : 'font-medium text-gray-800 dark:text-gray-200'">{{ player1Name }}</span>
          <span class="flex-shrink-0">
            <span class="text-indigo-600 font-bold">{{ player1Sets }}</span>
            <span class="text-gray-400 mx-0.5">:</span>
            <span class="text-indigo-600 font-bold">{{ player2Sets }}</span>
          </span>
        </div>
        <div class="flex items-center gap-1.5 text-sm sm:text-base">
          <span class="truncate" :class="p2Wins ? 'text-green-600 font-bold' : 'font-medium text-gray-800 dark:text-gray-200'">{{ player2Name }}</span>
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ scoreText }}</div>
      </div>
    </div>
  </div>
</template>
