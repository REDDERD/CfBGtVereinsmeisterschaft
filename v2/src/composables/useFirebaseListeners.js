import { onMounted, onUnmounted } from 'vue'
import {
  collection, doc, query, orderBy, where,
  onSnapshot, getDoc
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { db, auth } from '@/firebase/index.js'
import { useAppStore } from '@/stores/app.js'
import { pyramidLevelsToArray } from '@/utils/pyramid.js'

export function useFirebaseListeners() {
  const store = useAppStore()
  const unsubscribers = []
  let seasonUnsubscribers = []
  let authUnsub = null

  function seasonCollection(name) {
    return collection(db, 'seasons', String(store.activeSeason), name)
  }
  function seasonDocRef(colName, docId) {
    return doc(db, 'seasons', String(store.activeSeason), colName, docId)
  }

  function initSeasonListeners() {
    seasonUnsubscribers.forEach(u => u())
    seasonUnsubscribers = []

    store.$patch({
      players: [],
      singlesMatches: [],
      doublesMatches: [],
      knockoutMatches: [],
      pyramid: { levels: [] },
      pyramidInitialized: false,
      matchesLoading: true,
      challenges: [],
    })

    let pyramidLoadTriggered = false

    seasonUnsubscribers.push(
      onSnapshot(query(seasonCollection('players'), orderBy('name')), (snap) => {
        store.players = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        if (!pyramidLoadTriggered && !store.archiveMode) {
          pyramidLoadTriggered = true
          loadPyramid()
        }
      })
    )

    seasonUnsubscribers.push(
      onSnapshot(query(seasonCollection('singlesMatches'), orderBy('date', 'desc')), (snap) => {
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        store.singlesMatches = all
        store.knockoutMatches = all.filter(m => m.round && m.round !== 'group1' && m.round !== 'group2')
        store.matchesLoading = false
      })
    )

    seasonUnsubscribers.push(
      onSnapshot(query(seasonCollection('doublesMatches'), orderBy('date', 'desc')), (snap) => {
        store.doublesMatches = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      })
    )

    seasonUnsubscribers.push(
      onSnapshot(seasonDocRef('pyramid', 'current'), (snap) => {
        if (!store.pyramidLoading) {
          if (snap.exists()) {
            store.pyramid = { levels: pyramidLevelsToArray(snap.data()) }
            store.pyramidInitialized = true
          } else {
            store.pyramidInitialized = false
          }
        }
      })
    )

    seasonUnsubscribers.push(
      onSnapshot(
        query(seasonCollection('challenges'), where('status', '==', 'pending')),
        (snap) => {
          store.challenges = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        }
      )
    )
  }

  async function loadPyramid() {
    if (store.archiveMode) return
    try {
      store.pyramidLoading = true
      const snap = await getDoc(seasonDocRef('pyramid', 'current'))
      if (snap.exists()) {
        store.pyramid = { levels: pyramidLevelsToArray(snap.data()) }
        store.pyramidInitialized = true
      }
    } catch (e) {
      console.error('loadPyramid error', e)
    } finally {
      store.pyramidLoading = false
    }
  }

  function init() {
    authUnsub = onAuthStateChanged(auth, async (user) => {
      store.user = user
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          store.isAdmin = userDoc.exists() ? (userDoc.data().isAdmin || false) : false
        } catch {
          store.isAdmin = false
        }
      } else {
        store.isAdmin = false
      }
    })

    unsubscribers.push(
      onSnapshot(doc(db, 'settings', 'activeSeason'), (snap) => {
        const year = snap.exists() ? snap.data().year : new Date().getFullYear()
        store.liveActiveSeason = year
        if (!store.archiveMode) {
          const prev = store.activeSeason
          store.activeSeason = year
          if (prev !== year) initSeasonListeners()
        }
      })
    )

    unsubscribers.push(
      onSnapshot(collection(db, 'seasons'), (snap) => {
        store.seasons = snap.docs.map(d => ({ year: parseInt(d.id), ...d.data() }))
      })
    )

    unsubscribers.push(
      onSnapshot(doc(db, 'settings', 'knockout'), (snap) => {
        if (snap.exists()) {
          store.knockoutPhaseActive = snap.data().active || false
          store.frozenStandings = snap.data().frozenStandings || null
        }
      })
    )

    unsubscribers.push(
      onSnapshot(doc(db, 'settings', 'knockoutConfig'), (snap) => {
        if (snap.exists()) store.knockoutConfig = snap.data()
      })
    )

    unsubscribers.push(
      onSnapshot(doc(db, 'settings', 'defaultMatchStatus'), (snap) => {
        store.matchStatusSettings = snap.exists() ? snap.data() : {
          singlesAdminDefault: 'confirmed', singlesUserDefault: 'unconfirmed',
          doublesAdminDefault: 'confirmed', doublesUserDefault: 'unconfirmed',
        }
      })
    )

    unsubscribers.push(
      onSnapshot(doc(db, 'settings', 'matchesDisplay'), (snap) => {
        store.matchesDisplaySettings = snap.exists() ? snap.data() : {
          showUnconfirmedSingles: false, showUnconfirmedDoubles: false,
        }
      })
    )

    unsubscribers.push(
      onSnapshot(doc(db, 'settings', 'doublesValidation'), (snap) => {
        store.doublesValidationMode = snap.exists() ? (snap.data().mode || 'allow') : 'allow'
      })
    )

    unsubscribers.push(
      onSnapshot(doc(db, 'settings', 'singlesValidation'), (snap) => {
        store.singlesValidationMode = snap.exists() ? (snap.data().mode || 'allow') : 'allow'
      })
    )

    unsubscribers.push(
      onSnapshot(
        query(collection(db, 'announcements'), orderBy('createdAt', 'desc')),
        (snap) => {
          store.announcements = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        }
      )
    )
  }

  onMounted(init)
  onUnmounted(() => {
    if (authUnsub) authUnsub()
    unsubscribers.forEach(u => u())
    seasonUnsubscribers.forEach(u => u())
  })
}
