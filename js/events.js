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

// ========== Login & Authentication ==========

async function handleLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const errorDiv = document.getElementById("loginError");
  const errorText = document.getElementById("loginErrorText");
  const successDiv = document.getElementById("loginSuccess");
  const successText = document.getElementById("loginSuccessText");
  const loginButton = document.getElementById("loginButton");

  // Validierung
  if (!email || !password) {
    errorText.textContent = "Bitte fülle alle Felder aus.";
    errorDiv.classList.remove("hidden");
    successDiv.classList.add("hidden");
    return;
  }

  // Button deaktivieren während des Logins
  loginButton.disabled = true;
  loginButton.innerHTML = `
    <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    Anmelden...
  `;

  try {
    await auth.signInWithEmailAndPassword(email, password);
    
    // Erfolg anzeigen
    successText.textContent = "Login erfolgreich! Willkommen zurück.";
    successDiv.classList.remove("hidden");
    errorDiv.classList.add("hidden");
    
    // "Angemeldet bleiben" Feature
    const rememberMe = document.getElementById("rememberMe");
    if (rememberMe && rememberMe.checked) {
      auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    }
    
    // Kurz warten bevor Weiterleitung
    setTimeout(() => {
      state.currentPage = "admin";
      render();
    }, 500);
    
  } catch (error) {
    // Fehler-Handling mit benutzerfreundlichen Nachrichten
    let errorMessage = "Login fehlgeschlagen. ";
    
    switch (error.code) {
      case "auth/invalid-email":
        errorMessage += "Ungültige E-Mail-Adresse.";
        break;
      case "auth/user-disabled":
        errorMessage += "Dieser Account wurde deaktiviert.";
        break;
      case "auth/user-not-found":
        errorMessage += "Kein Account mit dieser E-Mail gefunden.";
        break;
      case "auth/wrong-password":
        errorMessage += "Falsches Passwort.";
        break;
      case "auth/too-many-requests":
        errorMessage += "Zu viele Loginversuche. Bitte versuche es später erneut.";
        break;
      case "auth/network-request-failed":
        errorMessage += "Netzwerkfehler. Überprüfe deine Internetverbindung.";
        break;
      default:
        errorMessage += error.message;
    }
    
    errorText.textContent = errorMessage;
    errorDiv.classList.remove("hidden");
    successDiv.classList.add("hidden");
    
    // Button wieder aktivieren
    loginButton.disabled = false;
    loginButton.innerHTML = `
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
      </svg>
      Anmelden
    `;
  }
}

async function handleLogout() {
  try {
    await auth.signOut();
    state.currentPage = "home";
    render();
  } catch (error) {
    console.error("Logout-Fehler:", error);
    alert("Logout fehlgeschlagen. Bitte versuche es erneut.");
  }
}


// ========== QR Code Login ==========

async function checkQrCodeLogin() {
  // Parse URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get('email');
  const password = urlParams.get('password');
  
  // If no parameters, do nothing
  if (!email || !password) {
    return;
  }
  
  try {
    // Try to login with provided credentials
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Check if user has QR login permission
    const userDoc = await db.collection('users').doc(user.uid).get();
    
    if (!userDoc.exists) {
      // User document doesn't exist - logout
      await auth.signOut();
      Toast.error('QR-Code-Login fehlgeschlagen: Keine Berechtigung', 'error');
      // Remove URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }
    
    const userData = userDoc.data();
    
    if (!userData.isQrLogin) {
      // User doesn't have QR login permission - logout
      await auth.signOut();
      Toast.error('QR-Code-Login fehlgeschlagen: Keine Berechtigung', 'error');
      // Remove URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }
    
    // Login successful and authorized
    Toast.error('QR-Code-Login erfolgreich', 'success');
    
    // Remove URL parameters from address bar for security
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // Navigate to home page
    state.currentPage = 'home';
    render();
    
  } catch (error) {
    console.error('QR-Code-Login error:', error);
    Toast.error('QR-Code-Login fehlgeschlagen: ' + error.message, 'error');
    
    // Remove URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

// ========== Password Reset ==========

function showPasswordReset() {
  const modal = document.getElementById("passwordResetModal");
  if (modal) {
    modal.classList.remove("hidden");
    
    // Auto-Fill Email wenn vorhanden
    const loginEmail = document.getElementById("loginEmail");
    const resetEmail = document.getElementById("resetEmail");
    if (loginEmail && resetEmail && loginEmail.value) {
      resetEmail.value = loginEmail.value;
    }
    
    // Focus auf Email-Feld
    setTimeout(() => {
      const resetEmailInput = document.getElementById("resetEmail");
      if (resetEmailInput) resetEmailInput.focus();
    }, 100);
  }
}

function hidePasswordReset() {
  const modal = document.getElementById("passwordResetModal");
  if (modal) {
    modal.classList.add("hidden");
    
    // Fehlermeldungen zurücksetzen
    const errorDiv = document.getElementById("resetError");
    const successDiv = document.getElementById("resetSuccess");
    if (errorDiv) errorDiv.classList.add("hidden");
    if (successDiv) successDiv.classList.add("hidden");
  }
}

async function handlePasswordReset() {
  const email = document.getElementById("resetEmail").value.trim();
  const errorDiv = document.getElementById("resetError");
  const errorText = document.getElementById("resetErrorText");
  const successDiv = document.getElementById("resetSuccess");
  const successText = document.getElementById("resetSuccessText");
  const resetButton = document.getElementById("resetButton");

  // Validierung
  if (!email) {
    errorText.textContent = "Bitte gib eine E-Mail-Adresse ein.";
    errorDiv.classList.remove("hidden");
    successDiv.classList.add("hidden");
    return;
  }

  // Email-Format prüfen
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errorText.textContent = "Bitte gib eine gültige E-Mail-Adresse ein.";
    errorDiv.classList.remove("hidden");
    successDiv.classList.add("hidden");
    return;
  }

  // Button deaktivieren während der Anfrage
  resetButton.disabled = true;
  resetButton.textContent = "Sende...";

  try {
    await auth.sendPasswordResetEmail(email);
    
    // Erfolg anzeigen
    successText.textContent = "✅ Password-Reset-Link wurde an " + email + " gesendet. Überprüfe dein Postfach (auch den Spam-Ordner).";
    successDiv.classList.remove("hidden");
    errorDiv.classList.add("hidden");
    
    // Button zurücksetzen
    resetButton.disabled = false;
    resetButton.textContent = "Link senden";
    
    // Nach 3 Sekunden Modal schließen
    setTimeout(() => {
      hidePasswordReset();
    }, 3000);
    
  } catch (error) {
    // Fehler-Handling
    let errorMessage = "Fehler beim Senden des Reset-Links. ";
    
    switch (error.code) {
      case "auth/invalid-email":
        errorMessage = "Ungültige E-Mail-Adresse.";
        break;
      case "auth/user-not-found":
        errorMessage = "Kein Account mit dieser E-Mail gefunden.";
        break;
      case "auth/too-many-requests":
        errorMessage = "Zu viele Anfragen. Bitte versuche es später erneut.";
        break;
      case "auth/network-request-failed":
        errorMessage = "Netzwerkfehler. Überprüfe deine Internetverbindung.";
        break;
      default:
        errorMessage += error.message;
    }
    
    errorText.textContent = errorMessage;
    errorDiv.classList.remove("hidden");
    successDiv.classList.add("hidden");
    
    // Button wieder aktivieren
    resetButton.disabled = false;
    resetButton.textContent = "Link senden";
  }
}

// ========== Password Visibility Toggle ==========

function togglePasswordVisibility(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  
  if (!input) return;
  
  if (input.type === "password") {
    input.type = "text";
    if (icon) {
      icon.innerHTML = `
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
      `;
    }
  } else {
    input.type = "password";
    if (icon) {
      icon.innerHTML = `
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
      `;
    }
  }
}

// ========== Bestehende Funktionen (unverändert) ==========

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

function updateChallengesSinglesSearch(query) {
  state.challengesSinglesSearchQuery = query;
  const activeElement = document.activeElement;
  const isSearchInput = activeElement && activeElement.id === "challengesSinglesSearchInput";
  render();
  if (isSearchInput) {
    setTimeout(() => {
      const input = document.getElementById("challengesSinglesSearchInput");
      if (input) {
        input.focus();
        input.setSelectionRange(query.length, query.length);
      }
    }, 0);
  }
}

function setMatchesView(view) {
  state.matchesView = view;
  render();
}

function setChallengesView(view) {
  state.challengesView = view;
  render();
}

// ========== Singles Challenge Match Entry ==========

function openSinglesMatchEntryForChallenge(player1Id, player2Id) {
  // Öffne ein Modal zum Eintragen des Spielergebnisses
  const player1 = state.players.find(p => p.id === player1Id);
  const player2 = state.players.find(p => p.id === player2Id);
  
  if (!player1 || !player2) {
    Toast.error("Spieler nicht gefunden");
    return;
  }

  const modalContent = `
    <div class="space-y-4">
      <h3 class="text-xl font-bold text-gray-800">${player1.name} vs ${player2.name}</h3>
      
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Satz 1</label>
          <div class="grid grid-cols-2 gap-2">
            <input type="number" id="challengeSet1P1" min="0" max="21" 
              placeholder="${player1.name}" 
              onchange="updateChallengeMatchEntry('set1P1', this.value)"
              class="px-3 py-2 border rounded-lg">
            <input type="number" id="challengeSet1P2" min="0" max="21" 
              placeholder="${player2.name}" 
              onchange="updateChallengeMatchEntry('set1P2', this.value)"
              class="px-3 py-2 border rounded-lg">
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Satz 2</label>
          <div class="grid grid-cols-2 gap-2">
            <input type="number" id="challengeSet2P1" min="0" max="21" 
              placeholder="${player1.name}" 
              onchange="updateChallengeMatchEntry('set2P1', this.value)"
              class="px-3 py-2 border rounded-lg">
            <input type="number" id="challengeSet2P2" min="0" max="21" 
              placeholder="${player2.name}" 
              onchange="updateChallengeMatchEntry('set2P2', this.value)"
              class="px-3 py-2 border rounded-lg">
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Satz 3 (falls nötig)</label>
          <div class="grid grid-cols-2 gap-2">
            <input type="number" id="challengeSet3P1" min="0" max="21" 
              placeholder="${player1.name}" 
              onchange="updateChallengeMatchEntry('set3P1', this.value)"
              class="px-3 py-2 border rounded-lg">
            <input type="number" id="challengeSet3P2" min="0" max="21" 
              placeholder="${player2.name}" 
              onchange="updateChallengeMatchEntry('set3P2', this.value)"
              class="px-3 py-2 border rounded-lg">
          </div>
        </div>
      </div>
      
      <div class="flex justify-end space-x-3 pt-4">
        <button onclick="Modal.close()" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
          Abbrechen
        </button>
        <button onclick="submitChallengeMatch('${player1Id}', '${player2Id}')" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          Spiel eintragen
        </button>
      </div>
    </div>
  `;
  
  Modal.open(modalContent);
  
  // Initialize challenge match entry state
  if (!state.challengeMatchEntry) {
    state.challengeMatchEntry = {
      set1P1: "",
      set1P2: "",
      set2P1: "",
      set2P2: "",
      set3P1: "",
      set3P2: "",
      set3Disabled: false
    };
  }
}

function updateChallengeMatchEntry(field, value) {
  if (!state.challengeMatchEntry) {
    state.challengeMatchEntry = {
      set1P1: "",
      set1P2: "",
      set2P1: "",
      set2P2: "",
      set3P1: "",
      set3P2: "",
      set3Disabled: false
    };
  }
  
  state.challengeMatchEntry[field] = value;

  // Check if third set should be disabled
  const s1p1 = parseInt(state.challengeMatchEntry.set1P1);
  const s1p2 = parseInt(state.challengeMatchEntry.set1P2);
  const s2p1 = parseInt(state.challengeMatchEntry.set2P1);
  const s2p2 = parseInt(state.challengeMatchEntry.set2P2);

  if (!isNaN(s1p1) && !isNaN(s1p2) && !isNaN(s2p1) && !isNaN(s2p2)) {
    const set1Winner = s1p1 > s1p2 ? "p1" : "p2";
    const set2Winner = s2p1 > s2p2 ? "p1" : "p2";

    // Disable set 3 if someone won 2:0
    if (set1Winner === set2Winner) {
      state.challengeMatchEntry.set3Disabled = true;
    } else {
      state.challengeMatchEntry.set3Disabled = false;
    }
  }

  // Update disabled state
  const set3P1Input = document.getElementById("challengeSet3P1");
  const set3P2Input = document.getElementById("challengeSet3P2");
  if (set3P1Input && set3P2Input) {
    if (state.challengeMatchEntry.set3Disabled) {
      set3P1Input.disabled = true;
      set3P2Input.disabled = true;
      set3P1Input.value = "";
      set3P2Input.value = "";
      set3P1Input.classList.add("bg-gray-200");
      set3P2Input.classList.add("bg-gray-200");
    } else {
      set3P1Input.disabled = false;
      set3P2Input.disabled = false;
      set3P1Input.classList.remove("bg-gray-200");
      set3P2Input.classList.remove("bg-gray-200");
    }
  }
}

async function submitChallengeMatch(player1Id, player2Id) {
  const entry = state.challengeMatchEntry;
  
  const set1P1 = parseInt(entry.set1P1);
  const set1P2 = parseInt(entry.set1P2);
  const set2P1 = parseInt(entry.set2P1);
  const set2P2 = parseInt(entry.set2P2);
  const set3P1 = parseInt(entry.set3P1);
  const set3P2 = parseInt(entry.set3P2);

  if (isNaN(set1P1) || isNaN(set1P2) || isNaN(set2P1) || isNaN(set2P2)) {
    Toast.error("Bitte alle Sätze 1 und 2 ausfüllen");
    return;
  }

  if (!validateSet(set1P1, set1P2) || !validateSet(set2P1, set2P2)) {
    Toast.error("Ungültige Satz-Ergebnisse in Satz 1 oder 2");
    return;
  }

  const sets = [
    { p1: set1P1, p2: set1P2 },
    { p1: set2P1, p2: set2P2 },
  ];

  const set1Winner = set1P1 > set1P2 ? "p1" : "p2";
  const set2Winner = set2P1 > set2P2 ? "p1" : "p2";

  // Check if set 3 is needed
  if (set1Winner !== set2Winner) {
    if (!isNaN(set3P1) && !isNaN(set3P2)) {
      if (!validateSet(set3P1, set3P2)) {
        Toast.error("Ungültiges Satz-Ergebnis in Satz 3");
        return;
      }
      sets.push({ p1: set3P1, p2: set3P2 });
    } else {
      Toast.warning("Dritter Satz ist erforderlich (Spielstand 1:1)");
      return;
    }
  } else if (!isNaN(set3P1) || !isNaN(set3P2)) {
    Toast.warning("Dritter Satz nicht erlaubt (Spielstand bereits 2:0)");
    return;
  }

  try {
    await db.collection("singlesMatches").add({
      player1Id: player1Id,
      player2Id: player2Id,
      sets,
      date: firebase.firestore.FieldValue.serverTimestamp(),
    });

    // Reset state
    state.challengeMatchEntry = null;
    
    Modal.close();
    Toast.success("Spiel erfolgreich eingetragen!");
    render();
  } catch (error) {
    console.error("Error submitting challenge match:", error);
    Toast.error("Fehler beim Eintragen des Spiels");
  }
}