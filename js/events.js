// js/events.js
// Event Handler und Navigation

function navigateTo(page) {
  state.currentPage = page;
  state.selectedPlayerId = null;
  state.prefilledDoubles = null;
  state.mobileMenuOpen = false;
  
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

function setAdminTab(tab) {
  state.adminTab = tab;
  render();
}

function cancelEdit() {
  state.editingPlayer = null;
  render();
}

async function handleLogin() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const errorDiv = document.getElementById("loginError");

  try {
    await auth.signInWithEmailAndPassword(email, password);
    state.currentPage = "admin";
  } catch (error) {
    errorDiv.textContent = "Login fehlgeschlagen: " + error.message;
    errorDiv.classList.remove("hidden");
  }
}

async function handleLogout() {
  await auth.signOut();
  state.currentPage = "home";
}

function updateSinglesSearch(query) {
  state.singlesSearchQuery = query;
  const activeElement = document.activeElement;
  const isSearchInput = activeElement && activeElement.id === "singlesSearchInput";
  render();
  if (isSearchInput) {
    setTimeout(() => {
      const input = document.getElementById("singlesSearchInput");
      if (input) {
        input.focus();
        input.setSelectionRange(query.length, query.length);
      }
    }, 0);
  }
}

function updateDoublesSearch(query) {
  state.doublesSearchQuery = query;
  const activeElement = document.activeElement;
  const isSearchInput = activeElement && activeElement.id === "doublesSearchInput";
  render();
  if (isSearchInput) {
    setTimeout(() => {
      const input = document.getElementById("doublesSearchInput");
      if (input) {
        input.focus();
        input.setSelectionRange(query.length, query.length);
      }
    }, 0);
  }
}