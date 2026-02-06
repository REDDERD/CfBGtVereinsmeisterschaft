// js/pages/admin/AdminLoginView.js
// Admin Login-Ansicht

function AdminLoginView() {
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

function AdminNoPermissionView() {
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
