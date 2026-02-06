// js/events/search-filters.js
// Such- und Filter-Funktionen (modularisiert)

// Generische Such-Funktion mit Fokus-Erhalt
function _updateSearchWithFocus(stateKey, inputId, query) {
  state[stateKey] = query;
  const activeElement = document.activeElement;
  const isSearchInput = activeElement && activeElement.id === inputId;
  render();
  if (isSearchInput) {
    setTimeout(() => {
      const input = document.getElementById(inputId);
      if (input) {
        input.focus();
        input.setSelectionRange(query.length, query.length);
      }
    }, 0);
  }
}

// ========== Suchfelder ==========

function updateSinglesSearch(query) {
  _updateSearchWithFocus("singlesSearchQuery", "singlesSearchInput", query);
}

function updateDoublesSearch(query) {
  _updateSearchWithFocus("doublesSearchQuery", "doublesSearchInput", query);
}

function updateChallengesSinglesSearch(query) {
  _updateSearchWithFocus("challengesSinglesSearchQuery", "challengesSinglesSearchInput", query);
}

function updateMatchesSearch(query) {
  state.matchesSearchQuery = query;
  render();
}

function updateAdminMatchesSearch(query) {
  state.adminMatchesSearchQuery = query;
  render();
  
  setTimeout(() => {
    const searchInput = document.getElementById('adminMatchesSearchInput');
    if (searchInput) searchInput.focus();
  }, 0);
}

// ========== Spieltyp-Filter (MatchesPage) ==========

function toggleMatchTypeFilter(type) {
  if (type === 'singles') {
    state.matchTypeFilters.showSingles = !state.matchTypeFilters.showSingles;
  } else if (type === 'doubles') {
    state.matchTypeFilters.showDoubles = !state.matchTypeFilters.showDoubles;
  }
  render();
}

// ========== Admin Spieltyp-Filter ==========

function toggleAdminMatchTypeFilter(type) {
  if (type === 'singles') {
    state.adminMatchTypeFilters.showSingles = !state.adminMatchTypeFilters.showSingles;
  } else if (type === 'doubles') {
    state.adminMatchTypeFilters.showDoubles = !state.adminMatchTypeFilters.showDoubles;
  }
  render();
  
  setTimeout(() => {
    const searchInput = document.getElementById('adminMatchesSearchInput');
    if (searchInput) searchInput.focus();
  }, 0);
}

// ========== Match-Status-Filter (AdminPage) ==========

function toggleMatchStatusFilter(status) {
  switch(status) {
    case 'unconfirmed':
      state.matchApprovalFilters.showUnconfirmed = !state.matchApprovalFilters.showUnconfirmed;
      break;
    case 'confirmed':
      state.matchApprovalFilters.showConfirmed = !state.matchApprovalFilters.showConfirmed;
      break;
    case 'rejected':
      state.matchApprovalFilters.showRejected = !state.matchApprovalFilters.showRejected;
      break;
  }
  render();
}
