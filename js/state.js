// js/state.js
// Zentrales State Management

const state = {
  currentPage: "home",
  user: null,
  isAdmin: false,
  players: [],
  singlesMatches: [],
  doublesMatches: [],
  knockoutMatches: [],
  pyramid: { levels: [] },
  pyramidLoading: false,
  pyramidInitialized: false,
  challenges: [],
  editingPlayer: null,
  selectedPlayerId: null,
  prefilledDoubles: null,
  adminTab: "players",
  singlesSearchQuery: "",
  doublesSearchQuery: "",
  challengesSinglesSearchQuery: "",
  mobileMenuOpen: false,
  singlesPhase: "group",
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
  singlesView: "group",
  knockoutEntryMatch: null,
  matchesView: "singles",
  challengesView: "singles",
  matchEntry: {
    set1P1: "",
    set1P2: "",
    set2P1: "",
    set2P2: "",
    set3P1: "",
    set3P2: "",
    set3Disabled: true,
  },
  // Neue Felder für Match-Status-Verwaltung
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
  // Neue Filter für MatchesPage
  matchTypeFilters: {
    showSingles: true,
    showDoubles: true,
  },
  matchesSearchQuery: "",
  // Filter für Admin Match Approval
  adminMatchTypeFilters: {
    showSingles: true,
    showDoubles: true,
  },
  adminMatchesSearchQuery: "",
  
  // *** NEU: Doubles Pool Visualisierung ***
  doublesPoolVisualization: false, // Toggle für Pool-Farbcodierung
  
  // *** NEU: Challenge-Validierungsmodus ***
  doublesValidationMode: 'allow', // 'allow' | 'warn' | 'block'
};