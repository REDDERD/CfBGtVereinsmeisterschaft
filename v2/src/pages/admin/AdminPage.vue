<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import {
  signInWithEmailAndPassword, signOut, sendPasswordResetEmail,
} from 'firebase/auth'
import {
  collection, doc, addDoc, updateDoc, deleteDoc, setDoc, getDocs,
  serverTimestamp, writeBatch,
} from 'firebase/firestore'
import * as XLSX from 'xlsx'
import { db, auth } from '@/firebase/index.js'
import { useAppStore } from '@/stores/app.js'
import { useFirebaseListeners } from '@/composables/useFirebaseListeners.js'
import GroupTable from '@/components/GroupTable.vue'
import MatchCard from '@/components/MatchCard.vue'
import { calculateStandings } from '@/utils/calculations.js'
import { pyramidLevelsToArray } from '@/utils/pyramid.js'

useFirebaseListeners()
const store = useAppStore()
const router = useRouter()

// ─── Auth ─────────────────────────────────────────────────────────
const loginEmail = ref('')
const loginPassword = ref('')
const loginError = ref('')
const loginLoading = ref(false)
const showPwReset = ref(false)
const resetEmail = ref('')
const resetMsg = ref('')
const resetError = ref('')
const showPassword = ref(false)

async function handleLogin() {
  loginError.value = ''
  loginLoading.value = true
  try {
    await signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value)
  } catch (e) {
    loginError.value = e.message
  } finally {
    loginLoading.value = false
  }
}
async function handleLogout() {
  await signOut(auth)
}
async function handlePasswordReset() {
  resetMsg.value = ''; resetError.value = ''
  try {
    await sendPasswordResetEmail(auth, resetEmail.value)
    resetMsg.value = 'E-Mail wurde gesendet.'
  } catch (e) { resetError.value = e.message }
}

// ─── Tab ──────────────────────────────────────────────────────────
const activeTab = ref('players')
const tabs = [
  { id: 'players', label: 'Spieler' },
  { id: 'singles', label: 'Einzel' },
  { id: 'doubles', label: 'Doppel' },
  { id: 'matches', label: 'Spiele' },
  { id: 'announcements', label: 'News' },
  { id: 'season', label: 'Saison' },
  { id: 'settings', label: 'Einstell.' },
  { id: 'export', label: 'Export' },
]

const seasonPath = computed(() => `seasons/${store.activeSeason}`)

// ─── PLAYERS ──────────────────────────────────────────────────────
const newPlayerName = ref('')
const editingId = ref(null)
const editName = ref('')
const editSinglesGroup = ref('')
const editDoublesPool = ref('')

async function addPlayer() {
  const name = newPlayerName.value.trim()
  if (!name) return
  await addDoc(collection(db, seasonPath.value, 'players'), { name, singlesGroup: null, doublesPool: null, createdAt: serverTimestamp() })
  newPlayerName.value = ''
}
function startEdit(p) {
  editingId.value = p.id
  editName.value = p.name
  editSinglesGroup.value = p.singlesGroup ? String(p.singlesGroup) : ''
  editDoublesPool.value = p.doublesPool || ''
}
function cancelEdit() { editingId.value = null }
async function savePlayer(id) {
  const name = editName.value.trim()
  if (!name) return
  const sg = editSinglesGroup.value ? Number(editSinglesGroup.value) : null
  const dp = editDoublesPool.value || null
  await updateDoc(doc(db, seasonPath.value, 'players', id), { name, singlesGroup: sg, doublesPool: dp })
  editingId.value = null
}
async function deletePlayer(id) {
  if (!confirm('Spieler wirklich löschen?')) return
  await deleteDoc(doc(db, seasonPath.value, 'players', id))
}

// ─── SINGLES ──────────────────────────────────────────────────────
const walkoverSinglesWinner = ref('')
const walkoverSinglesLoser = ref('')
const singlesPlayers = computed(() => store.players.filter(p => p.singlesGroup))
const walkoverSinglesAvailableLoser = computed(() => {
  if (!walkoverSinglesWinner.value) return []
  const w = store.players.find(p => p.id === walkoverSinglesWinner.value)
  if (!w) return []
  return store.players.filter(p => p.singlesGroup === w.singlesGroup && p.id !== walkoverSinglesWinner.value)
})

async function addSinglesWalkover() {
  if (!walkoverSinglesWinner.value || !walkoverSinglesLoser.value) return
  const w = store.players.find(p => p.id === walkoverSinglesWinner.value)
  const round = w?.singlesGroup === 1 ? 'group1' : 'group2'
  await addDoc(collection(db, seasonPath.value, 'singlesMatches'), {
    player1Id: walkoverSinglesWinner.value,
    player2Id: walkoverSinglesLoser.value,
    sets: [{ p1: 21, p2: 0 }, { p1: 21, p2: 0 }],
    status: 'confirmed',
    walkover: true, round,
    date: serverTimestamp(),
  })
  walkoverSinglesWinner.value = ''; walkoverSinglesLoser.value = ''
}

const positions = [
  { value: 'g1p1', label: '1. Platz Gr. 1' }, { value: 'g1p2', label: '2. Platz Gr. 1' },
  { value: 'g1p3', label: '3. Platz Gr. 1' }, { value: 'g1p4', label: '4. Platz Gr. 1' },
  { value: 'g2p1', label: '1. Platz Gr. 2' }, { value: 'g2p2', label: '2. Platz Gr. 2' },
  { value: 'g2p3', label: '3. Platz Gr. 2' }, { value: 'g2p4', label: '4. Platz Gr. 2' },
]
const qfConfig = reactive({ qf_1_p1: '', qf_1_p2: '', qf_2_p1: '', qf_2_p2: '', qf_3_p1: '', qf_3_p2: '', qf_4_p1: '', qf_4_p2: '' })
const koConfigLoaded = ref(false)
function ensureKoConfig() {
  if (koConfigLoaded.value) return
  const c = store.knockoutConfig || {}
  for (const k of Object.keys(qfConfig)) { qfConfig[k] = c[k] || '' }
  koConfigLoaded.value = true
}

async function saveKnockoutConfig() {
  const data = {}
  for (const k of Object.keys(qfConfig)) { if (qfConfig[k]) data[k] = qfConfig[k] }
  await setDoc(doc(db, 'settings', 'knockoutConfig'), data, { merge: true })
}
async function activateKnockoutPhase() {
  if (!confirm('K.O.-Phase starten? Die Tabellenstände werden eingefroren.')) return
  const g1 = calculateStandings(1); const g2 = calculateStandings(2)
  await setDoc(doc(db, 'settings', 'knockoutPhase'), {
    active: true,
    frozenStandings: { group1: g1, group2: g2 },
    activatedAt: serverTimestamp(),
  })
}
async function deactivateKnockoutPhase() {
  if (!confirm('K.O.-Phase wirklich deaktivieren?')) return
  await updateDoc(doc(db, 'settings', 'knockoutPhase'), { active: false })
}

// ─── DOUBLES ──────────────────────────────────────────────────────
const walkoverDoublesWinner = ref('')
const walkoverDoublesLoser = ref('')
const doublesPlayers = computed(() => store.players.filter(p => p.doublesPool))
const manualExpanded = ref(false)
const flatPositions = computed(() => {
  const levels = store.pyramid?.levels || []
  return levels.flat().filter(Boolean)
})

async function addDoublesWalkover() {
  if (!walkoverDoublesWinner.value || !walkoverDoublesLoser.value) return
  if (walkoverDoublesWinner.value === walkoverDoublesLoser.value) return
  const wObj = store.players.find(p => p.id === walkoverDoublesWinner.value)
  const lObj = store.players.find(p => p.id === walkoverDoublesLoser.value)
  if (!wObj || !lObj) return

  await addDoc(collection(db, seasonPath.value, 'doublesMatches'), {
    team1: { player1Id: walkoverDoublesWinner.value, player2Id: null },
    team2: { player1Id: walkoverDoublesLoser.value, player2Id: null },
    sets: [{ t1: 21, t2: 0 }, { t1: 21, t2: 0 }],
    status: 'confirmed',
    walkover: true,
    date: serverTimestamp(),
  })

  // Swap in pyramid
  const levels = store.pyramid?.levels ? store.pyramid.levels.map(l => [...l]) : []
  const flat = levels.flat()
  const wi = flat.indexOf(walkoverDoublesWinner.value)
  const li = flat.indexOf(walkoverDoublesLoser.value)
  if (wi !== -1 && li !== -1 && wi > li) {
    // winner moves up (swaps positions)
    let cnt = 0; let wiLevel = -1, wiIdx = -1, liLevel = -1, liIdx = -1
    for (let l = 0; l < levels.length; l++) {
      for (let i = 0; i < levels[l].length; i++) {
        if (levels[l][i] === walkoverDoublesWinner.value) { wiLevel = l; wiIdx = i }
        if (levels[l][i] === walkoverDoublesLoser.value) { liLevel = l; liIdx = i }
      }
    }
    if (wiLevel !== -1 && liLevel !== -1) {
      levels[wiLevel][wiIdx] = walkoverDoublesLoser.value
      levels[liLevel][liIdx] = walkoverDoublesWinner.value
      const levelData = {}
      levels.forEach((l, i) => { levelData[`level${i + 1}`] = l })
      await setDoc(doc(db, seasonPath.value, 'pyramid', 'current'), levelData)
    }
  }
  walkoverDoublesWinner.value = ''; walkoverDoublesLoser.value = ''
}

async function initPyramid() {
  const players = store.players.filter(p => p.doublesPool)
  if (players.length === 0) { alert('Keine Doppel-Spieler vorhanden.'); return }
  const shuffled = [...players].sort(() => Math.random() - 0.5)
  const levels = []
  let i = 0, level = 1
  while (i < shuffled.length) {
    levels.push(shuffled.slice(i, i + level).map(p => p.id))
    i += level; level++
  }
  const levelData = {}
  levels.forEach((l, idx) => { levelData[`level${idx + 1}`] = l })
  await setDoc(doc(db, seasonPath.value, 'pyramid', 'current'), levelData)
}

async function movePlayerUp(idx) {
  const flat = [...flatPositions.value]
  if (idx <= 0) return
  ;[flat[idx - 1], flat[idx]] = [flat[idx], flat[idx - 1]]
  await saveFlatPyramid(flat)
}
async function movePlayerDown(idx) {
  const flat = [...flatPositions.value]
  if (idx >= flat.length - 1) return
  ;[flat[idx], flat[idx + 1]] = [flat[idx + 1], flat[idx]]
  await saveFlatPyramid(flat)
}
async function saveFlatPyramid(flat) {
  const levels = store.pyramid?.levels || []
  let pos = 0
  const newLevels = levels.map(l => {
    const slice = flat.slice(pos, pos + l.length)
    pos += l.length
    return slice
  })
  const levelData = {}
  newLevels.forEach((l, i) => { levelData[`level${i + 1}`] = l })
  await setDoc(doc(db, seasonPath.value, 'pyramid', 'current'), levelData)
}

// ─── MATCHES ──────────────────────────────────────────────────────
const matchTypeFilter = reactive({ singles: true, doubles: true })
const matchStatusFilter = reactive({ unconfirmed: true, confirmed: false, rejected: false })
const matchSearch = ref('')

const filteredAdminMatches = computed(() => {
  const all = []
  if (matchTypeFilter.singles) {
    store.singlesMatches.forEach(m => all.push({ ...m, type: 'singles' }))
  }
  if (matchTypeFilter.doubles) {
    store.doublesMatches.forEach(m => all.push({ ...m, type: 'doubles' }))
  }
  const q = matchSearch.value.toLowerCase()
  const n = id => store.players.find(p => p.id === id)?.name?.toLowerCase() || ''
  return all
    .filter(m => {
      const s = m.status || 'confirmed'
      return (s === 'unconfirmed' && matchStatusFilter.unconfirmed)
        || (s === 'confirmed' && matchStatusFilter.confirmed)
        || (s === 'rejected' && matchStatusFilter.rejected)
    })
    .filter(m => {
      if (!q) return true
      if (m.type !== 'doubles') return n(m.player1Id).includes(q) || n(m.player2Id).includes(q)
      return [m.team1?.player1Id, m.team1?.player2Id, m.team2?.player1Id, m.team2?.player2Id].some(id => n(id).includes(q))
    })
    .sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0))
})

async function updateMatchStatus(id, type, status) {
  const col = type === 'doubles' ? 'doublesMatches' : 'singlesMatches'
  await updateDoc(doc(db, seasonPath.value, col, id), { status })
}
async function deleteMatch(id, type) {
  if (!confirm('Spiel wirklich löschen?')) return
  const col = type === 'doubles' ? 'doublesMatches' : 'singlesMatches'
  await deleteDoc(doc(db, seasonPath.value, col, id))
}

// ─── ANNOUNCEMENTS ────────────────────────────────────────────────
const announcementText = ref('')
async function addAnnouncement() {
  const text = announcementText.value.trim()
  if (!text) return
  await addDoc(collection(db, 'announcements'), { text, active: true, createdAt: serverTimestamp() })
  announcementText.value = ''
}
async function toggleAnnouncement(id, active) {
  await updateDoc(doc(db, 'announcements', id), { active: !active })
}
async function deleteAnnouncement(id) {
  if (!confirm('Ankündigung wirklich löschen?')) return
  await deleteDoc(doc(db, 'announcements', id))
}

// ─── SEASON ───────────────────────────────────────────────────────
const newSeasonYear = ref(new Date().getFullYear() + 1)
const copyPlayers = ref(true)
const copyPlayerSettings = ref(true)
const newSeasonArchiveVisible = ref(true)
const currentYear = new Date().getFullYear()

async function changeActiveSeason(year) {
  await setDoc(doc(db, 'settings', 'activeSeason'), { year: Number(year) })
}
async function createNewSeason() {
  const year = Number(newSeasonYear.value)
  if (!year || year < 2020 || year > 2099) { alert('Bitte ein gültiges Jahr eingeben (2020–2099)'); return }
  const existingSnap = await getDocs(collection(db, 'seasons', String(year), 'players'))
  if (!confirm(`Saison ${year} anlegen?`)) return
  await setDoc(doc(db, 'seasons', String(year)), {
    label: `Saison ${year}`,
    archiveVisible: newSeasonArchiveVisible.value,
    createdAt: serverTimestamp(),
  })
  if (copyPlayers.value && store.players.length > 0) {
    for (const p of store.players) {
      await addDoc(collection(db, 'seasons', String(year), 'players'), {
        name: p.name,
        singlesGroup: copyPlayerSettings.value ? (p.singlesGroup || null) : null,
        doublesPool: copyPlayerSettings.value ? (p.doublesPool || null) : null,
        createdAt: serverTimestamp(),
      })
    }
  }
  if (confirm(`Zur Saison ${year} wechseln?`)) {
    await changeActiveSeason(year)
  }
}
async function updateArchiveVisibility(year, visible) {
  await updateDoc(doc(db, 'seasons', String(year)), { archiveVisible: visible })
}

// ─── SETTINGS ─────────────────────────────────────────────────────
const settings = computed(() => store.matchStatusSettings || {})
const singlesValMode = computed(() => store.singlesValidationMode || 'allow')
const doublesValMode = computed(() => store.doublesValidationMode || 'allow')
const displaySettings = computed(() => store.matchesDisplaySettings || {})

async function saveMatchStatusSettings(key, value) {
  await setDoc(doc(db, 'settings', 'defaultMatchStatus'), { [key]: value }, { merge: true })
}
async function saveValidationMode(type, mode) {
  const key = type === 'singles' ? 'singlesValidationMode' : 'doublesValidationMode'
  await setDoc(doc(db, 'settings', 'validationModes'), { [key]: mode }, { merge: true })
}
async function saveDisplaySetting(key, value) {
  const cur = store.matchesDisplaySettings || {}
  await setDoc(doc(db, 'settings', 'matchesDisplay'), { ...cur, [key]: value })
}

// ─── EXPORT ───────────────────────────────────────────────────────
const exportOptions = reactive({
  singlesGroup: false, singlesKnockout: false,
  doublesPyramid: false, singlesMatches: false,
  doublesMatches: false, playerStats: false, settings: false,
})
const selectAll = ref(false)
function toggleAll() { for (const k of Object.keys(exportOptions)) { exportOptions[k] = selectAll.value } }

function pName(id) { return store.players.find(p => p.id === id)?.name || id }

function performExport() {
  if (!Object.values(exportOptions).some(Boolean)) { alert('Bitte mindestens eine Option wählen'); return }
  const wb = XLSX.utils.book_new()
  if (exportOptions.singlesGroup) {
    const g1 = calculateStandings(1); const g2 = calculateStandings(2)
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['#','Name','Sp','Pkt','Sätze+','Sätze-'], ...g1.map((p,i) => [i+1, p.name, p.played, p.points, p.setsWon, p.setsLost])]), 'Gruppe 1')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['#','Name','Sp','Pkt','Sätze+','Sätze-'], ...g2.map((p,i) => [i+1, p.name, p.played, p.points, p.setsWon, p.setsLost])]), 'Gruppe 2')
  }
  if (exportOptions.singlesMatches) {
    const rows = [['Datum','Spieler 1','Spieler 2','Satz 1','Satz 2','Satz 3','Status']]
    store.singlesMatches.forEach(m => {
      const d = m.date?.seconds ? new Date(m.date.seconds*1000).toLocaleDateString('de-DE') : ''
      rows.push([d, pName(m.player1Id), pName(m.player2Id), m.sets?.[0] ? `${m.sets[0].p1}:${m.sets[0].p2}` : '', m.sets?.[1] ? `${m.sets[1].p1}:${m.sets[1].p2}` : '', m.sets?.[2] ? `${m.sets[2].p1}:${m.sets[2].p2}` : '', m.status || 'confirmed'])
    })
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Einzel-Spiele')
  }
  if (exportOptions.doublesMatches) {
    const rows = [['Datum','Team 1 Sp1','Team 1 Sp2','Team 2 Sp1','Team 2 Sp2','Satz 1','Satz 2','Satz 3','Status']]
    store.doublesMatches.forEach(m => {
      const d = m.date?.seconds ? new Date(m.date.seconds*1000).toLocaleDateString('de-DE') : ''
      rows.push([d, pName(m.team1?.player1Id), pName(m.team1?.player2Id), pName(m.team2?.player1Id), pName(m.team2?.player2Id), m.sets?.[0] ? `${m.sets[0].t1}:${m.sets[0].t2}` : '', m.sets?.[1] ? `${m.sets[1].t1}:${m.sets[1].t2}` : '', m.sets?.[2] ? `${m.sets[2].t1}:${m.sets[2].t2}` : '', m.status || 'confirmed'])
    })
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Doppel-Spiele')
  }
  if (exportOptions.doublesPyramid) {
    const flat = flatPositions.value
    const rows = [['Rang','Name']]
    flat.forEach((id, i) => rows.push([i+1, pName(id)]))
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Doppel-Rangfolge')
  }
  if (exportOptions.playerStats) {
    const rows = [['Name','Einzel Spiele','Einzel Siege','Einzel Quote','Doppel Spiele','Doppel Siege']]
    store.players.forEach(p => {
      const sm = store.singlesMatches.filter(m => (m.status||'confirmed')==='confirmed' && (m.player1Id===p.id||m.player2Id===p.id) && m.sets?.length>=2)
      let sw=0; sm.forEach(m=>{ let a=0,b=0; m.sets.forEach(s=>{if(s.p1>s.p2)a++;else b++}); const won=(m.player1Id===p.id&&a>b)||(m.player2Id===p.id&&b>a); if(won)sw++ })
      const dm = store.doublesMatches.filter(m => (m.status||'confirmed')==='confirmed' && m.team1 && m.team2 && [m.team1.player1Id,m.team1.player2Id,m.team2.player1Id,m.team2.player2Id].includes(p.id) && m.sets?.length>=2)
      let dw=0; dm.forEach(m=>{ let a=0,b=0; m.sets.forEach(s=>{if(s.t1>s.t2)a++;else b++}); const isT1=m.team1.player1Id===p.id||m.team1.player2Id===p.id; const won=(isT1&&a>b)||(!isT1&&b>a); if(won)dw++ })
      rows.push([p.name, sm.length, sw, sm.length>0?Math.round(sw/sm.length*100)+'%':'—', dm.length, dw])
    })
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Spielerstatistiken')
  }
  if (exportOptions.settings) {
    const s = store.matchStatusSettings || {}
    const rows = [['Einstellung','Wert'],['Einzel Admin Default',s.singlesAdminDefault||'—'],['Einzel User Default',s.singlesUserDefault||'—'],['Doppel Admin Default',s.doublesAdminDefault||'—'],['Doppel User Default',s.doublesUserDefault||'—'],['Einzel Validierung',store.singlesValidationMode||'allow'],['Doppel Validierung',store.doublesValidationMode||'allow']]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Einstellungen')
  }
  const timestamp = new Date().toISOString().split('T')[0]
  XLSX.writeFile(wb, `Vereinsmeisterschaft_Export_${timestamp}.xlsx`)
}
</script>

<template>
  <div class="container mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">

    <!-- ===== NOT LOGGED IN ===== -->
    <div v-if="!store.user" class="max-w-md mx-auto">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8">
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
            <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">Admin Login</h2>
          <p class="text-sm text-gray-500 mt-1">Melde dich an, um die Verwaltung zu nutzen</p>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-Mail</label>
            <input v-model="loginEmail" type="email" @keyup.enter="handleLogin"
              placeholder="admin@verein.de"
              class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passwort</label>
            <div class="relative">
              <input v-model="loginPassword" :type="showPassword ? 'text' : 'password'" @keyup.enter="handleLogin"
                placeholder="••••••••"
                class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 pr-10" />
              <button @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              </button>
            </div>
          </div>
          <div class="flex justify-end">
            <button @click="showPwReset = true" class="text-sm text-indigo-600 hover:text-indigo-700">Passwort vergessen?</button>
          </div>
          <p v-if="loginError" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ loginError }}</p>
          <button @click="handleLogin" :disabled="loginLoading" class="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50">
            {{ loginLoading ? 'Anmelden...' : 'Anmelden' }}
          </button>
        </div>
      </div>

      <!-- Password reset modal -->
      <Teleport to="body">
        <div v-if="showPwReset" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100">Passwort zurücksetzen</h3>
              <button @click="showPwReset = false" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div class="space-y-3">
              <input v-model="resetEmail" type="email" placeholder="deine@email.de" @keyup.enter="handlePasswordReset"
                class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg" />
              <p v-if="resetError" class="text-red-600 text-sm">{{ resetError }}</p>
              <p v-if="resetMsg" class="text-green-600 text-sm">{{ resetMsg }}</p>
              <div class="flex gap-3">
                <button @click="showPwReset = false" class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Abbrechen</button>
                <button @click="handlePasswordReset" class="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Link senden</button>
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>

    <!-- ===== NO PERMISSION ===== -->
    <div v-else-if="!store.isAdmin" class="max-w-md mx-auto">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Keine Berechtigung</h2>
        <p class="text-sm text-gray-500 mb-6">Du bist angemeldet, aber dein Account hat keine Admin-Rechte.</p>
        <div class="flex flex-col gap-3">
          <button @click="router.push('/')" class="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 font-medium">Zur Startseite</button>
          <button @click="handleLogout" class="w-full border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50">Abmelden</button>
        </div>
      </div>
    </div>

    <!-- ===== ADMIN PANEL ===== -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Admin</h2>
        <button @click="handleLogout" class="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          Abmelden
        </button>
      </div>

      <!-- Tab bar -->
      <div class="flex gap-1 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
        <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id; if(tab.id==='singles') ensureKoConfig()"
          class="px-3 py-2 rounded-lg whitespace-nowrap text-xs sm:text-sm font-medium transition-colors flex-shrink-0"
          :class="activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'">
          {{ tab.label }}
        </button>
      </div>

      <!-- ══ SPIELER ══════════════════════════════════════════════ -->
      <div v-if="activeTab === 'players'">
        <div class="mb-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 class="font-semibold text-gray-800 dark:text-gray-100 mb-2 text-sm sm:text-base">Neuen Spieler hinzufügen</h4>
          <div class="flex gap-2">
            <input v-model="newPlayerName" type="text" placeholder="Name" @keyup.enter="addPlayer"
              class="flex-1 px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg text-sm" />
            <button @click="addPlayer" class="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm flex-shrink-0">Hinzufügen</button>
          </div>
        </div>
        <div class="space-y-2">
          <template v-for="p in store.players" :key="p.id">
            <!-- Edit mode -->
            <div v-if="editingId === p.id" class="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 rounded-lg">
              <div class="space-y-2">
                <input v-model="editName" type="text" class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg text-sm" />
                <div class="grid grid-cols-2 gap-2">
                  <select v-model="editSinglesGroup" class="w-full px-2 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg text-sm">
                    <option value="">Kein Einzel</option>
                    <option value="1">Gruppe 1</option>
                    <option value="2">Gruppe 2</option>
                  </select>
                  <select v-model="editDoublesPool" class="w-full px-2 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg text-sm">
                    <option value="">Kein Doppel</option>
                    <option value="A">Pool A</option>
                    <option value="B">Pool B</option>
                  </select>
                </div>
                <div class="flex gap-2">
                  <button @click="savePlayer(p.id)" class="flex-1 px-3 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">Speichern</button>
                  <button @click="cancelEdit" class="flex-1 px-3 py-2.5 bg-gray-400 text-white rounded-lg hover:bg-gray-500 text-sm font-medium">Abbrechen</button>
                </div>
              </div>
            </div>
            <!-- View mode -->
            <div v-else class="flex items-center justify-between p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div class="min-w-0">
                <span class="font-medium text-gray-800 dark:text-gray-100 text-sm truncate block">{{ p.name }}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ p.singlesGroup ? `Gr.${p.singlesGroup}` : '' }}{{ p.singlesGroup && p.doublesPool ? ' · ' : '' }}{{ p.doublesPool ? `Pool ${p.doublesPool}` : '' }}{{ !p.singlesGroup && !p.doublesPool ? '—' : '' }}
                </span>
              </div>
              <div class="flex gap-1 ml-2 flex-shrink-0">
                <button @click="startEdit(p)" class="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                </button>
                <button @click="deletePlayer(p.id)" class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- ══ EINZEL ════════════════════════════════════════════════ -->
      <div v-if="activeTab === 'singles'">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-6">
          <GroupTable :group-num="1" :standings="calculateStandings(1)" />
          <GroupTable :group-num="2" :standings="calculateStandings(2)" />
        </div>

        <!-- Walkover -->
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 mb-6">
          <h3 class="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">Kampfloses Spiel eintragen</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label class="block text-xs font-bold text-green-700 mb-1">Gewinner</label>
              <select v-model="walkoverSinglesWinner" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-green-50 dark:bg-green-900/20">
                <option value="">Spieler wählen...</option>
                <option v-for="p in singlesPlayers" :key="p.id" :value="p.id">{{ p.name }} (Gr. {{ p.singlesGroup }})</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-red-700 mb-1">Verlierer</label>
              <select v-model="walkoverSinglesLoser" :disabled="!walkoverSinglesWinner" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-red-50 dark:bg-red-900/20 disabled:opacity-50">
                <option value="">{{ walkoverSinglesWinner ? 'Spieler wählen...' : 'Erst Gewinner wählen...' }}</option>
                <option v-for="p in walkoverSinglesAvailableLoser" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button @click="addSinglesWalkover" class="px-5 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 text-sm font-semibold">Kampflos eintragen</button>
            <span class="text-xs text-gray-400">Ergebnis: 21:0, 21:0</span>
          </div>
        </div>

        <!-- K.O. Phase -->
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-6 mb-4">
          <h3 class="text-base sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">K.O.-Phase konfigurieren</h3>
          <div v-if="!store.knockoutPhaseActive" class="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 rounded-lg">
            <p class="text-sm text-blue-800 dark:text-blue-300 mb-3">Konfiguriere die Paarungen nach Platzierung, dann starte die K.O.-Phase.</p>
            <button @click="activateKnockoutPhase" class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold">K.O.-Phase starten</button>
          </div>
          <div v-else class="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-300 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p class="text-sm text-green-800 dark:text-green-300">K.O.-Phase ist aktiv.</p>
            <button @click="deactivateKnockoutPhase" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold">K.O.-Phase deaktivieren</button>
          </div>
          <div>
            <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-3">Viertelfinale (4 Spiele)</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="i in [1,2,3,4]" :key="i" class="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <div class="font-medium text-gray-800 dark:text-gray-100 mb-2">Spiel {{ i }}</div>
                <div class="grid grid-cols-2 gap-2">
                  <select v-model="qfConfig[`qf_${i}_p1`]" :disabled="store.knockoutPhaseActive" class="px-2 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm disabled:opacity-50">
                    <option value="">Position</option>
                    <option v-for="p in positions" :key="p.value" :value="p.value">{{ p.label }}</option>
                  </select>
                  <select v-model="qfConfig[`qf_${i}_p2`]" :disabled="store.knockoutPhaseActive" class="px-2 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm disabled:opacity-50">
                    <option value="">Position</option>
                    <option v-for="p in positions" :key="p.value" :value="p.value">{{ p.label }}</option>
                  </select>
                </div>
              </div>
            </div>
            <button v-if="!store.knockoutPhaseActive" @click="saveKnockoutConfig" class="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Paarungen speichern</button>
          </div>
        </div>
      </div>

      <!-- ══ DOPPEL ════════════════════════════════════════════════ -->
      <div v-if="activeTab === 'doubles'">
        <!-- Walkover -->
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 mb-6">
          <h3 class="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">Kampfloses Spiel eintragen</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">Nur die ersten Spieler jedes Teams angeben.</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label class="block text-xs font-bold text-green-700 mb-1">Gewinner (Spieler 1)</label>
              <select v-model="walkoverDoublesWinner" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-green-50 dark:bg-green-900/20">
                <option value="">Spieler wählen...</option>
                <option v-for="p in doublesPlayers" :key="p.id" :value="p.id">{{ p.name }} (Pool {{ p.doublesPool }})</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-red-700 mb-1">Verlierer (Spieler 1)</label>
              <select v-model="walkoverDoublesLoser" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-red-50 dark:bg-red-900/20">
                <option value="">Spieler wählen...</option>
                <option v-for="p in doublesPlayers.filter(p => p.id !== walkoverDoublesWinner)" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button @click="addDoublesWalkover" class="px-5 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 text-sm font-semibold">Kampflos eintragen</button>
            <span class="text-xs text-gray-400">Ergebnis: 21:0, 21:0</span>
          </div>
        </div>

        <!-- Pyramid init or manual -->
        <div v-if="flatPositions.length === 0" class="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p class="text-gray-600 dark:text-gray-300 mb-4">Pyramide noch nicht initialisiert</p>
          <button @click="initPyramid" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Pyramide initialisieren</button>
        </div>
        <div v-else class="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <button @click="manualExpanded = !manualExpanded" class="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors rounded-lg">
            <span class="font-semibold text-gray-800 dark:text-gray-100">Manuelle Rangfolgen-Anpassung</span>
            <svg class="w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform" :class="manualExpanded ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </button>
          <div v-if="manualExpanded" class="p-4 border-t border-gray-200 dark:border-gray-600">
            <div class="space-y-2">
              <div v-for="(id, idx) in flatPositions" :key="id"
                class="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg">
                <div class="flex items-center gap-3 min-w-0">
                  <span class="font-bold text-gray-500 dark:text-gray-400 w-7 text-sm flex-shrink-0">#{{ idx + 1 }}</span>
                  <span class="font-medium text-gray-800 dark:text-gray-100 text-sm truncate">{{ store.players.find(p => p.id === id)?.name || id }}</span>
                </div>
                <div class="flex gap-1 flex-shrink-0">
                  <button v-if="idx > 0" @click="movePlayerUp(idx)" class="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
                  </button>
                  <button v-if="idx < flatPositions.length - 1" @click="movePlayerDown(idx)" class="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ SPIELE ════════════════════════════════════════════════ -->
      <div v-if="activeTab === 'matches'">
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 mb-4">
          <div class="flex gap-2 mb-3">
            <button @click="matchTypeFilter.singles = !matchTypeFilter.singles"
              class="flex-1 px-3 py-2 rounded-lg border-2 transition-colors text-xs sm:text-sm font-medium"
              :class="matchTypeFilter.singles ? 'bg-yellow-100 border-yellow-400 text-yellow-800 dark:bg-yellow-900/30' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700'">
              Einzel
            </button>
            <button @click="matchTypeFilter.doubles = !matchTypeFilter.doubles"
              class="flex-1 px-3 py-2 rounded-lg border-2 transition-colors text-xs sm:text-sm font-medium"
              :class="matchTypeFilter.doubles ? 'bg-blue-100 border-blue-400 text-blue-800 dark:bg-blue-900/30' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700'">
              Doppel
            </button>
          </div>
          <div class="flex gap-1.5 mb-3">
            <button @click="matchStatusFilter.unconfirmed = !matchStatusFilter.unconfirmed"
              class="flex-1 px-2 py-1.5 rounded-lg border-2 text-xs font-medium transition-colors"
              :class="matchStatusFilter.unconfirmed ? 'bg-orange-100 border-orange-400 text-orange-800' : 'bg-white dark:bg-gray-800 border-gray-300 text-gray-600'">Offen</button>
            <button @click="matchStatusFilter.confirmed = !matchStatusFilter.confirmed"
              class="flex-1 px-2 py-1.5 rounded-lg border-2 text-xs font-medium transition-colors"
              :class="matchStatusFilter.confirmed ? 'bg-green-100 border-green-400 text-green-800' : 'bg-white dark:bg-gray-800 border-gray-300 text-gray-600'">Bestätigt</button>
            <button @click="matchStatusFilter.rejected = !matchStatusFilter.rejected"
              class="flex-1 px-2 py-1.5 rounded-lg border-2 text-xs font-medium transition-colors"
              :class="matchStatusFilter.rejected ? 'bg-red-100 border-red-400 text-red-800' : 'bg-white dark:bg-gray-800 border-gray-300 text-gray-600'">Abgelehnt</button>
          </div>
          <input v-model="matchSearch" type="text" placeholder="Spieler suchen..."
            class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg text-sm" />
        </div>
        <div v-if="filteredAdminMatches.length === 0" class="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p class="text-gray-500 text-sm">Keine Spiele gefunden</p>
        </div>
        <div v-else class="space-y-2">
          <div v-for="m in filteredAdminMatches" :key="m.id" class="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
            <MatchCard :match="m" context="admin" />
            <div class="flex gap-2 p-2 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
              <button v-if="(m.status || 'confirmed') !== 'confirmed'" @click="updateMatchStatus(m.id, m.type, 'confirmed')"
                class="flex-1 px-2 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700">Bestätigen</button>
              <button v-if="(m.status || 'confirmed') !== 'unconfirmed'" @click="updateMatchStatus(m.id, m.type, 'unconfirmed')"
                class="flex-1 px-2 py-1.5 bg-yellow-500 text-white rounded text-xs font-medium hover:bg-yellow-600">Offen</button>
              <button v-if="(m.status || 'confirmed') !== 'rejected'" @click="updateMatchStatus(m.id, m.type, 'rejected')"
                class="flex-1 px-2 py-1.5 bg-orange-600 text-white rounded text-xs font-medium hover:bg-orange-700">Ablehnen</button>
              <button @click="deleteMatch(m.id, m.type)"
                class="px-2 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700">Löschen</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ NEWS ══════════════════════════════════════════════════ -->
      <div v-if="activeTab === 'announcements'" class="space-y-6">
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-gray-600">
          <h3 class="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">Neue Ankündigung</h3>
          <textarea v-model="announcementText" rows="3" placeholder="Text... Links: [Linktext](seite)"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg text-sm resize-none"></textarea>
          <div class="mt-2 mb-3 p-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 rounded-lg text-xs text-blue-700 dark:text-blue-300">
            Links: <code class="bg-blue-100 dark:bg-blue-800 px-1 rounded">[Text](seite)</code> — Seiten: home, singles, doubles, challenges, statistics, matches, players
          </div>
          <button @click="addAnnouncement" class="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-sm">Speichern</button>
        </div>
        <div>
          <h3 class="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">Alle Ankündigungen</h3>
          <p v-if="store.announcements.length === 0" class="text-gray-400 text-sm">Noch keine Ankündigungen</p>
          <div v-else class="space-y-3">
            <div v-for="a in store.announcements" :key="a.id"
              class="flex items-start gap-3 p-4 rounded-lg border"
              :class="a.active ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'">
              <div class="flex-1 min-w-0">
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full" :class="a.active ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'">
                  {{ a.active ? 'Aktiv' : 'Inaktiv' }}
                </span>
                <p class="text-sm text-gray-700 dark:text-gray-300 mt-1 break-words">{{ a.text }}</p>
              </div>
              <div class="flex flex-col gap-2 flex-shrink-0">
                <button @click="toggleAnnouncement(a.id, a.active)"
                  class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors"
                  :class="a.active ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-indigo-600 text-white hover:bg-indigo-700'">
                  {{ a.active ? 'Deaktivieren' : 'Aktivieren' }}
                </button>
                <button @click="deleteAnnouncement(a.id)" class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-100 text-red-700 hover:bg-red-200">Löschen</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ SAISON ════════════════════════════════════════════════ -->
      <div v-if="activeTab === 'season'" class="space-y-6">
        <div class="bg-white dark:bg-gray-700 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-600">
          <h3 class="text-base sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">Aktive Saison</h3>
          <select @change="changeActiveSeason($event.target.value)"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg text-sm">
            <option v-if="store.seasons.length === 0" :value="store.activeSeason">{{ store.activeSeason }}</option>
            <option v-for="s in [...store.seasons].sort((a,b)=>b.year-a.year)" :key="s.year" :value="s.year" :selected="s.year === store.activeSeason">
              {{ s.label || 'Saison ' + s.year }}
            </option>
          </select>
          <span v-if="store.activeSeason === currentYear" class="ml-3 text-sm text-gray-500">(aktuelles Jahr)</span>
        </div>

        <div class="bg-white dark:bg-gray-700 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-600">
          <h3 class="text-base sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Neue Saison anlegen</h3>
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jahr</label>
              <input v-model="newSeasonYear" type="number" min="2020" max="2099" class="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg text-sm w-32" />
            </div>
            <div class="bg-gray-50 dark:bg-gray-600 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-500 space-y-2">
              <label class="flex items-center gap-3 cursor-pointer">
                <input v-model="copyPlayers" type="checkbox" class="w-4 h-4 text-indigo-600 rounded" />
                <span class="text-sm font-medium text-gray-700 dark:text-gray-200">Spieler aus Vorsaison übernehmen</span>
              </label>
              <div v-if="copyPlayers" class="ml-7">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input v-model="copyPlayerSettings" type="checkbox" class="w-4 h-4 text-indigo-600 rounded" />
                  <span class="text-sm text-gray-600 dark:text-gray-300">Einzel-Gruppe &amp; Doppel-Pool übernehmen</span>
                </label>
              </div>
            </div>
            <div class="bg-gray-50 dark:bg-gray-600 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-500">
              <label class="flex items-center gap-3 cursor-pointer">
                <input v-model="newSeasonArchiveVisible" type="checkbox" class="w-4 h-4 text-indigo-600 rounded" />
                <span class="text-sm font-medium text-gray-700 dark:text-gray-200">Im Archiv anzeigen</span>
              </label>
            </div>
            <button @click="createNewSeason" class="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">Saison anlegen</button>
          </div>
        </div>

        <div v-if="store.seasons.length > 0" class="bg-white dark:bg-gray-700 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-600">
          <h3 class="text-base sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">Bestehende Saisons</h3>
          <div class="space-y-3">
            <div v-for="s in [...store.seasons].sort((a,b)=>b.year-a.year)" :key="s.year"
              class="flex items-center justify-between p-4 rounded-lg border"
              :class="s.year === store.activeSeason ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-600'">
              <div class="flex items-center gap-3">
                <span class="text-base font-bold" :class="s.year === store.activeSeason ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-800 dark:text-gray-100'">
                  {{ s.label || 'Saison ' + s.year }}
                </span>
                <span v-if="s.year === store.activeSeason" class="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">aktiv</span>
              </div>
              <label class="flex items-center gap-2 cursor-pointer">
                <input :checked="s.archiveVisible !== false" @change="updateArchiveVisibility(s.year, $event.target.checked)" type="checkbox" class="w-4 h-4 text-indigo-600 rounded" />
                <span class="text-xs text-gray-500 dark:text-gray-400">Archiv</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ EINSTELLUNGEN ═════════════════════════════════════════ -->
      <div v-if="activeTab === 'settings'" class="space-y-6">
        <!-- Match Status -->
        <div class="bg-white dark:bg-gray-700 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-600">
          <h3 class="text-base sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Status-Einstellungen</h3>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div v-for="([group, label]) in [['singles','Einzel-Spiele'],['doubles','Doppel-Spiele']]" :key="group"
              class="bg-gray-50 dark:bg-gray-600 rounded-lg p-4 border border-gray-200 dark:border-gray-500">
              <h4 class="text-base font-bold text-gray-800 dark:text-gray-100 text-center mb-4">{{ label }}</h4>
              <div v-for="([role, roleLabel]) in [['Admin','Admin-eingetragene Spiele'],['User','Nutzer-eingetragene Spiele']]" :key="role" class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ roleLabel }}</label>
                <div class="space-y-1.5">
                  <label v-for="opt in (role==='Admin' ? ['confirmed','unconfirmed'] : ['confirmed','unconfirmed','rejected'])" :key="opt"
                    class="flex items-start p-2.5 rounded-lg border-2 cursor-pointer transition-all"
                    :class="settings[`${group}${role}Default`] === opt ? (opt==='confirmed'?'border-green-500 bg-green-50 dark:bg-green-900/20':opt==='unconfirmed'?'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20':'border-red-500 bg-red-50 dark:bg-red-900/20') : 'bg-white dark:bg-gray-700 border-gray-200'">
                    <input type="radio" :name="`${group}${role}Status`" :value="opt"
                      :checked="settings[`${group}${role}Default`] === opt"
                      @change="saveMatchStatusSettings(`${group}${role}Default`, opt)"
                      class="mt-0.5 h-4 w-4" />
                    <span class="ml-2 font-semibold text-gray-800 dark:text-gray-100 text-sm capitalize">{{ opt === 'confirmed' ? 'Bestätigt' : opt === 'unconfirmed' ? 'Unbestätigt' : 'Abgelehnt' }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Validation modes -->
        <div class="bg-white dark:bg-gray-700 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-600">
          <h3 class="text-base sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Herausforderungs-Validierung</h3>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div v-for="([type, label]) in [['singles','Einzel'],['doubles','Doppel']]" :key="type"
              class="bg-gray-50 dark:bg-gray-600 rounded-lg p-4 border border-gray-200 dark:border-gray-500">
              <h4 class="text-base font-bold text-gray-800 dark:text-gray-100 text-center mb-3">{{ label }}</h4>
              <div class="space-y-2">
                <label v-for="([val, valLabel]) in [['allow','Erlauben'],['warn','Warnen'],['block','Blockieren'],['admin_only','Nur Admins']]" :key="val"
                  class="flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all"
                  :class="(type==='singles'?singlesValMode:doublesValMode) === val ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-700 border-gray-200'">
                  <input type="radio" :name="`${type}ValMode`" :value="val"
                    :checked="(type==='singles'?singlesValMode:doublesValMode) === val"
                    @change="saveValidationMode(type, val)" class="mt-0.5 h-4 w-4" />
                  <span class="ml-2 font-semibold text-gray-800 dark:text-gray-100 text-sm">{{ valLabel }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Display settings -->
        <div class="bg-white dark:bg-gray-700 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-600">
          <h3 class="text-base sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">Anzeige unbestätigter Spiele</h3>
          <div class="space-y-3">
            <label v-for="([key, label]) in [['showUnconfirmedSingles','Unbestätigte Einzel-Spiele anzeigen'],['showUnconfirmedDoubles','Unbestätigte Doppel-Spiele anzeigen']]" :key="key"
              class="flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all"
              :class="displaySettings[key] ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'bg-gray-50 dark:bg-gray-600 border-gray-200'">
              <input type="checkbox" :checked="displaySettings[key]" @change="saveDisplaySetting(key, $event.target.checked)"
                class="h-4 w-4 text-indigo-600 rounded" />
              <span class="ml-3 font-semibold text-gray-800 dark:text-gray-100 text-sm">{{ label }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- ══ EXPORT ════════════════════════════════════════════════ -->
      <div v-if="activeTab === 'export'">
        <div class="bg-gray-50 dark:bg-gray-700 p-4 sm:p-6 rounded-lg">
          <p class="text-gray-600 dark:text-gray-300 mb-4 text-sm">Wähle die Daten für den Excel-Export aus.</p>
          <div class="mb-5 pb-4 border-b border-gray-300 dark:border-gray-600">
            <label class="flex items-center gap-3 cursor-pointer">
              <input v-model="selectAll" type="checkbox" @change="toggleAll" class="w-5 h-5 text-indigo-600 rounded" />
              <span class="text-base font-semibold text-gray-800 dark:text-gray-100">Alle auswählen</span>
            </label>
          </div>
          <div class="space-y-2 mb-6">
            <label v-for="([key, label]) in [
              ['singlesGroup','Einzel Gruppentabellen'],
              ['singlesKnockout','Einzel K.O.-Phase'],
              ['doublesPyramid','Doppel-Rangfolge'],
              ['singlesMatches','Einzel-Spiele'],
              ['doublesMatches','Doppel-Spiele'],
              ['playerStats','Spielerstatistiken'],
              ['settings','App-Einstellungen'],
            ]" :key="key" class="flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 p-2 rounded">
              <input v-model="exportOptions[key]" type="checkbox" class="w-4 h-4 text-indigo-600 rounded" />
              <span class="text-gray-700 dark:text-gray-200 text-sm">{{ label }}</span>
            </label>
          </div>
          <div class="flex justify-end">
            <button @click="performExport" class="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-md">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              Excel-Datei herunterladen
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
