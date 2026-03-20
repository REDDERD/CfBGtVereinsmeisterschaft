// js/events/navigation.js
// Navigation und View-Steuerung

function navigateTo(page) {
  state.currentPage = page;
  state.selectedPlayerId = null;
  state.prefilledDoubles = null;
  state.mobileMenuOpen = false;
  state.mobileMoreOpen = false;
  
  // Beim Navigieren zur Singles-Seite: Wenn K.O.-Phase aktiv ist, zeige K.O.-Phase
  if (page === "singles" && state.knockoutPhaseActive) {
    state.singlesView = "knockout";
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
