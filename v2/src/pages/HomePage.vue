<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app.js'
import { useFirebaseListeners } from '@/composables/useFirebaseListeners.js'
import MatchCard from '@/components/MatchCard.vue'

useFirebaseListeners()
const store = useAppStore()
const router = useRouter()

const allMatches = computed(() => [
  ...store.singlesMatches.filter(m => m.status === 'confirmed').map(m => ({ ...m, type: 'singles' })),
  ...store.knockoutMatches.map(m => ({ ...m, type: 'knockout' })),
  ...store.doublesMatches.filter(m => m.status === 'confirmed').map(m => ({ ...m, type: 'doubles' })),
])

const recentMatches = computed(() =>
  [...allMatches.value]
    .sort((a, b) => (b.date?.seconds || b.createdAt?.seconds || 0) - (a.date?.seconds || a.createdAt?.seconds || 0))
    .slice(0, 5)
)

const today = new Date()
today.setHours(0, 0, 0, 0)
const todayTimestamp = computed(() => today.getTime() / 1000)

const upcomingChallenges = computed(() =>
  store.challenges.filter(c => {
    if (c.status === 'completed') return false
    return (c.date?.seconds || 0) <= todayTimestamp.value + 86400
  })
)

const unconfirmedSingles = computed(() =>
  store.isAdmin && !store.archiveMode ? store.singlesMatches.filter(m => m.status === 'unconfirmed').length : 0
)
const unconfirmedDoubles = computed(() =>
  store.isAdmin && !store.archiveMode ? store.doublesMatches.filter(m => m.status === 'unconfirmed').length : 0
)
const totalUnconfirmed = computed(() => unconfirmedSingles.value + unconfirmedDoubles.value)

const activeAnnouncements = computed(() => store.announcements.filter(a => a.active))

function getPlayerName(id) {
  return store.players.find(p => p.id === id)?.name || 'Unbekannt'
}

function formatDate(val) {
  if (!val) return ''
  return new Date((val.seconds || 0) * 1000).toLocaleDateString('de-DE')
}

function isOverdue(challenge) {
  return (challenge.date?.seconds || 0) < todayTimestamp.value
}
</script>

<template>
  <div class="container mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">

    <div class="text-center">
      <h2 class="text-xl sm:text-2xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">Vereinsmeisterschaft</h2>
    </div>

    <!-- Ankündigungen -->
    <div v-for="a in activeAnnouncements" :key="a.id"
      class="relative rounded-xl overflow-hidden shadow-lg bg-gradient-to-r from-indigo-600 to-indigo-800">
      <div class="px-4 py-3 sm:px-6 sm:py-5 flex items-center gap-3">
        <div class="flex-shrink-0 relative flex items-center justify-center w-3 h-3">
          <div class="absolute w-3 h-3 rounded-full bg-white opacity-30 animate-ping"></div>
          <div class="w-2 h-2 rounded-full bg-white"></div>
        </div>
        <p class="text-white font-medium text-sm sm:text-base leading-relaxed">{{ a.text }}</p>
      </div>
    </div>

    <!-- Unbestätigte Spiele -->
    <div v-if="store.isAdmin && totalUnconfirmed > 0"
      class="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-400 rounded-xl shadow-lg p-4 sm:p-6">
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1">
          <h3 class="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
            {{ totalUnconfirmed }} unbestätigte{{ totalUnconfirmed === 1 ? 's' : '' }} Spiel{{ totalUnconfirmed === 1 ? '' : 'e' }}
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
            <span v-if="unconfirmedSingles > 0">{{ unconfirmedSingles }} Einzel</span>
            <span v-if="unconfirmedSingles > 0 && unconfirmedDoubles > 0">, </span>
            <span v-if="unconfirmedDoubles > 0">{{ unconfirmedDoubles }} Doppel</span>
          </p>
          <button @click="router.push('/admin')"
            class="px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold transition-colors text-sm">
            Spiele überprüfen
          </button>
        </div>
        <svg class="w-8 h-8 sm:w-10 sm:h-10 text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
      </div>
    </div>

    <!-- Anstehende Herausforderungen -->
    <div v-if="upcomingChallenges.length > 0"
      class="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 rounded-xl shadow-lg p-4 sm:p-6">
      <h3 class="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">Anstehende Herausforderungen</h3>
      <div class="space-y-2">
        <div v-for="c in upcomingChallenges" :key="c.id"
          class="p-3 border-l-4 rounded-lg"
          :class="isOverdue(c) ? 'bg-red-100 border-red-500' : 'bg-white dark:bg-gray-800 border-yellow-500'">
          <div class="flex items-center justify-between gap-2">
            <div class="min-w-0">
              <div class="font-bold text-gray-800 dark:text-gray-100 text-sm sm:text-base truncate">
                {{ getPlayerName(c.challengerId) }} vs {{ getPlayerName(c.challengedId) }}
              </div>
              <div class="text-xs" :class="isOverdue(c) ? 'text-red-600 font-semibold' : 'text-gray-600 dark:text-gray-400'">
                {{ formatDate(c.date) }} {{ isOverdue(c) ? 'ÜBERFÄLLIG' : 'Heute' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Turnier-Kacheln -->
    <div class="grid grid-cols-2 gap-3 sm:gap-6">
      <div @click="router.push('/singles')"
        class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-8 cursor-pointer hover:shadow-xl transition-shadow active:scale-[0.98] flex flex-col items-center text-center sm:items-start sm:text-left">
        <div class="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4">
          <div class="text-yellow-500">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          </div>
          <h3 class="text-base sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Einzel</h3>
        </div>
        <p class="text-gray-600 dark:text-gray-400 text-xs sm:text-sm hidden sm:block">Gruppenphasen mit K.O.-System</p>
      </div>

      <div @click="router.push('/doubles')"
        class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-8 cursor-pointer hover:shadow-xl transition-shadow active:scale-[0.98] flex flex-col items-center text-center sm:items-start sm:text-left">
        <div class="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4">
          <div class="text-blue-500">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>
          <h3 class="text-base sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Doppel</h3>
        </div>
        <p class="text-gray-600 dark:text-gray-400 text-xs sm:text-sm hidden sm:block">Pyramiden-Herausforderungen</p>
      </div>
    </div>

    <!-- Letzte Ergebnisse -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
      <h3 class="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">Letzte Ergebnisse</h3>

      <div v-if="store.matchesLoading" class="space-y-2">
        <div v-for="i in 3" :key="i" class="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 animate-pulse">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-1"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>

      <p v-else-if="recentMatches.length === 0" class="text-gray-500 dark:text-gray-400 text-center py-6 text-sm">
        Noch keine Spiele eingetragen
      </p>

      <div v-else class="space-y-2">
        <MatchCard v-for="m in recentMatches" :key="m.id" :match="m" context="home" />
      </div>
    </div>

  </div>
</template>
