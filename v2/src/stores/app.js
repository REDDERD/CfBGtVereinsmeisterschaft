import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    activeSeason: null,
    liveActiveSeason: null,
    seasons: [],
    archiveMode: false,
    archiveYear: null,
    user: null,
    isAdmin: false,
    players: [],
    singlesMatches: [],
    doublesMatches: [],
    knockoutMatches: [],
    pyramid: { levels: [] },
    pyramidLoading: false,
    pyramidInitialized: false,
    matchesLoading: true,
    challenges: [],
    editingPlayer: null,
    selectedPlayerId: null,
    prefilledDoubles: null,
    adminTab: 'players',
    singlesSearchQuery: '',
    doublesSearchQuery: '',
    challengesSinglesSearchQuery: '',
    mobileMoreOpen: false,
    singlesPhase: 'group',
    knockoutPhaseActive: false,
    knockoutBracket: {
      round16: [],
      quarter: [],
      semi: [],
      thirdPlace: {},
      final: {},
    },
    knockoutConfig: {},
    frozenStandings: null,
    singlesView: 'group',
    knockoutEntryMatch: null,
    matchesView: 'singles',
    challengesView: 'singles',
    statisticsView: 'singles',
    matchEntry: {
      set1P1: '', set1P2: '',
      set2P1: '', set2P2: '',
      set3P1: '', set3P2: '',
      set3Disabled: true,
    },
    matchStatusSettings: {
      singlesAdminDefault: 'confirmed',
      singlesUserDefault: 'unconfirmed',
      doublesAdminDefault: 'confirmed',
      doublesUserDefault: 'unconfirmed',
    },
    matchApprovalFilters: {
      showUnconfirmed: true,
      showConfirmed: false,
      showRejected: false,
    },
    matchTypeFilters: {
      showSingles: true,
      showDoubles: true,
    },
    matchesSearchQuery: '',
    adminMatchTypeFilters: {
      showSingles: true,
      showDoubles: true,
    },
    adminMatchesSearchQuery: '',
    doublesPoolVisualization: false,
    doublesValidationMode: 'allow',
    singlesValidationMode: 'allow',
    matchesDisplaySettings: {
      showUnconfirmedSingles: false,
      showUnconfirmedDoubles: false,
    },
    manualDoublesOrderExpanded: false,
    announcements: [],
    darkMode: false,
  }),

  getters: {
    hasArchiveSeasons: (state) =>
      state.seasons.some(s => s.archiveVisible !== false && s.year !== state.liveActiveSeason),
  },

  actions: {
    toggleDarkMode() {
      this.darkMode = !this.darkMode
      if (this.darkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      localStorage.setItem('darkMode', this.darkMode)
    },

    initDarkMode() {
      const saved = localStorage.getItem('darkMode')
      if (saved === 'true') {
        this.darkMode = true
        document.documentElement.classList.add('dark')
      }
    },
  },
})
