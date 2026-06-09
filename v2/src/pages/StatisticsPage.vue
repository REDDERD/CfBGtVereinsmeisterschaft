<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app.js'
import { useFirebaseListeners } from '@/composables/useFirebaseListeners.js'

useFirebaseListeners()
const store = useAppStore()
const view = ref('singles')

// ===== EINZEL =====
const singleStats = computed(() => {
  const confirmed = store.singlesMatches.filter(m => (m.status || 'confirmed') === 'confirmed')
  const stats = {}
  store.players.forEach(p => { stats[p.id] = { id: p.id, name: p.name, wins: 0, matches: 0 } })

  confirmed.forEach(match => {
    if (!match.sets || match.sets.length < 2) return
    const p1 = match.player1Id, p2 = match.player2Id
    if (!stats[p1] || !stats[p2]) return
    let p1s = 0, p2s = 0
    match.sets.forEach(s => { if (s.p1 > s.p2) p1s++; else p2s++ })
    stats[p1].matches++; stats[p2].matches++
    if (p1s > p2s) stats[p1].wins++; else stats[p2].wins++
  })

  const all = Object.values(stats).filter(p => p.matches > 0)
  const topWins = [...all].sort((a, b) => b.wins - a.wins || b.matches - a.matches).slice(0, 3)
  const topMatches = [...all].sort((a, b) => b.matches - a.matches || b.wins - a.wins).slice(0, 3)
  const topRate = [...all].map(p => ({ ...p, rate: p.wins / p.matches })).sort((a, b) => b.rate - a.rate || b.matches - a.matches).slice(0, 3)

  const streaks = {}
  store.players.forEach(p => { streaks[p.id] = { id: p.id, name: p.name, maxStreak: 0, currentStreak: 0 } })
  const sorted = [...confirmed].sort((a, b) => (a.date?.seconds || 0) - (b.date?.seconds || 0))
  sorted.forEach(match => {
    if (!match.sets || match.sets.length < 2) return
    let p1s = 0, p2s = 0
    match.sets.forEach(s => { if (s.p1 > s.p2) p1s++; else p2s++ })
    const winner = p1s > p2s ? match.player1Id : match.player2Id
    const loser = p1s > p2s ? match.player2Id : match.player1Id
    if (streaks[winner]) { streaks[winner].currentStreak++; streaks[winner].maxStreak = Math.max(streaks[winner].maxStreak, streaks[winner].currentStreak) }
    if (streaks[loser]) streaks[loser].currentStreak = 0
  })
  const topStreak = Object.values(streaks).filter(p => p.maxStreak > 0).sort((a, b) => b.maxStreak - a.maxStreak).slice(0, 3)

  return [
    { title: 'Meiste Siege', players: topWins, valueFn: p => `${p.wins} Sieg${p.wins !== 1 ? 'e' : ''}` },
    { title: 'Meiste Spiele', players: topMatches, valueFn: p => `${p.matches} Spiel${p.matches !== 1 ? 'e' : ''}` },
    { title: 'Beste Siegquote', players: topRate, valueFn: p => `${Math.round(p.rate * 100)}% (${p.wins}/${p.matches})` },
    { title: 'Längste Siegesserie', players: topStreak, valueFn: p => `${p.maxStreak} Siege${p.currentStreak > 0 ? ` (aktuell: ${p.currentStreak})` : ''}` },
  ]
})

// ===== DOPPEL =====
const doublesStats = computed(() => {
  const confirmed = store.doublesMatches.filter(m => (m.status || 'confirmed') === 'confirmed')
  const pById = {}; store.players.forEach(p => { pById[p.id] = p })
  const asMain = {}, asPartner = {}, total = {}, partners = {}, duos = {}
  store.players.forEach(p => {
    asMain[p.id] = { id: p.id, name: p.name, wins: 0, matches: 0 }
    asPartner[p.id] = { id: p.id, name: p.name, wins: 0, matches: 0 }
    total[p.id] = { id: p.id, name: p.name, matches: 0 }
    partners[p.id] = new Set()
  })

  confirmed.forEach(match => {
    if (!match.sets || match.sets.length < 2) return
    if (!match.team1 || !match.team2) return
    let t1 = 0, t2 = 0
    match.sets.forEach(s => { if (s.t1 > s.t2) t1++; else t2++ })
    const t1Won = t1 > t2
    const ids = [match.team1.player1Id, match.team1.player2Id, match.team2.player1Id, match.team2.player2Id]
    ids.forEach(id => { if (total[id]) total[id].matches++ })
    if (asMain[match.team1.player1Id]) asMain[match.team1.player1Id].matches++
    if (asPartner[match.team1.player2Id]) asPartner[match.team1.player2Id].matches++
    if (asMain[match.team2.player1Id]) asMain[match.team2.player1Id].matches++
    if (asPartner[match.team2.player2Id]) asPartner[match.team2.player2Id].matches++
    const win = t1Won ? match.team1 : match.team2
    if (asMain[win.player1Id]) asMain[win.player1Id].wins++
    if (asPartner[win.player2Id]) asPartner[win.player2Id].wins++
    ;[[match.team1.player1Id, match.team1.player2Id, t1Won], [match.team2.player1Id, match.team2.player2Id, !t1Won]].forEach(([pA, pB, won]) => {
      if (!pA || !pB) return
      if (partners[pA]) partners[pA].add(pB)
      if (partners[pB]) partners[pB].add(pA)
      const key = [pA, pB].sort().join('|')
      if (!duos[key]) duos[key] = { name: `${pById[pA]?.name || pA} & ${pById[pB]?.name || pB}`, wins: 0, matches: 0 }
      duos[key].matches++
      if (won) duos[key].wins++
    })
  })

  const topMain = Object.values(asMain).filter(p => p.matches > 0).sort((a, b) => b.wins - a.wins || b.matches - a.matches).slice(0, 3)
  const topPartner = Object.values(asPartner).filter(p => p.matches > 0).sort((a, b) => b.wins - a.wins || b.matches - a.matches).slice(0, 3)
  const topTotal = Object.values(total).filter(p => p.matches > 0).sort((a, b) => b.matches - a.matches).slice(0, 3)
  const topDuo = Object.values(duos).sort((a, b) => b.wins - a.wins || b.matches - a.matches).slice(0, 3)
  const topVersatile = Object.entries(partners).map(([id, set]) => ({ id, name: pById[id]?.name || id, partnerCount: set.size })).filter(p => p.partnerCount > 0).sort((a, b) => b.partnerCount - a.partnerCount).slice(0, 3)

  return [
    { title: 'Meiste Siege (Spieler)', players: topMain, valueFn: p => `${p.wins} Sieg${p.wins !== 1 ? 'e' : ''}` },
    { title: 'Meiste Siege (Mitspieler)', players: topPartner, valueFn: p => `${p.wins} Sieg${p.wins !== 1 ? 'e' : ''}` },
    { title: 'Meiste Doppel gesamt', players: topTotal, valueFn: p => `${p.matches} Spiele` },
    { title: 'Bestes Duo', players: topDuo, valueFn: p => `${p.wins}S / ${p.matches}Sp` },
    { title: 'Meiste Mitspieler', players: topVersatile, valueFn: p => `${p.partnerCount} Partner` },
  ]
})

const rankColors = ['bg-yellow-400 text-gray-700', 'bg-gray-300 text-gray-700', 'bg-orange-300 text-gray-700']
const cardBg = ['bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700', 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600', 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700']
const currentStats = computed(() => view.value === 'singles' ? singleStats.value : doublesStats.value)
</script>

<template>
  <div class="container mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
      <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">Statistiken</h2>

      <div class="mb-4 flex gap-2">
        <button @click="view = 'singles'" class="flex-1 px-3 sm:px-6 py-2.5 rounded-lg font-semibold transition-all text-sm sm:text-base"
          :class="view === 'singles' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300'">Einzel</button>
        <button @click="view = 'doubles'" class="flex-1 px-3 sm:px-6 py-2.5 rounded-lg font-semibold transition-all text-sm sm:text-base"
          :class="view === 'doubles' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300'">Doppel</button>
      </div>

      <!-- Loading skeleton -->
      <div v-if="store.matchesLoading" class="space-y-5 sm:space-y-8">
        <div v-for="i in 4" :key="i" class="animate-pulse">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-36 mb-3"></div>
          <div v-for="j in 3" :key="j" class="flex items-center gap-2 p-2 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-700 mb-1.5">
            <div class="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 flex-shrink-0"></div>
          </div>
        </div>
      </div>

      <div v-else class="space-y-5 sm:space-y-8">
        <div v-for="cat in currentStats" :key="cat.title">
          <h3 class="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">{{ cat.title }}</h3>
          <p v-if="cat.players.length === 0" class="text-gray-400 text-xs">Noch keine Spiele.</p>
          <div v-else class="space-y-1.5">
            <div v-for="(p, i) in cat.players" :key="p.id || p.name"
              class="flex items-center gap-2 p-2 sm:p-3 rounded-lg border"
              :class="cardBg[i]">
              <span class="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-xs sm:text-sm font-bold"
                :class="rankColors[i]">{{ i + 1 }}</span>
              <span class="flex-1 font-medium text-gray-800 dark:text-gray-200 text-sm truncate">{{ p.name }}</span>
              <span class="font-semibold text-gray-600 dark:text-gray-400 text-xs sm:text-sm flex-shrink-0">{{ cat.valueFn(p) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
