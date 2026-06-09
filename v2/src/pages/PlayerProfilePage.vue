<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app.js'
import { useFirebaseListeners } from '@/composables/useFirebaseListeners.js'

useFirebaseListeners()
const store = useAppStore()
const route = useRoute()
const router = useRouter()
const playerId = computed(() => route.params.id)

const player = computed(() => store.players.find(p => p.id === playerId.value))

const singlesMatches = computed(() =>
  store.singlesMatches
    .filter(m => (m.status || 'confirmed') === 'confirmed')
    .filter(m => m.player1Id === playerId.value || m.player2Id === playerId.value)
    .filter(m => m.sets && m.sets.length >= 2)
)

const singlesStats = computed(() => {
  let wins = 0, losses = 0, setsWon = 0, setsLost = 0
  const opponents = {}
  singlesMatches.value.forEach(match => {
    const isP1 = match.player1Id === playerId.value
    let p1s = 0, p2s = 0
    match.sets.forEach(s => { if (s.p1 > s.p2) p1s++; else p2s++ })
    const won = (isP1 && p1s > p2s) || (!isP1 && p2s > p1s)
    if (won) wins++; else losses++
    setsWon += isP1 ? p1s : p2s
    setsLost += isP1 ? p2s : p1s
    const oppId = isP1 ? match.player2Id : match.player1Id
    if (!opponents[oppId]) opponents[oppId] = { wins: 0, matches: 0 }
    opponents[oppId].matches++
    if (won) opponents[oppId].wins++
  })

  const sorted = [...singlesMatches.value].sort((a, b) => (a.date?.seconds || 0) - (b.date?.seconds || 0))
  let maxStreak = 0, currentStreak = 0
  sorted.forEach(m => {
    const isP1 = m.player1Id === playerId.value
    let p1s = 0, p2s = 0
    m.sets.forEach(s => { if (s.p1 > s.p2) p1s++; else p2s++ })
    const won = (isP1 && p1s > p2s) || (!isP1 && p2s > p1s)
    if (won) { currentStreak++; maxStreak = Math.max(maxStreak, currentStreak) } else currentStreak = 0
  })

  const topOpponent = Object.entries(opponents)
    .map(([id, s]) => ({ id, name: store.players.find(p => p.id === id)?.name || id, ...s }))
    .sort((a, b) => b.matches - a.matches)[0] || null

  return { wins, losses, setsWon, setsLost, maxStreak, currentStreak, topOpponent }
})

const doublesMatches = computed(() =>
  store.doublesMatches
    .filter(m => (m.status || 'confirmed') === 'confirmed')
    .filter(m => m.team1 && m.team2)
    .filter(m => [m.team1.player1Id, m.team1.player2Id, m.team2.player1Id, m.team2.player2Id].includes(playerId.value))
    .filter(m => m.sets && m.sets.length >= 2)
)

const doublesStats = computed(() => {
  let wins = 0, losses = 0, setsWon = 0, setsLost = 0
  const opponents = {}, partnersMap = {}
  doublesMatches.value.forEach(match => {
    const isT1 = match.team1.player1Id === playerId.value || match.team1.player2Id === playerId.value
    let t1 = 0, t2 = 0
    match.sets.forEach(s => { if (s.t1 > s.t2) t1++; else t2++ })
    const won = (isT1 && t1 > t2) || (!isT1 && t2 > t1)
    if (won) wins++; else losses++
    setsWon += isT1 ? t1 : t2
    setsLost += isT1 ? t2 : t1
    const myTeam = isT1 ? match.team1 : match.team2
    const partnerId = myTeam.player1Id === playerId.value ? myTeam.player2Id : myTeam.player1Id
    if (partnerId) {
      if (!partnersMap[partnerId]) partnersMap[partnerId] = { wins: 0, matches: 0 }
      partnersMap[partnerId].matches++
      if (won) partnersMap[partnerId].wins++
    }
    const oppTeam = isT1 ? match.team2 : match.team1
    ;[oppTeam.player1Id, oppTeam.player2Id].forEach(id => {
      if (!id) return
      if (!opponents[id]) opponents[id] = { wins: 0, matches: 0 }
      opponents[id].matches++
      if (won) opponents[id].wins++
    })
  })

  const sorted = [...doublesMatches.value].sort((a, b) => (a.date?.seconds || 0) - (b.date?.seconds || 0))
  let maxStreak = 0, currentStreak = 0
  sorted.forEach(m => {
    const isT1 = m.team1.player1Id === playerId.value || m.team1.player2Id === playerId.value
    let t1 = 0, t2 = 0
    m.sets.forEach(s => { if (s.t1 > s.t2) t1++; else t2++ })
    const won = (isT1 && t1 > t2) || (!isT1 && t2 > t1)
    if (won) { currentStreak++; maxStreak = Math.max(maxStreak, currentStreak) } else currentStreak = 0
  })

  const n = id => store.players.find(p => p.id === id)?.name || id
  const bestPartner = Object.entries(partnersMap).map(([id, s]) => ({ id, name: n(id), ...s, rate: s.matches > 0 ? s.wins / s.matches : 0 })).sort((a, b) => b.wins - a.wins || b.rate - a.rate)[0] || null
  const topOpponent = Object.entries(opponents).map(([id, s]) => ({ id, name: n(id), ...s })).sort((a, b) => b.matches - a.matches)[0] || null

  return { wins, losses, setsWon, setsLost, maxStreak, currentStreak, bestPartner, topOpponent }
})

const recentForm = computed(() => {
  const all = [
    ...singlesMatches.value.map(m => {
      const isP1 = m.player1Id === playerId.value
      let p1s = 0, p2s = 0
      m.sets.forEach(s => { if (s.p1 > s.p2) p1s++; else p2s++ })
      return { time: m.date?.seconds || 0, won: (isP1 && p1s > p2s) || (!isP1 && p2s > p1s) }
    }),
    ...doublesMatches.value.map(m => {
      const isT1 = m.team1.player1Id === playerId.value || m.team1.player2Id === playerId.value
      let t1 = 0, t2 = 0
      m.sets.forEach(s => { if (s.t1 > s.t2) t1++; else t2++ })
      return { time: m.date?.seconds || 0, won: (isT1 && t1 > t2) || (!isT1 && t2 > t1) }
    }),
  ].sort((a, b) => a.time - b.time)
  return all.slice(-5)
})

const pyramidPos = computed(() => {
  const levels = store.pyramid.levels || []
  let pos = 0, counter = 1
  for (const level of levels) {
    for (const id of level) {
      if (id === playerId.value) { pos = counter; break }
      counter++
    }
    if (pos > 0) break
  }
  return pos
})

const posChange = computed(() => {
  const start = player.value?.doublesStartingPosition || 0
  const curr = pyramidPos.value
  return start > 0 && curr > 0 ? start - curr : 0
})
</script>

<template>
  <div class="container mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">

    <div v-if="!player" class="text-center py-12 text-gray-500 dark:text-gray-400">Spieler nicht gefunden</div>

    <template v-else>
      <button @click="router.push('/players')" class="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm font-medium">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Alle Spieler
      </button>

      <!-- Header -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
        <div class="flex items-center justify-between gap-4">
          <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{{ player.name }}</h2>
          <div v-if="recentForm.length > 0" class="flex items-center gap-1.5">
            <span class="text-[10px] sm:text-xs text-gray-500 mr-1">Form</span>
            <div v-for="(r, i) in recentForm" :key="i"
              class="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full"
              :class="r.won ? 'bg-green-500' : 'bg-red-500'"
              :title="r.won ? 'Sieg' : 'Niederlage'"></div>
          </div>
        </div>
      </div>

      <!-- Einzel -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
        <h3 class="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">Einzel</h3>
        <p v-if="singlesStats.wins + singlesStats.losses === 0" class="text-gray-400 text-sm">Noch keine Einzel-Spiele</p>
        <template v-else>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3">
            <div class="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
              <div class="text-[10px] sm:text-xs text-gray-500 mb-0.5">Bilanz</div>
              <div class="text-lg sm:text-2xl font-bold text-gray-800 dark:text-gray-100">{{ singlesStats.wins }}:{{ singlesStats.losses }}</div>
            </div>
            <div class="p-3 sm:p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-center">
              <div class="text-[10px] sm:text-xs text-gray-500 mb-0.5">Siegquote</div>
              <div class="text-lg sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
                {{ Math.round(singlesStats.wins / (singlesStats.wins + singlesStats.losses) * 100) }}%
              </div>
            </div>
            <div class="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
              <div class="text-[10px] sm:text-xs text-gray-500 mb-0.5">Beste Serie</div>
              <div class="text-lg sm:text-2xl font-bold text-gray-800 dark:text-gray-100">{{ singlesStats.maxStreak }}</div>
              <div v-if="singlesStats.currentStreak > 0" class="text-[10px] sm:text-xs text-green-600 font-medium">aktuell: {{ singlesStats.currentStreak }}</div>
            </div>
            <div class="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <div class="text-[10px] sm:text-xs text-gray-500 mb-0.5">Sätze</div>
              <div class="text-lg sm:text-2xl font-bold text-gray-800 dark:text-gray-100">{{ singlesStats.setsWon }}:{{ singlesStats.setsLost }}</div>
            </div>
          </div>
          <div v-if="singlesStats.topOpponent" class="p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-between">
            <div class="text-sm text-gray-600 dark:text-gray-400">Häufigster Gegner</div>
            <div class="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {{ singlesStats.topOpponent.name }}
              <span class="text-gray-500 font-normal">({{ singlesStats.topOpponent.wins }}:{{ singlesStats.topOpponent.matches - singlesStats.topOpponent.wins }})</span>
            </div>
          </div>
        </template>
      </div>

      <!-- Doppel -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
        <h3 class="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">Doppel</h3>
        <p v-if="doublesStats.wins + doublesStats.losses === 0" class="text-gray-400 text-sm">Noch keine Doppel-Spiele</p>
        <template v-else>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3">
            <div class="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
              <div class="text-[10px] sm:text-xs text-gray-500 mb-0.5">Bilanz</div>
              <div class="text-lg sm:text-2xl font-bold text-gray-800 dark:text-gray-100">{{ doublesStats.wins }}:{{ doublesStats.losses }}</div>
            </div>
            <div class="p-3 sm:p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-center">
              <div class="text-[10px] sm:text-xs text-gray-500 mb-0.5">Siegquote</div>
              <div class="text-lg sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
                {{ Math.round(doublesStats.wins / (doublesStats.wins + doublesStats.losses) * 100) }}%
              </div>
            </div>
            <div class="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
              <div class="text-[10px] sm:text-xs text-gray-500 mb-0.5">Beste Serie</div>
              <div class="text-lg sm:text-2xl font-bold text-gray-800 dark:text-gray-100">{{ doublesStats.maxStreak }}</div>
            </div>
            <div class="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <div class="text-[10px] sm:text-xs text-gray-500 mb-0.5">Sätze</div>
              <div class="text-lg sm:text-2xl font-bold text-gray-800 dark:text-gray-100">{{ doublesStats.setsWon }}:{{ doublesStats.setsLost }}</div>
            </div>
          </div>
          <div class="space-y-1.5">
            <div v-if="doublesStats.bestPartner" class="p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-between">
              <div class="text-sm text-gray-600 dark:text-gray-400">Bester Partner</div>
              <div class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{ doublesStats.bestPartner.name }} <span class="text-gray-500 font-normal">({{ doublesStats.bestPartner.wins }}:{{ doublesStats.bestPartner.matches - doublesStats.bestPartner.wins }})</span></div>
            </div>
            <div v-if="doublesStats.topOpponent" class="p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-between">
              <div class="text-sm text-gray-600 dark:text-gray-400">Häufigster Gegner</div>
              <div class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{ doublesStats.topOpponent.name }} <span class="text-gray-500 font-normal">({{ doublesStats.topOpponent.wins }}:{{ doublesStats.topOpponent.matches - doublesStats.topOpponent.wins }})</span></div>
            </div>
          </div>
        </template>
      </div>

      <!-- Pyramiden-Position -->
      <div v-if="pyramidPos > 0 || (player.doublesStartingPosition || 0) > 0"
        class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
        <h3 class="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">Pyramiden-Position</h3>
        <div class="grid grid-cols-3 gap-2 sm:gap-3">
          <div class="p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
            <div class="text-[10px] sm:text-xs text-gray-500 mb-0.5">Aktuell</div>
            <div class="text-lg sm:text-2xl font-bold text-gray-800 dark:text-gray-100">{{ pyramidPos || '–' }}</div>
          </div>
          <div class="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
            <div class="text-[10px] sm:text-xs text-gray-500 mb-0.5">Start</div>
            <div class="text-lg sm:text-2xl font-bold text-gray-800 dark:text-gray-100">{{ player.doublesStartingPosition || '–' }}</div>
          </div>
          <div class="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
            <div class="text-[10px] sm:text-xs text-gray-500 mb-0.5">Veränderung</div>
            <div class="text-lg sm:text-2xl font-bold" :class="posChange > 0 ? 'text-green-600' : posChange < 0 ? 'text-red-600' : 'text-gray-600'">
              {{ posChange > 0 ? '+' : '' }}{{ posChange || '±0' }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
