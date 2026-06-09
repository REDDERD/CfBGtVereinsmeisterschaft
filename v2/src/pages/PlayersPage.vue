<script setup>
import { useAppStore } from '@/stores/app.js'
import { useFirebaseListeners } from '@/composables/useFirebaseListeners.js'
import { useRouter } from 'vue-router'

useFirebaseListeners()
const store = useAppStore()
const router = useRouter()
</script>

<template>
  <div class="container mx-auto px-4 py-4 sm:py-6">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
      <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4 sm:mb-6">Alle Spieler</h2>

      <!-- Loading -->
      <div v-if="store.matchesLoading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        <div v-for="i in 8" :key="i" class="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg animate-pulse">
          <div class="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24 mb-2"></div>
          <div class="h-3 bg-gray-200 dark:bg-gray-600 rounded w-14 mt-1"></div>
        </div>
      </div>

      <p v-else-if="store.players.length === 0" class="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
        Noch keine Spieler registriert
      </p>

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        <div v-for="player in store.players" :key="player.id"
          @click="router.push(`/players/${player.id}`)"
          class="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors active:scale-[0.98]">
          <h3 class="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-100 truncate">{{ player.name }}</h3>
          <div class="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-0.5">
            <div v-if="player.singlesGroup">Gr. {{ player.singlesGroup }}</div>
            <div v-if="player.doublesPool">Pool {{ player.doublesPool }}</div>
            <div v-if="!player.singlesGroup && !player.doublesPool" class="text-gray-400">-</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
