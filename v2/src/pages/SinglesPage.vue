<script setup>
import { computed, ref } from 'vue'
import { useAppStore } from '@/stores/app.js'
import { useFirebaseListeners } from '@/composables/useFirebaseListeners.js'
import GroupTable from '@/components/GroupTable.vue'
import KnockoutBracket from '@/components/KnockoutBracket.vue'
import MatchEntryForm from '@/components/MatchEntryForm.vue'
import { calculateStandings } from '@/utils/calculations.js'

useFirebaseListeners()
const store = useAppStore()

const singlesView = ref('group')
const group1 = computed(() => store.knockoutPhaseActive && store.frozenStandings ? store.frozenStandings.group1 : calculateStandings(1))
const group2 = computed(() => store.knockoutPhaseActive && store.frozenStandings ? store.frozenStandings.group2 : calculateStandings(2))
</script>

<template>
  <div class="container mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
      <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4 sm:mb-6">Einzel-Turnier</h2>

      <!-- Tab-Wechsel wenn K.O. aktiv -->
      <div v-if="store.knockoutPhaseActive" class="mb-4 flex gap-2">
        <button @click="singlesView = 'group'"
          class="flex-1 px-3 sm:px-6 py-2.5 rounded-lg font-semibold transition-all text-sm sm:text-base"
          :class="singlesView === 'group' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300'">
          Gruppen
        </button>
        <button @click="singlesView = 'knockout'"
          class="flex-1 px-3 sm:px-6 py-2.5 rounded-lg font-semibold transition-all text-sm sm:text-base"
          :class="singlesView === 'knockout' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300'">
          K.O.-Phase
        </button>
      </div>

      <!-- Gruppenphase -->
      <div v-if="singlesView === 'group'">
        <div v-if="store.knockoutPhaseActive && store.frozenStandings" class="mb-3 p-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 rounded-lg">
          <p class="text-xs sm:text-sm text-blue-800 dark:text-blue-300">Stand zum Zeitpunkt des K.O.-Phasen-Starts.</p>
        </div>

        <!-- Loading skeleton -->
        <div v-if="store.matchesLoading" class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-4">
          <div v-for="i in 2" :key="i" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 animate-pulse">
            <div class="h-6 bg-gray-200 dark:bg-gray-600 rounded w-24 mb-3"></div>
            <div v-for="j in 4" :key="j" class="h-8 bg-gray-200 dark:bg-gray-600 rounded mb-1"></div>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-4">
          <GroupTable :group-num="1" :standings="group1" :frozen="store.knockoutPhaseActive && !!store.frozenStandings" />
          <GroupTable :group-num="2" :standings="group2" :frozen="store.knockoutPhaseActive && !!store.frozenStandings" />
        </div>

        <div v-if="store.user && !store.archiveMode && !store.knockoutPhaseActive">
          <MatchEntryForm type="singles" />
        </div>
        <div v-else-if="!store.user && !store.archiveMode && !store.knockoutPhaseActive"
          class="mt-4 p-2 bg-blue-100 border border-blue-400 rounded text-xs sm:text-sm text-blue-800 flex items-center gap-2">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span>Um Ergebnisse einzutragen, bitte einloggen.</span>
        </div>
      </div>

      <!-- K.O.-Phase -->
      <KnockoutBracket v-else />
    </div>
  </div>
</template>
