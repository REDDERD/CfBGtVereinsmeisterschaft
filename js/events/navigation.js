// js/events/navigation.js
// Navigation und View-Steuerung

// Herausforderungen sind nur sichtbar, solange noch etwas eingetragen werden kann:
// nicht im Archiv und nicht, wenn Einzel- und Doppel-K.O.-Phase beide aktiv sind
function isChallengesPageAvailable() {
  return !state.archiveMode && !(state.knockoutPhaseActive && state.doublesKnockoutPhaseActive);
}

function navigateTo(page) {
  // Im Archiv-Modus: Admin blockieren
  if (state.archiveMode && page === 'admin') {
    return;
  }
  if (page === 'challenges' && !isChallengesPageAvailable()) {
    return;
  }

  state.currentPage = page;
  state.selectedPlayerId = null;
  state.prefilledDoubles = null;
  state.mobileMenuOpen = false;
  state.mobileMoreOpen = false;

  // Beim Navigieren zur Singles-Seite: Wenn K.O.-Phase aktiv ist, zeige K.O.-Phase
  if (page === "singles" && state.knockoutPhaseActive) {
    state.singlesView = "knockout";
  }

  // Beim Navigieren zur Doppel-Seite: Wenn K.O.-Phase aktiv ist, zeige K.O.-Phase
  if (page === "doubles" && state.doublesKnockoutPhaseActive) {
    state.doublesView = "knockout";
  }

  // Im Archiv-Modus: Hash aktualisieren
  if (state.archiveMode) {
    updateArchiveHash(page);
  }

  render();
}

function viewPlayerProfile(playerId) {
  state.selectedPlayerId = playerId;
  state.currentPage = "playerProfile";
  render();
}

function toggleMobileMenu() {
  state.mobileMenuOpen = !state.mobileMenuOpen;
  render();
}

function toggleMobileMore() {
  state.mobileMoreOpen = !state.mobileMoreOpen;
  render();
}

function closeMobileMore() {
  state.mobileMoreOpen = false;
  render();
}

function setAdminTab(tab) {
  state.adminTab = tab;
  
  // Wenn auf "matchApproval" (Spiele) gewechselt wird, Filter zurücksetzen
  if (tab === 'matchApproval') {
    state.adminMatchTypeFilters.showSingles = true;
    state.adminMatchTypeFilters.showDoubles = true;
    state.matchApprovalFilters.showUnconfirmed = true;
    state.matchApprovalFilters.showConfirmed = false;
    state.matchApprovalFilters.showRejected = false;
    state.adminMatchesSearchQuery = "";
  }

  if (tab === 'stats') {
    loadUsageStats();
    return;
  }

  render();
}

function cancelEdit() {
  state.editingPlayer = null;
  render();
}

function setMatchesView(view) {
  state.matchesView = view;
  render();
}

function setChallengesView(view) {
  state.challengesView = view;
  render();
}

function setStatisticsView(view) {
  state.statisticsView = view;
  render();
}
