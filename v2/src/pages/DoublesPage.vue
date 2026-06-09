<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/app.js'
import { useFirebaseListeners } from '@/composables/useFirebaseListeners.js'
import MatchEntryForm from '@/components/MatchEntryForm.vue'

useFirebaseListeners()
const store = useAppStore()

const levels = computed(() => store.pyramid.levels || [])

function getPlayerName(id) {
  return store.players.find(p => p.id === id)?.name || 'Unbekannt'
}

function shortName(name) {
  return name.length > 12 ? name.substring(0, 11) + '.' : name
}

function poolColorClasses(playerId) {
  if (!store.doublesPoolVisualization) return 'from-yellow-100 to-orange-100 border-yellow-400'
  const pool = store.players.find(p => p.id === playerId)?.doublesPool
  if (pool === 'A') return 'from-blue-100 to-blue-200 border-blue-400'
  if (pool === 'B') return 'from-green-100 to-green-200 border-green-400'
  return 'from-yellow-100 to-orange-100 border-yellow-400'
}
</script>

<template>
  <div class="container mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">

      <div class="flex items-center justify-between mb-4 sm:mb-6 gap-3">
        <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Doppel-Pyramide</h2>

        <div v-if="levels.length > 0" class="flex items-center gap-2">
          <button
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border transition-colors"
            :class="store.doublesPoolVisualization
              ? 'bg-indigo-100 border-indigo-300 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-600 dark:text-indigo-300'
              : 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'"
            @click="store.doublesPoolVisualization = !store.doublesPoolVisualization">
            <span class="font-medium">Pools</span>
            <div class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
              :class="store.doublesPoolVisualization ? 'bg-indigo-600' : 'bg-gray-300'">
              <span class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                :class="store.doublesPoolVisualization ? 'translate-x-4' : 'translate-x-0.5'"></span>
            </div>
          </button>
        </div>
      </div>

      <!-- Pyramide -->
      <div class="mb-4 sm:mb-6">

        <!-- Loading -->
        <div v-if="store.pyramidLoading" class="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <svg class="animate-spin h-10 w-10 text-indigo-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <p class="text-gray-600 dark:text-gray-300 font-medium text-sm">Pyramide wird aktualisiert...</p>
        </div>

        <!-- Skeleton -->
        <div v-else-if="store.matchesLoading && !store.pyramidInitialized" class="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
          <div class="space-y-1.5 sm:space-y-2 inline-block min-w-full">
            <div v-for="count in [1,2,3,4,5]" :key="count" class="flex flex-nowrap justify-center gap-1 sm:gap-2">
              <div v-for="j in count" :key="j" class="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0" style="min-width:70px; height:42px;"></div>
            </div>
          </div>
        </div>

        <!-- Nicht initialisiert -->
        <div v-else-if="levels.length === 0 && !store.pyramidInitialized" class="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p class="text-gray-600 dark:text-gray-300">Pyramide noch nicht initialisiert</p>
        </div>

        <!-- Pyramide anzeigen -->
        <div v-else class="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
          <div class="space-y-1.5 sm:space-y-2 inline-block min-w-full">
            <div v-for="(level, li) in levels" :key="li" class="flex flex-nowrap justify-center items-center gap-1 sm:gap-2">
              <div v-for="(playerId, pi) in level" :key="pi"
                class="bg-gradient-to-r border-2 rounded-lg px-2 py-1.5 sm:px-4 sm:py-2.5 text-center shadow-sm flex-shrink-0"
                :class="poolColorClasses(playerId)"
                style="min-width: 70px">
                <div class="font-bold text-gray-800 text-xs sm:text-sm leading-tight whitespace-nowrap" :title="getPlayerName(playerId)">
                  <span class="sm:hidden">{{ shortName(getPlayerName(playerId)) }}</span>
                  <span class="hidden sm:inline">{{ getPlayerName(playerId) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Ergebniss eintragen -->
      <div v-if="store.user && !store.archiveMode && levels.length > 0 && !store.pyramidLoading">
        <MatchEntryForm type="doubles" />
      </div>
      <div v-else-if="!store.user && !store.archiveMode && levels.length > 0 && !store.pyramidLoading"
        class="mt-4 p-2 bg-blue-100 border border-blue-400 rounded text-xs sm:text-sm text-blue-800 flex items-center gap-2">
        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <span>Um Ergebnisse einzutragen, bitte einloggen.</span>
      </div>

    </div>
  </div>
</template>
