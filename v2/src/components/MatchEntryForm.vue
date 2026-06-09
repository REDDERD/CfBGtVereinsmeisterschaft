<script setup>
import { ref, computed } from 'vue'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase/index.js'
import { useAppStore } from '@/stores/app.js'

const props = defineProps({
  type: { type: String, required: true }, // 'singles' | 'doubles'
})

const store = useAppStore()

// ─── Singles state ───────────────────────────────────────────────
const sP1 = ref('')
const sP2 = ref('')
const sSet1P1 = ref(''); const sSet1P2 = ref('')
const sSet2P1 = ref(''); const sSet2P2 = ref('')
const sSet3P1 = ref(''); const sSet3P2 = ref('')
const sLoading = ref(false)
const sError = ref('')

const singlesGroup1 = computed(() => store.players.filter(p => p.singlesGroup === 1))
const singlesGroup2 = computed(() => store.players.filter(p => p.singlesGroup === 2))

const availableSP1 = computed(() => {
  const all = [...singlesGroup1.value, ...singlesGroup2.value]
  if (!sP2.value) return all
  const p2obj = store.players.find(p => p.id === sP2.value)
  if (!p2obj) return all
  return all.filter(p => p.singlesGroup === p2obj.singlesGroup && p.id !== sP2.value)
})

const availableSP2 = computed(() => {
  const all = [...singlesGroup1.value, ...singlesGroup2.value]
  if (!sP1.value) return all
  const p1obj = store.players.find(p => p.id === sP1.value)
  if (!p1obj) return all
  return all.filter(p => p.singlesGroup === p1obj.singlesGroup && p.id !== sP1.value)
})

const sNeedSet3 = computed(() => {
  const s1 = Number(sSet1P1.value) > Number(sSet1P2.value) ? 'p1' : 'p2'
  const s2 = Number(sSet2P1.value) > Number(sSet2P2.value) ? 'p1' : 'p2'
  const v1 = sSet1P1.value !== '' && sSet1P2.value !== ''
  const v2 = sSet2P1.value !== '' && sSet2P2.value !== ''
  return v1 && v2 && s1 !== s2
})

const sP1Name = computed(() => store.players.find(p => p.id === sP1.value)?.name || 'Spieler 1')
const sP2Name = computed(() => store.players.find(p => p.id === sP2.value)?.name || 'Spieler 2')

function validateSet(a, b) {
  if (isNaN(a) || isNaN(b) || a < 0 || b < 0) return false
  return true
}

async function submitSingles() {
  sError.value = ''
  if (!sP1.value || !sP2.value || sP1.value === sP2.value) {
    sError.value = 'Bitte zwei verschiedene Spieler auswählen'
    return
  }
  const s1p1 = Number(sSet1P1.value), s1p2 = Number(sSet1P2.value)
  const s2p1 = Number(sSet2P1.value), s2p2 = Number(sSet2P2.value)
  if (!validateSet(s1p1, s1p2) || !validateSet(s2p1, s2p2) || sSet1P1.value === '' || sSet2P1.value === '') {
    sError.value = 'Bitte gültige Ergebnisse für Satz 1 und 2 eingeben'
    return
  }
  const sets = [{ p1: s1p1, p2: s1p2 }, { p1: s2p1, p2: s2p2 }]
  const set1W = s1p1 > s1p2 ? 'p1' : 'p2'
  const set2W = s2p1 > s2p2 ? 'p1' : 'p2'
  if (set1W !== set2W) {
    const s3p1 = Number(sSet3P1.value), s3p2 = Number(sSet3P2.value)
    if (sSet3P1.value === '' || sSet3P2.value === '') {
      sError.value = 'Dritter Satz erforderlich (Spielstand 1:1)'
      return
    }
    if (!validateSet(s3p1, s3p2)) {
      sError.value = 'Ungültiges Ergebnis in Satz 3'
      return
    }
    sets.push({ p1: s3p1, p2: s3p2 })
  }
  const p1obj = store.players.find(p => p.id === sP1.value)
  const settings = store.matchStatusSettings || {}
  const status = store.isAdmin ? (settings.singlesAdminDefault || 'confirmed') : (settings.singlesUserDefault || 'unconfirmed')
  const round = p1obj?.singlesGroup === 1 ? 'group1' : 'group2'
  sLoading.value = true
  try {
    await addDoc(collection(db, 'seasons', String(store.activeSeason), 'singlesMatches'), {
      player1Id: sP1.value,
      player2Id: sP2.value,
      sets,
      round,
      status,
      date: serverTimestamp(),
    })
    sP1.value = ''; sP2.value = ''
    sSet1P1.value = ''; sSet1P2.value = ''
    sSet2P1.value = ''; sSet2P2.value = ''
    sSet3P1.value = ''; sSet3P2.value = ''
  } catch (e) {
    sError.value = 'Fehler beim Speichern: ' + e.message
  } finally {
    sLoading.value = false
  }
}

// ─── Doubles state ───────────────────────────────────────────────
const dT1P1 = ref(''); const dT1P2 = ref('')
const dT2P1 = ref(''); const dT2P2 = ref('')
const dSet1T1 = ref(''); const dSet1T2 = ref('')
const dSet2T1 = ref(''); const dSet2T2 = ref('')
const dSet3T1 = ref(''); const dSet3T2 = ref('')
const dLoading = ref(false)
const dError = ref('')

const doublesPlayers = computed(() => store.players.filter(p => p.doublesPool))

function dAvail(selected1, selected2, selfExclude) {
  return doublesPlayers.value.filter(p => {
    if (p.id === selfExclude) return false
    if (p.id === selected1 || p.id === selected2) return false
    return true
  })
}

const dAvailT1P1 = computed(() => dAvail(dT2P1.value, dT2P2.value, dT1P2.value))
const dAvailT1P2 = computed(() => dAvail(dT2P1.value, dT2P2.value, dT1P1.value))
const dAvailT2P1 = computed(() => dAvail(dT1P1.value, dT1P2.value, dT2P2.value))
const dAvailT2P2 = computed(() => dAvail(dT1P1.value, dT1P2.value, dT2P1.value))

const dNeedSet3 = computed(() => {
  const s1 = Number(dSet1T1.value) > Number(dSet1T2.value) ? 't1' : 't2'
  const s2 = Number(dSet2T1.value) > Number(dSet2T2.value) ? 't1' : 't2'
  const v1 = dSet1T1.value !== '' && dSet1T2.value !== ''
  const v2 = dSet2T1.value !== '' && dSet2T2.value !== ''
  return v1 && v2 && s1 !== s2
})

const dT1Label = computed(() => {
  const a = doublesPlayers.value.find(p => p.id === dT1P1.value)?.name
  const b = doublesPlayers.value.find(p => p.id === dT1P2.value)?.name
  return a && b ? `${a} & ${b}` : 'Team 1'
})
const dT2Label = computed(() => {
  const a = doublesPlayers.value.find(p => p.id === dT2P1.value)?.name
  const b = doublesPlayers.value.find(p => p.id === dT2P2.value)?.name
  return a && b ? `${a} & ${b}` : 'Team 2'
})

async function submitDoubles() {
  dError.value = ''
  if (!dT1P1.value || !dT1P2.value || !dT2P1.value || !dT2P2.value) {
    dError.value = 'Bitte alle 4 Spieler auswählen'
    return
  }
  const ids = [dT1P1.value, dT1P2.value, dT2P1.value, dT2P2.value]
  if (new Set(ids).size !== 4) {
    dError.value = 'Jeder Spieler kann nur einmal teilnehmen'
    return
  }
  const t1p1obj = doublesPlayers.value.find(p => p.id === dT1P1.value)
  const t1p2obj = doublesPlayers.value.find(p => p.id === dT1P2.value)
  const t2p1obj = doublesPlayers.value.find(p => p.id === dT2P1.value)
  const t2p2obj = doublesPlayers.value.find(p => p.id === dT2P2.value)
  if (t1p1obj?.doublesPool === t1p2obj?.doublesPool) {
    dError.value = `Team 1: Spieler müssen aus verschiedenen Pools sein`
    return
  }
  if (t2p1obj?.doublesPool === t2p2obj?.doublesPool) {
    dError.value = `Team 2: Spieler müssen aus verschiedenen Pools sein`
    return
  }
  const s1t1 = Number(dSet1T1.value), s1t2 = Number(dSet1T2.value)
  const s2t1 = Number(dSet2T1.value), s2t2 = Number(dSet2T2.value)
  if (!validateSet(s1t1, s1t2) || !validateSet(s2t1, s2t2) || dSet1T1.value === '' || dSet2T1.value === '') {
    dError.value = 'Bitte gültige Ergebnisse für Satz 1 und 2 eingeben'
    return
  }
  const sets = [{ t1: s1t1, t2: s1t2 }, { t1: s2t1, t2: s2t2 }]
  const set1W = s1t1 > s1t2 ? 't1' : 't2'
  const set2W = s2t1 > s2t2 ? 't1' : 't2'
  if (set1W !== set2W) {
    const s3t1 = Number(dSet3T1.value), s3t2 = Number(dSet3T2.value)
    if (dSet3T1.value === '' || dSet3T2.value === '') {
      dError.value = 'Dritter Satz erforderlich (Spielstand 1:1)'
      return
    }
    if (!validateSet(s3t1, s3t2)) {
      dError.value = 'Ungültiges Ergebnis in Satz 3'
      return
    }
    sets.push({ t1: s3t1, t2: s3t2 })
  }
  const dsettings = store.matchStatusSettings || {}
  const status = store.isAdmin ? (dsettings.doublesAdminDefault || 'confirmed') : (dsettings.doublesUserDefault || 'unconfirmed')
  dLoading.value = true
  try {
    await addDoc(collection(db, 'seasons', String(store.activeSeason), 'doublesMatches'), {
      team1: { player1Id: dT1P1.value, player2Id: dT1P2.value },
      team2: { player1Id: dT2P1.value, player2Id: dT2P2.value },
      sets,
      status,
      date: serverTimestamp(),
    })
    dT1P1.value = ''; dT1P2.value = ''; dT2P1.value = ''; dT2P2.value = ''
    dSet1T1.value = ''; dSet1T2.value = ''
    dSet2T1.value = ''; dSet2T2.value = ''
    dSet3T1.value = ''; dSet3T2.value = ''
  } catch (e) {
    dError.value = 'Fehler beim Speichern: ' + e.message
  } finally {
    dLoading.value = false
  }
}
</script>

<template>
  <!-- ===== SINGLES FORM ===== -->
  <div v-if="type === 'singles'" class="p-3 sm:p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
    <h4 class="font-bold text-gray-800 dark:text-gray-100 mb-3 text-sm sm:text-base">Neues Einzel-Spiel eintragen</h4>

    <div class="grid grid-cols-2 gap-2 sm:gap-4 mb-4">
      <select v-model="sP1" class="w-full px-2 sm:px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 text-sm">
        <option value="">Spieler 1</option>
        <option v-for="p in availableSP1" :key="p.id" :value="p.id">{{ p.name }}</option>
      </select>
      <select v-model="sP2" class="w-full px-2 sm:px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 text-sm">
        <option value="">Spieler 2</option>
        <option v-for="p in availableSP2" :key="p.id" :value="p.id">{{ p.name }}</option>
      </select>
    </div>

    <div class="space-y-2 mb-4">
      <div v-for="(set, idx) in [
        { labelKey: '1', a: sSet1P1, b: sSet1P2, aModel: 'sSet1P1', bModel: 'sSet1P2' },
        { labelKey: '2', a: sSet2P1, b: sSet2P2, aModel: 'sSet2P1', bModel: 'sSet2P2' },
        { labelKey: '3', a: sSet3P1, b: sSet3P2, aModel: 'sSet3P1', bModel: 'sSet3P2' },
      ]" :key="set.labelKey">
        <div v-if="set.labelKey !== '3' || sNeedSet3" class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400 w-12 flex-shrink-0">Satz {{ set.labelKey }}</span>
          <input type="number" v-model="sSet1P1" v-if="set.labelKey === '1'"
            min="0" max="30" :placeholder="sP1Name.substring(0,8)"
            class="flex-1 px-2 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-center bg-white dark:bg-gray-800 dark:text-gray-100 text-sm" />
          <input type="number" v-model="sSet2P1" v-else-if="set.labelKey === '2'"
            min="0" max="30" :placeholder="sP1Name.substring(0,8)"
            class="flex-1 px-2 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-center bg-white dark:bg-gray-800 dark:text-gray-100 text-sm" />
          <input type="number" v-model="sSet3P1" v-else
            min="0" max="30" :placeholder="sP1Name.substring(0,8)"
            class="flex-1 px-2 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-center bg-white dark:bg-gray-800 dark:text-gray-100 text-sm" />
          <span class="text-gray-400 font-bold">:</span>
          <input type="number" v-model="sSet1P2" v-if="set.labelKey === '1'"
            min="0" max="30" :placeholder="sP2Name.substring(0,8)"
            class="flex-1 px-2 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-center bg-white dark:bg-gray-800 dark:text-gray-100 text-sm" />
          <input type="number" v-model="sSet2P2" v-else-if="set.labelKey === '2'"
            min="0" max="30" :placeholder="sP2Name.substring(0,8)"
            class="flex-1 px-2 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-center bg-white dark:bg-gray-800 dark:text-gray-100 text-sm" />
          <input type="number" v-model="sSet3P2" v-else
            min="0" max="30" :placeholder="sP2Name.substring(0,8)"
            class="flex-1 px-2 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-center bg-white dark:bg-gray-800 dark:text-gray-100 text-sm" />
        </div>
      </div>
    </div>

    <p v-if="sError" class="text-red-600 text-xs sm:text-sm mb-2">{{ sError }}</p>
    <button @click="submitSingles" :disabled="sLoading"
      class="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm disabled:opacity-50">
      {{ sLoading ? 'Wird gespeichert...' : 'Spiel eintragen' }}
    </button>
  </div>

  <!-- ===== DOUBLES FORM ===== -->
  <div v-else class="p-3 sm:p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
    <h4 class="font-bold text-gray-800 dark:text-gray-100 mb-3 text-sm sm:text-base">Doppel-Spiel eintragen</h4>

    <div class="mb-3 p-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-400 rounded text-xs sm:text-sm text-blue-800 dark:text-blue-300">
      Ergebnis wird nur für Spieler 1 jedes Teams gewertet!
    </div>

    <div class="grid grid-cols-2 gap-3 mb-4">
      <div>
        <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Herausgefordert</label>
        <select v-model="dT1P1" class="w-full px-2 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg mb-1.5 bg-white dark:bg-gray-800 dark:text-gray-100 text-sm">
          <option value="">Spieler 1</option>
          <option v-for="p in dAvailT1P1" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
        <select v-model="dT1P2" class="w-full px-2 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 text-sm">
          <option value="">Spieler 2</option>
          <option v-for="p in dAvailT1P2" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Herausforderer</label>
        <select v-model="dT2P1" class="w-full px-2 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg mb-1.5 bg-white dark:bg-gray-800 dark:text-gray-100 text-sm">
          <option value="">Spieler 1</option>
          <option v-for="p in dAvailT2P1" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
        <select v-model="dT2P2" class="w-full px-2 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 text-sm">
          <option value="">Spieler 2</option>
          <option v-for="p in dAvailT2P2" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
      </div>
    </div>

    <div class="space-y-2 mb-4">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-600 dark:text-gray-400 w-12 flex-shrink-0">Satz 1</span>
        <input v-model="dSet1T1" type="number" min="0" max="30" :placeholder="dT1Label.substring(0,4)"
          class="flex-1 px-2 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-center bg-white dark:bg-gray-800 dark:text-gray-100 text-sm" />
        <span class="text-gray-400 font-bold">:</span>
        <input v-model="dSet1T2" type="number" min="0" max="30" :placeholder="dT2Label.substring(0,4)"
          class="flex-1 px-2 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-center bg-white dark:bg-gray-800 dark:text-gray-100 text-sm" />
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-600 dark:text-gray-400 w-12 flex-shrink-0">Satz 2</span>
        <input v-model="dSet2T1" type="number" min="0" max="30" :placeholder="dT1Label.substring(0,4)"
          class="flex-1 px-2 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-center bg-white dark:bg-gray-800 dark:text-gray-100 text-sm" />
        <span class="text-gray-400 font-bold">:</span>
        <input v-model="dSet2T2" type="number" min="0" max="30" :placeholder="dT2Label.substring(0,4)"
          class="flex-1 px-2 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-center bg-white dark:bg-gray-800 dark:text-gray-100 text-sm" />
      </div>
      <div v-if="dNeedSet3" class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-600 dark:text-gray-400 w-12 flex-shrink-0">Satz 3</span>
        <input v-model="dSet3T1" type="number" min="0" max="30" :placeholder="dT1Label.substring(0,4)"
          class="flex-1 px-2 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-center bg-white dark:bg-gray-800 dark:text-gray-100 text-sm" />
        <span class="text-gray-400 font-bold">:</span>
        <input v-model="dSet3T2" type="number" min="0" max="30" :placeholder="dT2Label.substring(0,4)"
          class="flex-1 px-2 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-center bg-white dark:bg-gray-800 dark:text-gray-100 text-sm" />
      </div>
    </div>

    <p v-if="dError" class="text-red-600 text-xs sm:text-sm mb-2">{{ dError }}</p>
    <button @click="submitDoubles" :disabled="dLoading"
      class="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm disabled:opacity-50">
      {{ dLoading ? 'Wird gespeichert...' : 'Doppel-Spiel eintragen' }}
    </button>
  </div>
</template>
