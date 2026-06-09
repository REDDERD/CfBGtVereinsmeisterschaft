<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app.js'
import { useFirebaseListeners } from '@/composables/useFirebaseListeners.js'
import MatchCard from '@/components/MatchCard.vue'

useFirebaseListeners()
const store = useAppStore()

const showSingles = ref(true)
const showDoubles = ref(true)
const searchQuery = ref('')

const filteredMatches = computed(() => {
  const display = store.matchesDisplaySettings || {}
  const all = []

  if (showSingles.value) {
    store.singlesMatches
      .filter(m => {
        const s = m.status || 'confirmed'
        if (s === 'confirmed') return true
        if (s === 'unconfirmed') return display.showUnconfirmedSingles
        return false
      })
      .forEach(m => all.push({ ...m, type: 'singles' }))

    store.knockoutMatches
      .filter(m => {
        const s = m.status || 'confirmed'
        if (s === 'confirmed') return true
        if (s === 'unconfirmed') return display.showUnconfirmedSingles
        return false
      })
      .forEach(m => all.push({ ...m, type: 'knockout' }))
  }

  if (showDoubles.value) {
    store.doublesMatches
      .filter(m => {
        const s = m.status || 'confirmed'
        if (s === 'confirmed') return true
        if (s === 'unconfirmed') return display.showUnconfirmedDoubles
        return false
      })
      .forEach(m => all.push({ ...m, type: 'doubles' }))
  }

  const q = searchQuery.value.toLowerCase()
  const result = all.filter(m => {
    if (!q) return true
    const n = id => (store.players.find(p => p.id === id)?.name || '').toLowerCase()
    if (m.type !== 'doubles') return n(m.player1Id).includes(q) || n(m.player2Id).includes(q)
    return [m.team1?.player1Id, m.team1?.player2Id, m.team2?.player1Id, m.team2?.player2Id].some(id => n(id).includes(q))
  })

  return result.sort((a, b) => (b.date?.seconds || b.createdAt?.seconds || 0) - (a.date?.seconds || a.createdAt?.seconds || 0))
})
</script>

<template>
  <div class="container mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
      <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">Spiele</h2>

      <!-- Filter -->
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 mb-4">
        <div class="flex gap-2 mb-3">
          <button @click="showSingles = !showSingles"
            class="flex-1 px-3 py-2 rounded-lg border-2 transition-colors text-sm font-medium"
            :class="showSingles ? 'bg-yellow-100 border-yellow-400 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-600 dark:text-yellow-300' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'">
            Einzel
          </button>
          <button @click="showDoubles = !showDoubles"
            class="flex-1 px-3 py-2 rounded-lg border-2 transition-colors text-sm font-medium"
            :class="showDoubles ? 'bg-blue-100 border-blue-400 text-blue-800 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'">
            Doppel
          </button>
        </div>
        <input v-model="searchQuery" type="text" placeholder="Spieler suchen..."
          class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
      </div>

      <!-- Ergebnisse -->
      <div v-if="store.matchesLoading" class="space-y-2">
        <div v-for="i in 5" :key="i" class="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 animate-pulse">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-1.5"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
      <p v-else-if="filteredMatches.length === 0" class="text-gray-500 dark:text-gray-400 text-center py-6 text-sm">Keine Spiele gefunden</p>
      <div v-else class="space-y-2">
        <MatchCard v-for="m in filteredMatches" :key="m.id" :match="m" context="matches" />
      </div>
    </div>
  </div>
</template>
