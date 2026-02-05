// js/pages/AdminPage.js

function AdminPage() {
  // Check if user is logged in
  if (!state.user) {
    return `
      <div class="max-w-md mx-auto">
        <div class="bg-white rounded-xl shadow-lg p-8">
          <div class="text-center mb-6">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              ${icons.login}
            </div>
            <h2 class="text-2xl font-bold text-gray-800">Admin Login</h2>
            <p class="text-sm text-gray-600 mt-2">Melde dich an, um die Verwaltung zu nutzen</p>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Email-Adresse
              </label>
              <input 
                type="email" 
                id="loginEmail" 
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
                placeholder="admin@verein.de"
                onkeypress="if(event.key === 'Enter') handleLogin()">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Passwort
              </label>
              <div class="relative">
                <input 
                  type="password" 
                  id="loginPassword" 
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all pr-10" 
                  placeholder="••••••••"
                  onkeypress="if(event.key === 'Enter') handleLogin()">
                <button 
                  type="button"
                  onclick="togglePasswordVisibility('loginPassword', 'toggleIcon')"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors">
                  <svg id="toggleIcon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="flex items-center justify-between">
              <label class="flex items-center">
                <input 
                  type="checkbox" 
                  id="rememberMe"
                  class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <span class="ml-2 text-sm text-gray-600">Angemeldet bleiben</span>
              </label>
              <button 
                onclick="showPasswordReset()" 
                class="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                Passwort vergessen?
              </button>
            </div>
            
            <div id="loginError" class="hidden">
              <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                <svg class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                <span id="loginErrorText" class="text-sm"></span>
              </div>
            </div>
            
            <div id="loginSuccess" class="hidden">
              <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
                <svg class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span id="loginSuccessText" class="text-sm"></span>
              </div>
            </div>
            
            <button 
              onclick="handleLogin()" 
              id="loginButton"
              class="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition-all font-medium shadow-sm hover:shadow flex items-center justify-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
              </svg>
              Anmelden
            </button>
          </div>
          
          <!-- Password Reset Modal (versteckt) -->
          <div id="passwordResetModal" class="hidden">
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h3 class="text-xl font-bold text-gray-800">Passwort zurücksetzen</h3>
                    <p class="text-sm text-gray-600 mt-1">Wir senden dir einen Link zum Zurücksetzen</p>
                  </div>
                  <button onclick="hidePasswordReset()" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
                
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Email-Adresse</label>
                    <input 
                      type="email" 
                      id="resetEmail" 
                      class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                      placeholder="deine@email.de"
                      onkeypress="if(event.key === 'Enter') handlePasswordReset()">
                  </div>
                  
                  <div id="resetError" class="hidden">
                    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      <span id="resetErrorText"></span>
                    </div>
                  </div>
                  
                  <div id="resetSuccess" class="hidden">
                    <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                      <span id="resetSuccessText"></span>
                    </div>
                  </div>
                  
                  <div class="flex space-x-3">
                    <button 
                      onclick="hidePasswordReset()" 
                      class="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                      Abbrechen
                    </button>
                    <button 
                      onclick="handlePasswordReset()" 
                      id="resetButton"
                      class="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                      Link senden
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Info-Box für neue Features -->
        <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-start">
            <svg class="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
            </svg>
            <div class="text-sm text-blue-800">
              <p class="font-medium mb-1">Hilfe benötigt?</p>
              <p>Kontaktiere Daniel R., wenn du Probleme beim Login hast oder einen neuen Account benötigst.</p>
            </div>
          </div>
        </div>
      </div>`;
  }

  const tabs = [
    { id: "players", label: "Spieler" },
    { id: "singlesTable", label: "Einzel" },
    { id: "doublesRanking", label: "Doppel" },
  ];

  return `
    <div class="space-y-6">
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Admin-Bereich</h2>
        
        <div class="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-2">
          ${tabs
            .map(
              (tab) => `
            <button onclick="setAdminTab('${tab.id}')" class="px-4 py-2 text-left sm:text-center rounded-t ${state.adminTab === tab.id ? "bg-indigo-600 text-white font-semibold" : "text-gray-600 hover:bg-gray-100"}">
              ${tab.label}
            </button>
          `,
            )
            .join("")}
        </div>

        ${state.adminTab === "players" ? AdminPlayersTab() : ""}
        ${state.adminTab === "singlesTable" ? AdminSinglesTableTab() : ""}
        ${state.adminTab === "doublesRanking" ? AdminDoublesRankingTab() : ""}
      </div>
    </div>`;

  // Check if user is admin
  if (!state.isAdmin) {
    return `
      <div class="max-w-md mx-auto">
        <div class="bg-white rounded-xl shadow-lg p-8">
          <div class="text-center mb-6">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-800">Keine Berechtigung</h2>
            <p class="text-sm text-gray-600 mt-2">Du hast keine Admin-Rechte für diesen Bereich</p>
          </div>
          
          <div class="space-y-4">
            <div class="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
              <p class="text-sm">Du bist angemeldet, aber dein Account hat keine Administrator-Berechtigung.</p>
            </div>
            
            <button 
              onclick="navigateTo('home')" 
              class="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition-all font-medium">
              Zurück zur Startseite
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

function AdminPlayersTab() {
  return `
    <div>
      <div class="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 class="font-semibold text-gray-800 mb-3">Neuen Spieler hinzufügen</h4>
        <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <input type="text" id="playerName" placeholder="Name" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg">
          <button onclick="addPlayer()" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Hinzufügen</button>
        </div>
      </div>
      
      <div class="space-y-3">
        ${state.players
          .map((player) =>
            state.editingPlayer === player.id
              ? `
          <div class="p-4 bg-blue-50 border-2 border-blue-500 rounded-lg">
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" id="editName_${player.id}" value="${player.name}" class="w-full px-3 py-2 border rounded-lg">
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Einzel-Gruppe</label>
                  <select id="editSingles_${player.id}" class="w-full px-3 py-2 border rounded-lg">
                    <option value="">Nicht dabei</option>
                    <option value="1" ${player.singlesGroup === 1 ? "selected" : ""}>Gruppe 1</option>
                    <option value="2" ${player.singlesGroup === 2 ? "selected" : ""}>Gruppe 2</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Doppel-Pool</label>
                  <select id="editDoubles_${player.id}" class="w-full px-3 py-2 border rounded-lg">
                    <option value="">Nicht dabei</option>
                    <option value="A" ${player.doublesPool === "A" ? "selected" : ""}>Pool A (stark)</option>
                    <option value="B" ${player.doublesPool === "B" ? "selected" : ""}>Pool B (normal)</option>
                  </select>
                </div>
              </div>
              <div class="flex space-x-2">
                <button onclick="savePlayer('${player.id}')" class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Speichern</button>
                <button onclick="cancelEdit()" class="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500">Abbrechen</button>
              </div>
            </div>
          </div>
        `
              : `
          <div class="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300">
            <div>
              <span class="font-medium text-gray-800 break-words">${player.name}</span>
              <div class="text-sm text-gray-500 mt-1">
                ${player.singlesGroup ? `Einzel: Gruppe ${player.singlesGroup}` : ""}
                ${player.singlesGroup && player.doublesPool ? " • " : ""}
                ${player.doublesPool ? `Doppel: Pool ${player.doublesPool}` : ""}
                ${!player.singlesGroup && !player.doublesPool ? "Nimmt nicht teil" : ""}
              </div>
            </div>
            <div class="flex space-x-2 ml-4">
              <button onclick="editPlayer('${player.id}')" class="p-2 text-red-600 hover:bg-blue-50 rounded-lg transition-colors">${icons.edit}</button>
              <button onclick="deletePlayer('${player.id}')" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">${icons.trash}</button>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>`;
}

function AdminSinglesTableTab() {
  const group1 = calculateStandings(1);
  const group2 = calculateStandings(2);
  const positions = [
    { value: "g1p1", label: "1. Platz Gruppe 1" },
    { value: "g1p2", label: "2. Platz Gruppe 1" },
    { value: "g1p3", label: "3. Platz Gruppe 1" },
    { value: "g1p4", label: "4. Platz Gruppe 1" },
    { value: "g2p1", label: "1. Platz Gruppe 2" },
    { value: "g2p2", label: "2. Platz Gruppe 2" },
    { value: "g2p3", label: "3. Platz Gruppe 2" },
    { value: "g2p4", label: "4. Platz Gruppe 2" },
  ];
  const config = state.knockoutConfig || {};

  return `
    <div>
      <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 class="text-xl font-bold text-gray-800">Einzel-Tabellen</h3>
        <button onclick="exportSinglesTables()" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Tabellen exportieren</button>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        ${GroupTable(1, group1)}
        ${GroupTable(2, group2)}
      </div>
      <div class="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 class="text-xl font-bold text-gray-800 mb-4">K.O.-Phase konfigurieren</h3>
        ${
          !state.knockoutPhaseActive
            ? `
          <div class="mb-4 p-4 bg-blue-50 border border-blue-300 rounded-lg">
            <p class="text-sm text-blue-800 mb-3">Konfiguriere die Paarungen nach Platzierung.</p>
            <button onclick="activateKnockoutPhase()" class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold">K.O.-Phase starten</button>
          </div>
        `
            : `
          <div class="mb-4 p-4 bg-green-50 border border-green-300 rounded-lg">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <p class="text-sm text-green-800">✅ K.O.-Phase ist aktiv.</p>
              <button onclick="deactivateKnockoutPhase()" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold">K.O.-Phase deaktivieren</button>
            </div>
          </div>
        `
        }
        <div class="space-y-6">
          <div>
            <h4 class="font-semibold text-gray-700 mb-3">Viertelfinale (4 Spiele)</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${[1, 2, 3, 4]
                .map(
                  (i) => `
                <div class="bg-white p-4 rounded-lg border">
                  <div class="font-medium mb-2">Spiel ${i}</div>
                  <div class="grid grid-cols-2 gap-2">
                    <select id="qf_${i}_p1" class="px-3 py-2 border rounded-lg text-sm" ${state.knockoutPhaseActive ? "disabled" : ""}>
                      <option value="">Position wählen</option>
                      ${positions.map((p) => `<option value="${p.value}" ${config[`qf_${i}_p1`] === p.value ? "selected" : ""}>${p.label}</option>`).join("")}
                    </select>
                    <select id="qf_${i}_p2" class="px-3 py-2 border rounded-lg text-sm" ${state.knockoutPhaseActive ? "disabled" : ""}>
                      <option value="">Position wählen</option>
                      ${positions.map((p) => `<option value="${p.value}" ${config[`qf_${i}_p2`] === p.value ? "selected" : ""}>${p.label}</option>`).join("")}
                    </select>
                  </div>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
          ${!state.knockoutPhaseActive ? `<button onclick="saveKnockoutConfig()" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Paarungen speichern</button>` : ""}
        </div>
      </div>
    </div>`;
}

function AdminDoublesRankingTab() {
  const levels = state.pyramid.levels || [];
  const flatPositions = flattenPyramidLevels(levels);

  return `
    <div>
      <div class="mb-6">
        <h3 class="text-xl font-bold text-gray-800 mb-3">Doppel-Rangfolge bearbeiten</h3>
        <p class="text-sm text-gray-600 mb-4">Nutze die Pfeile, um die Spieler in die gewünschte Reihenfolge zu bringen.</p>
      </div>
      ${
        flatPositions.length === 0
          ? `
        <div class="text-center py-12 bg-gray-50 rounded-lg">
          <p class="text-gray-600 mb-4">Pyramide noch nicht initialisiert</p>
          <button onclick="initPyramid()" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Pyramide initialisieren</button>
        </div>
      `
          : `
        <div class="space-y-3 mb-6">
          ${flatPositions
            .map(
              (playerId, idx) => `
            <div class="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300">
              <div class="flex items-center space-x-4">
                <span class="font-bold text-gray-500 w-8">#${idx + 1}</span>
                <span class="font-medium text-gray-800">${getPlayerName(playerId)}</span>
              </div>
              <div class="flex space-x-2">
                ${idx > 0 ? `<button onclick="movePlayerUp(${idx})" class="p-2 text-indigo-600 hover:bg-indigo-50 rounded" title="Nach oben"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg></button>` : ""}
                ${idx < flatPositions.length - 1 ? `<button onclick="movePlayerDown(${idx})" class="p-2 text-indigo-600 hover:bg-indigo-50 rounded" title="Nach unten"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg></button>` : ""}
                <button onclick="removePlayerFromRanking(${idx}, '${playerId}')" class="p-2 text-red-600 hover:bg-red-50 rounded" title="Aus Rangfolge löschen"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
        <button onclick="saveDoublesRanking()" class="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">Rangfolge speichern</button>
      `
      }
    </div>`;
}
