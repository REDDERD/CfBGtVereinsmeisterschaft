<script setup>
import { ref, computed, watchEffect, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase/index.js'
import { useAppStore } from '@/stores/app.js'
import { useFirebaseListeners } from '@/composables/useFirebaseListeners.js'
import GroupTable from '@/components/GroupTable.vue'
import MatchCard from '@/components/MatchCard.vue'
import { calculateStandings } from '@/utils/calculations.js'

useFirebaseListeners()
const store = useAppStore()
const route = useRoute()
const router = useRouter()

const year = computed(() => route.params.year ? Number(route.params.year) : null)

const archiveSeasons = computed(() =>
  (store.seasons || [])
    .filter(s => s.archiveVisible !== false)
    .filter(s => s.year !== store.liveActiveSeason)
    .sort((a, b) => b.year - a.year)
)

// Archive year data
const archivePlayers = ref([])
const archiveSingles = ref([])
const archiveDoubles = ref([])
const archiveLoading = ref(false)
let unsubs = []

watchEffect(() => {
  unsubs.forEach(u => u())
  unsubs = []
  archivePlayers.value = []
  archiveSingles.value = []
  archiveDoubles.value = []

  if (!year.value) return

  archiveLoading.value = true
  const base = `seasons/${year.value}`

  unsubs.push(onSnapshot(collection(db, base, 'players'), snap => {
    archivePlayers.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    archiveLoading.value = false
  }))
  unsubs.push(onSnapshot(collection(db, base, 'singlesMatches'), snap => {
    archiveSingles.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  }))
  unsubs.push(onSnapshot(collection(db, base, 'doublesMatches'), snap => {
    archiveDoubles.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  }))
})

onUnmounted(() => unsubs.forEach(u => u()))

// Standings for the archive year (using local data, not the store)
function archiveStandings(groupNum) {
  const players = archivePlayers.value.filter(p => p.singlesGroup === groupNum)
  const matches = archiveSingles.value.filter(m => (m.status || 'confirmed') === 'confirmed')
  const stats = {}
  players.forEach(p => { stats[p.id] = { id: p.id, name: p.name, wins: 0, losses: 0, setsWon: 0, setsLost: 0 } })
  matches.forEach(m => {
    if (!m.sets || m.sets.length < 2) return
    const s1 = stats[m.player1Id], s2 = stats[m.player2Id]
    if (!s1 || !s2) return
    let p1s = 0, p2s = 0
    m.sets.forEach(s => { if (s.p1 > s.p2) p1s++; else p2s++ })
    s1.setsWon += p1s; s1.setsLost += p2s
    s2.setsWon += p2s; s2.setsLost += p1s
    if (p1s > p2s) { s1.wins++; s2.losses++ } else { s2.wins++; s1.losses++ }
  })
  return Object.values(stats).map(p => ({
    ...p,
    played: p.wins + p.losses,
    points: p.wins * 2,
    setDiff: p.setsWon - p.setsLost,
  })).sort((a, b) => b.points - a.points || b.setDiff - a.setDiff || b.setsWon - a.setsWon)
}

const recentSingles = computed(() =>
  archiveSingles.value
    .filter(m => (m.status || 'confirmed') === 'confirmed')
    .map(m => ({ ...m, type: 'singles' }))
    .sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0))
    .slice(0, 10)
)

const seasonLabel = computed(() => {
  const s = (store.seasons || []).find(s => s.year === year.value)
  return s?.label || (year.value ? `Saison ${year.value}` : '')
})
</script>

<template>
  <div class="container mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">

    <!-- ===== YEAR DETAIL VIEW ===== -->
    <template v-if="year">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
        <div class="flex items-center gap-3 mb-4">
          <button @click="router.push('/archive')" class="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm font-medium">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            Archiv
          </button>
          <span class="text-gray-400">/</span>
          <h2 class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">{{ seasonLabel }}</h2>
        </div>
        <div v-if="archiveLoading" class="text-center py-8 text-gray-400 text-sm">Lade Daten...</div>
      </div>

      <template v-if="!archiveLoading">
        <!-- Standings Group 1 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
          <h3 class="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">Tabelle Gruppe 1</h3>
          <GroupTable :standings="archiveStandings(1)" :group-num="1" :frozen="true" />
        </div>

        <!-- Standings Group 2 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
          <h3 class="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">Tabelle Gruppe 2</h3>
          <GroupTable :standings="archiveStandings(2)" :group-num="2" :frozen="true" />
        </div>

        <!-- Recent matches -->
        <div v-if="recentSingles.length > 0" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
          <h3 class="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">Einzel-Spiele</h3>
          <!-- Provide fake store context via override for MatchCard -->
          <div class="space-y-2">
            <div v-for="m in recentSingles" :key="m.id" class="p-2.5 sm:p-3 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
              <div class="flex items-center justify-between">
                <span class="font-medium text-gray-800 dark:text-gray-100">
                  {{ archivePlayers.find(p => p.id === m.player1Id)?.name || m.player1Id }}
                  <span class="text-gray-400 mx-1">vs</span>
                  {{ archivePlayers.find(p => p.id === m.player2Id)?.name || m.player2Id }}
                </span>
                <span class="text-xs text-gray-500">
                  {{ m.sets?.map(s => `${s.p1}:${s.p2}`).join(', ') }}
                </span>
              </div>
              <div v-if="m.date?.seconds" class="text-xs text-gray-400 mt-0.5">
                {{ new Date(m.date.seconds * 1000).toLocaleDateString('de-DE') }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </template>

    <!-- ===== SEASON LIST VIEW ===== -->
    <template v-else>
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
        <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Archiv</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Vergangene Saisons einsehen</p>

        <div v-if="archiveSeasons.length === 0" class="text-center py-12">
          <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8"/>
          </svg>
          <p class="text-gray-500 dark:text-gray-400">Noch keine archivierten Saisons vorhanden.</p>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="s in archiveSeasons" :key="s.year"
            @click="router.push(`/archive/${s.year}`)"
            class="p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all bg-white dark:bg-gray-800 group cursor-pointer">
            <div class="flex items-center justify-between mb-2">
              <span class="text-2xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{{ s.year }}</span>
              <svg class="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ s.label || 'Saison ' + s.year }}</p>
          </div>
        </div>
      </div>
    </template>

  </div>
</template>
