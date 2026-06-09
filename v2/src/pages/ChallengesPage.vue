<script setup>
import { ref, computed } from 'vue'
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase/index.js'
import { useAppStore } from '@/stores/app.js'
import { useFirebaseListeners } from '@/composables/useFirebaseListeners.js'

useFirebaseListeners()
const store = useAppStore()

const view = ref('singles')
const singlesSearch = ref('')

// ----- Singles helpers -----
const group1Players = computed(() => store.players.filter(p => p.singlesGroup === 1))
const group2Players = computed(() => store.players.filter(p => p.singlesGroup === 2))

function generateMatchups(players) {
  const result = []
  for (let i = 0; i < players.length; i++)
    for (let j = i + 1; j < players.length; j++)
      result.push({ player1: players[i], player2: players[j] })
  return result
}

const filteredGroup1 = computed(() => {
  const q = singlesSearch.value.toLowerCase()
  return generateMatchups(group1Players.value).filter(m =>
    !q || m.player1.name.toLowerCase().includes(q) || m.player2.name.toLowerCase().includes(q)
  )
})
const filteredGroup2 = computed(() => {
  const q = singlesSearch.value.toLowerCase()
  return generateMatchups(group2Players.value).filter(m =>
    !q || m.player1.name.toLowerCase().includes(q) || m.player2.name.toLowerCase().includes(q)
  )
})

function getMatchesForPairing(p1Id, p2Id) {
  return store.singlesMatches
    .filter(m => (m.player1Id === p1Id && m.player2Id === p2Id) || (m.player1Id === p2Id && m.player2Id === p1Id))
    .filter(m => m.date && m.date.seconds)
    .sort((a, b) => a.date.seconds - b.date.seconds)
    .slice(0, 2)
}

function getMatchResult(match, p1Id) {
  if (!match?.sets) return null
  let p1Sets = 0, p2Sets = 0
  match.sets.forEach(s => { if (s.p1 > s.p2) p1Sets++; else p2Sets++ })
  const isP1 = match.player1Id === p1Id
  const setDetails = match.sets.map(s => isP1 ? { p1: s.p1, p2: s.p2 } : { p1: s.p2, p2: s.p1 })
  return {
    p1Sets: isP1 ? p1Sets : p2Sets,
    p2Sets: isP1 ? p2Sets : p1Sets,
    setDetails,
    date: match.date,
  }
}

function formatDate(val) {
  return val?.seconds ? new Date(val.seconds * 1000).toLocaleDateString('de-DE') : ''
}

// ----- Doubles -----
const doublesPlayers = computed(() => store.players.filter(p => p.doublesPool))
const todayStr = new Date().toISOString().split('T')[0]
const newChallenger = ref('')
const newChallenged = ref('')
const challengeDate = ref('')

async function addChallenge() {
  if (!newChallenger.value || !newChallenged.value || !challengeDate.value) return
  try {
    await addDoc(collection(db, 'seasons', String(store.activeSeason), 'challenges'), {
      challengerId: newChallenger.value,
      challengedId: newChallenged.value,
      date: { seconds: new Date(challengeDate.value).getTime() / 1000 },
      status: 'pending',
      createdAt: serverTimestamp(),
    })
    newChallenger.value = ''; newChallenged.value = ''; challengeDate.value = ''
  } catch (e) { console.error(e) }
}

async function markCompleted(id) {
  await updateDoc(doc(db, 'seasons', String(store.activeSeason), 'challenges', id), { status: 'completed' })
}

function isOverdue(c) {
  const today = new Date(); today.setHours(0,0,0,0)
  return (c.date?.seconds || 0) < today.getTime() / 1000
}
</script>

<template>
  <div class="container mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
      <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">Herausforderungen</h2>

      <div class="mb-4 flex gap-2">
        <button @click="view = 'singles'" class="flex-1 px-3 sm:px-6 py-2.5 rounded-lg font-semibold transition-all text-sm sm:text-base"
          :class="view === 'singles' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300'">Einzel</button>
        <button @click="view = 'doubles'" class="flex-1 px-3 sm:px-6 py-2.5 rounded-lg font-semibold transition-all text-sm sm:text-base"
          :class="view === 'doubles' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300'">Doppel</button>
      </div>

      <!-- ===== EINZEL ===== -->
      <div v-if="view === 'singles'">
        <div v-if="store.knockoutPhaseActive" class="mb-4 p-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 rounded-lg">
          <p class="text-xs sm:text-sm text-blue-800 dark:text-blue-300">Die Gruppenphase ist beendet.</p>
        </div>

        <input v-model="singlesSearch" type="text" placeholder="Spieler suchen..."
          class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg mb-4" />

        <div v-if="filteredGroup1.length === 0 && filteredGroup2.length === 0" class="text-center py-6 text-gray-500 text-sm">
          Keine Paarungen gefunden
        </div>

        <template v-else>
          <div v-if="filteredGroup1.length > 0" class="mb-6">
            <h3 class="text-sm sm:text-base font-bold text-gray-700 dark:text-gray-300 mb-3">Gruppe 1</h3>
            <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              <div v-for="m in filteredGroup1" :key="m.player1.id + m.player2.id"
                class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm p-3">
                <div class="text-center mb-2">
                  <h3 class="font-bold text-gray-800 dark:text-gray-100 text-sm">
                    {{ m.player1.name }} <span class="text-gray-400 mx-1">vs</span> {{ m.player2.name }}
                  </h3>
                  <p class="text-[10px] text-gray-400">Gruppe 1</p>
                </div>
                <MatchSlot v-for="(label, idx) in ['Hinspiel', 'Rückspiel']" :key="label"
                  :label="label"
                  :result="idx === 0 ? getMatchResult(getMatchesForPairing(m.player1.id, m.player2.id)[0], m.player1.id) : getMatchResult(getMatchesForPairing(m.player1.id, m.player2.id)[1], m.player1.id)"
                  :can-enter="(idx === 0) || !!getMatchResult(getMatchesForPairing(m.player1.id, m.player2.id)[0], m.player1.id)"
                  :p1="m.player1" :p2="m.player2"
                  :knockout-active="store.knockoutPhaseActive"
                  :logged-in="!!store.user" :read-only="store.archiveMode"
                  :format-date="formatDate" />
              </div>
            </div>
          </div>

          <div v-if="filteredGroup2.length > 0">
            <h3 class="text-sm sm:text-base font-bold text-gray-700 dark:text-gray-300 mb-3">Gruppe 2</h3>
            <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              <div v-for="m in filteredGroup2" :key="m.player1.id + m.player2.id"
                class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm p-3">
                <div class="text-center mb-2">
                  <h3 class="font-bold text-gray-800 dark:text-gray-100 text-sm">
                    {{ m.player1.name }} <span class="text-gray-400 mx-1">vs</span> {{ m.player2.name }}
                  </h3>
                  <p class="text-[10px] text-gray-400">Gruppe 2</p>
                </div>
                <MatchSlot v-for="(label, idx) in ['Hinspiel', 'Rückspiel']" :key="label"
                  :label="label"
                  :result="idx === 0 ? getMatchResult(getMatchesForPairing(m.player1.id, m.player2.id)[0], m.player1.id) : getMatchResult(getMatchesForPairing(m.player1.id, m.player2.id)[1], m.player1.id)"
                  :can-enter="(idx === 0) || !!getMatchResult(getMatchesForPairing(m.player1.id, m.player2.id)[0], m.player1.id)"
                  :p1="m.player1" :p2="m.player2"
                  :knockout-active="store.knockoutPhaseActive"
                  :logged-in="!!store.user" :read-only="store.archiveMode"
                  :format-date="formatDate" />
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- ===== DOPPEL ===== -->
      <div v-else class="space-y-4 sm:space-y-6">
        <div v-if="store.user && !store.archiveMode" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-6">
          <h3 class="text-base sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">Neue Herausforderung</h3>
          <div class="space-y-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 mb-3">
            <div>
              <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase">Herausforderer</label>
              <select v-model="newChallenger" class="w-full px-2 py-2.5 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 text-sm">
                <option value="">Auswählen...</option>
                <option v-for="p in doublesPlayers" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase">Herausgeforderter</label>
              <select v-model="newChallenged" class="w-full px-2 py-2.5 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 text-sm">
                <option value="">Auswählen...</option>
                <option v-for="p in doublesPlayers" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase">Datum</label>
              <input v-model="challengeDate" type="date" :min="todayStr"
                class="w-full px-2 py-2.5 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 text-sm" />
            </div>
          </div>
          <button @click="addChallenge" class="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm">
            Herausforderung eintragen
          </button>
        </div>

        <div>
          <h3 class="text-base sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">Offene Herausforderungen</h3>
          <div v-if="store.challenges.length === 0" class="text-center py-6 text-gray-500 text-sm">
            Keine offenen Herausforderungen
          </div>
          <div v-else class="space-y-2">
            <div v-for="c in store.challenges" :key="c.id"
              class="p-3 border-l-4 rounded-lg"
              :class="isOverdue(c) ? 'bg-red-50 border-red-500' : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-500'">
              <div class="flex flex-col gap-2">
                <div>
                  <div class="font-bold text-gray-800 dark:text-gray-100 text-sm">
                    {{ store.players.find(p => p.id === c.challengerId)?.name || '?' }} vs {{ store.players.find(p => p.id === c.challengedId)?.name || '?' }}
                  </div>
                  <div class="text-xs" :class="isOverdue(c) ? 'text-red-600 font-semibold' : 'text-gray-500 dark:text-gray-400'">
                    {{ formatDate(c.date) }} {{ isOverdue(c) ? 'ÜBERFÄLLIG' : '' }}
                  </div>
                </div>
                <div v-if="store.user && !store.archiveMode" class="flex gap-2">
                  <button @click="markCompleted(c.id)" class="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm font-medium">
                    Erledigt
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

const MatchSlot = {
  props: {
    label: String, result: Object, canEnter: Boolean,
    p1: Object, p2: Object, knockoutActive: Boolean,
    loggedIn: Boolean, readOnly: Boolean, formatDate: Function,
  },
  template: `
    <div class="border rounded p-2 mt-1.5" :class="result ? 'bg-gray-50 dark:bg-gray-600' : ''">
      <div class="text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1">{{ label }}</div>
      <template v-if="result">
        <div class="flex items-center justify-between gap-1">
          <span class="text-xs truncate" :class="result.p1Sets > result.p2Sets ? 'font-bold text-green-600' : 'text-gray-600 dark:text-gray-300'">{{ p1.name }}</span>
          <span class="text-sm font-bold flex-shrink-0 dark:text-gray-100">{{ result.p1Sets }}:{{ result.p2Sets }}</span>
          <span class="text-xs truncate text-right" :class="result.p2Sets > result.p1Sets ? 'font-bold text-green-600' : 'text-gray-600 dark:text-gray-300'">{{ p2.name }}</span>
        </div>
        <div class="text-[10px] text-gray-500 dark:text-gray-400 text-center mt-1">
          {{ result.setDetails.map(s => s.p1 + ':' + s.p2).join(', ') }}
          {{ formatDate(result.date) }}
        </div>
      </template>
      <template v-else>
        <div class="text-center text-xs text-gray-400 py-1">
          {{ knockoutActive ? 'Nicht gespielt' : !canEnter ? 'Hinspiel zuerst' : 'Ausstehend' }}
        </div>
      </template>
    </div>
  `,
}
</script>
