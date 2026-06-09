<script setup>
import { computed, ref, reactive } from 'vue'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase/index.js'
import { useAppStore } from '@/stores/app.js'
import { calculateStandings } from '@/utils/calculations.js'

const store = useAppStore()
const config = computed(() => store.knockoutConfig || {})

const entryModal = ref(null)
const entryForm = reactive({ set1P1: '', set1P2: '', set2P1: '', set2P2: '', set3P1: '', set3P2: '' })
const set3Disabled = ref(true)

function getPositionPlayerId(position) {
  if (!position) return null
  const [group, place] = position.split('p')
  const groupNum = group === 'g1' ? 1 : 2
  const placeNum = parseInt(place)
  const standings = store.frozenStandings
    ? (groupNum === 1 ? store.frozenStandings.group1 : store.frozenStandings.group2)
    : calculateStandings(groupNum)
  return standings[placeNum - 1]?.id || null
}

function getKnockoutMatch(round, matchNum) {
  return store.knockoutMatches.find(m => m.round === round && m.matchNum === matchNum)
}

function getWinner(round, matchNum) {
  const m = getKnockoutMatch(round, matchNum)
  if (!m?.sets) return null
  let p1 = 0, p2 = 0
  m.sets.forEach(s => { if (s.p1 > s.p2) p1++; else p2++ })
  return p1 > p2 ? m.player1Id : m.player2Id
}

function getLoser(round, matchNum) {
  const m = getKnockoutMatch(round, matchNum)
  if (!m?.sets) return null
  let p1 = 0, p2 = 0
  m.sets.forEach(s => { if (s.p1 > s.p2) p1++; else p2++ })
  return p1 > p2 ? m.player2Id : m.player1Id
}

function getMatchPlayers(round, matchNum) {
  let p1Id = null, p2Id = null
  if (round === 'quarter') {
    p1Id = getPositionPlayerId(config.value[`qf_${matchNum}_p1`])
    p2Id = getPositionPlayerId(config.value[`qf_${matchNum}_p2`])
  } else if (round === 'semi') {
    p1Id = matchNum === 1 ? getWinner('quarter', 1) : getWinner('quarter', 3)
    p2Id = matchNum === 1 ? getWinner('quarter', 2) : getWinner('quarter', 4)
  } else if (round === 'thirdPlace') {
    p1Id = getLoser('semi', 1)
    p2Id = getLoser('semi', 2)
  } else if (round === 'final') {
    p1Id = getWinner('semi', 1)
    p2Id = getWinner('semi', 2)
  }
  const n = id => id ? (store.players.find(p => p.id === id)?.name || id) : null
  return { p1Id, p2Id, p1Name: n(p1Id) || 'TBD', p2Name: n(p2Id) || 'TBD' }
}

function openEntry(round, matchNum) {
  const players = getMatchPlayers(round, matchNum)
  entryModal.value = { round, matchNum, ...players }
  Object.assign(entryForm, { set1P1: '', set1P2: '', set2P1: '', set2P2: '', set3P1: '', set3P2: '' })
  set3Disabled.value = true
}

function onScoreInput() {
  const s1p1 = parseInt(entryForm.set1P1), s1p2 = parseInt(entryForm.set1P2)
  const s2p1 = parseInt(entryForm.set2P1), s2p2 = parseInt(entryForm.set2P2)
  if (!isNaN(s1p1) && !isNaN(s1p2) && !isNaN(s2p1) && !isNaN(s2p2)) {
    set3Disabled.value = (s1p1 > s1p2 ? 1 : 2) === (s2p1 > s2p2 ? 1 : 2)
    if (set3Disabled.value) { entryForm.set3P1 = ''; entryForm.set3P2 = '' }
  } else {
    set3Disabled.value = true
  }
}

async function saveKnockoutMatch() {
  if (!entryModal.value) return
  const { round, matchNum, p1Id, p2Id } = entryModal.value
  const sets = [
    { p1: parseInt(entryForm.set1P1) || 0, p2: parseInt(entryForm.set1P2) || 0 },
    { p1: parseInt(entryForm.set2P1) || 0, p2: parseInt(entryForm.set2P2) || 0 },
  ]
  if (!set3Disabled.value && entryForm.set3P1 !== '' && entryForm.set3P2 !== '') {
    sets.push({ p1: parseInt(entryForm.set3P1) || 0, p2: parseInt(entryForm.set3P2) || 0 })
  }
  try {
    const id = `${round}_${matchNum}`
    await setDoc(doc(db, 'seasons', String(store.activeSeason), 'singlesMatches', id), {
      round, matchNum, player1Id: p1Id, player2Id: p2Id, sets,
      status: 'confirmed', date: serverTimestamp(),
    })
    entryModal.value = null
  } catch (e) {
    console.error(e)
  }
}

const roundNames = { quarter: 'Viertelfinale', semi: 'Halbfinale', thirdPlace: 'Platz 3', final: 'Finale' }
</script>

<template>
  <div class="space-y-4">
    <div class="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-3 sm:p-6 rounded-lg border-2 border-yellow-400">
      <h3 class="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">K.O.-Phase</h3>

      <!-- Viertelfinale -->
      <div class="mb-4">
        <h4 class="font-bold text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base">Viertelfinale</h4>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <KOMatchCard v-for="n in 4" :key="n" :round="'quarter'" :match-num="n" :title="`VF ${n}`"
            :match="getKnockoutMatch('quarter', n)" :players="getMatchPlayers('quarter', n)"
            border-color="blue" @enter="openEntry('quarter', n)" />
        </div>
      </div>

      <!-- Halbfinale -->
      <div class="mb-4">
        <h4 class="font-bold text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base">Halbfinale</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
          <KOMatchCard v-for="n in 2" :key="n" :round="'semi'" :match-num="n" :title="`HF ${n}`"
            :match="getKnockoutMatch('semi', n)" :players="getMatchPlayers('semi', n)"
            border-color="blue" @enter="openEntry('semi', n)" />
        </div>
      </div>

      <!-- Finale & Platz 3 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
        <KOMatchCard round="thirdPlace" :match-num="1" title="Spiel um Platz 3"
          :match="getKnockoutMatch('thirdPlace', 1)" :players="getMatchPlayers('thirdPlace', 1)"
          border-color="amber" @enter="openEntry('thirdPlace', 1)" />
        <KOMatchCard round="final" :match-num="1" title="Finale"
          :match="getKnockoutMatch('final', 1)" :players="getMatchPlayers('final', 1)"
          border-color="yellow" @enter="openEntry('final', 1)" />
      </div>
    </div>

    <!-- Entry Modal -->
    <Teleport to="body">
      <div v-if="entryModal" class="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
        <div class="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-lg p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">
              {{ roundNames[entryModal.round] }} {{ entryModal.round !== 'thirdPlace' && entryModal.round !== 'final' ? entryModal.matchNum : '' }}
            </h3>
            <button @click="entryModal = null" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">✕</button>
          </div>
          <div class="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-center">
            <div class="font-bold text-base sm:text-lg dark:text-gray-100">{{ entryModal.p1Name }}</div>
            <div class="text-gray-500 text-sm my-1">vs</div>
            <div class="font-bold text-base sm:text-lg dark:text-gray-100">{{ entryModal.p2Name }}</div>
          </div>
          <div class="space-y-3 mb-5">
            <div v-for="i in 3" :key="i" class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400 w-12 flex-shrink-0">Satz {{ i }}</span>
              <input v-if="i === 1" v-model="entryForm.set1P1" type="number" min="0" max="30" @input="onScoreInput"
                :placeholder="entryModal.p1Name.substring(0, 6)"
                class="flex-1 px-3 py-2.5 border rounded-lg text-center dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" />
              <input v-else-if="i === 2" v-model="entryForm.set2P1" type="number" min="0" max="30" @input="onScoreInput"
                :placeholder="entryModal.p1Name.substring(0, 6)"
                class="flex-1 px-3 py-2.5 border rounded-lg text-center dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" />
              <input v-else v-model="entryForm.set3P1" type="number" min="0" max="30"
                :disabled="set3Disabled" :placeholder="entryModal.p1Name.substring(0, 6)"
                class="flex-1 px-3 py-2.5 border rounded-lg text-center dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                :class="{ 'bg-gray-200 dark:bg-gray-700': set3Disabled }" />
              <span class="text-gray-400 font-bold">:</span>
              <input v-if="i === 1" v-model="entryForm.set1P2" type="number" min="0" max="30" @input="onScoreInput"
                :placeholder="entryModal.p2Name.substring(0, 6)"
                class="flex-1 px-3 py-2.5 border rounded-lg text-center dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" />
              <input v-else-if="i === 2" v-model="entryForm.set2P2" type="number" min="0" max="30" @input="onScoreInput"
                :placeholder="entryModal.p2Name.substring(0, 6)"
                class="flex-1 px-3 py-2.5 border rounded-lg text-center dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" />
              <input v-else v-model="entryForm.set3P2" type="number" min="0" max="30"
                :disabled="set3Disabled" :placeholder="entryModal.p2Name.substring(0, 6)"
                class="flex-1 px-3 py-2.5 border rounded-lg text-center dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                :class="{ 'bg-gray-200 dark:bg-gray-700': set3Disabled }" />
            </div>
          </div>
          <div class="flex gap-3">
            <button @click="entryModal = null" class="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 font-medium">Abbrechen</button>
            <button @click="saveKnockoutMatch" class="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">Speichern</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
const KOMatchCard = {
  props: {
    round: String, matchNum: Number, title: String,
    match: Object, players: Object, borderColor: { type: String, default: 'blue' },
  },
  emits: ['enter'],
  setup(props, { emit }) {
    const store = useAppStore()
    const isPlayed = computed(() => props.match && props.match.sets)
    const canPlay = computed(() => props.players.p1Id && props.players.p2Id)
    const winnerId = computed(() => {
      if (!isPlayed.value) return null
      let p1 = 0, p2 = 0
      props.match.sets.forEach(s => { if (s.p1 > s.p2) p1++; else p2++ })
      return p1 > p2 ? props.match.player1Id : props.match.player2Id
    })
    function getSetScores(isP1) {
      if (!isPlayed.value) return []
      return props.match.sets.map(s => ({
        score: isP1 ? s.p1 : s.p2,
        opp: isP1 ? s.p2 : s.p1,
        won: isP1 ? s.p1 > s.p2 : s.p2 > s.p1,
      }))
    }
    return { store, isPlayed, canPlay, winnerId, getSetScores, emit }
  },
  template: `
    <div class="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border-2" :class="'border-' + borderColor + '-400'">
      <div class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ title }}</div>
      <div class="space-y-1.5">
        <div v-for="(pid, idx) in [players.p1Id, players.p2Id]" :key="idx"
          class="px-2.5 py-2 rounded text-sm flex justify-between items-center gap-2"
          :class="isPlayed && winnerId === pid ? 'bg-green-100 dark:bg-green-900/40 font-bold' : 'bg-gray-50 dark:bg-gray-700'">
          <span class="truncate flex-1 dark:text-gray-200">{{ idx === 0 ? players.p1Name : players.p2Name }}</span>
          <div v-if="isPlayed" class="flex gap-0.5 flex-shrink-0">
            <span v-for="(s, si) in getSetScores(idx === 0)" :key="si"
              class="inline-block px-1.5 py-0.5 text-xs rounded"
              :class="s.won ? 'border border-green-600 bg-white dark:bg-green-900 font-semibold' : 'bg-gray-100 dark:bg-gray-600'">
              {{ s.score }}
            </span>
          </div>
        </div>
        <div class="text-center text-xs text-gray-400">vs</div>
      </div>
      <button v-if="!isPlayed && store.user && !store.archiveMode && canPlay"
        @click="emit('enter')"
        class="mt-2 w-full px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
        Ergebnis eintragen
      </button>
      <div v-else-if="!isPlayed && store.user && !store.archiveMode"
        class="mt-2 text-center text-xs text-gray-400">Warte auf vorherige Spiele</div>
    </div>
  `,
}
</script>
