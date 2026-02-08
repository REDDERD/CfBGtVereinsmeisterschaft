// js/pages/admin/AdminSettingsTab.js
// Admin-Tab: Einstellungen für Status und Challenge-Validierung

function AdminSettingsTab() {
  const settings = state.matchStatusSettings || {};
  const singlesValidationMode = state.singlesValidationMode || "allow";
  const doublesValidationMode = state.doublesValidationMode || "allow";
  const displaySettings = state.matchesDisplaySettings || {
    showUnconfirmedSingles: false,
    showUnconfirmedDoubles: false,
  };

  return `
    <div class="space-y-6">

    <!-- Status-Einstellungen -->
      <div class="bg-white rounded-lg p-6 border border-gray-200">
        <h3 class="text-xl font-bold text-gray-800 mb-6">Status-Einstellungen</h3>

        <!-- Grid Layout für Einzel und Doppel nebeneinander -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <!-- Linke Spalte: Einzel-Spiele -->
          <div class="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <h4 class="text-lg font-bold text-gray-800 mb-4 text-center">Einzel-Spiele</h4>
            
            <!-- Admin-eingetragene Einzel-Spiele -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-3">Admin-eingetragene Spiele</label>
              <div class="space-y-2">
                <label class="flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all ${settings.singlesAdminDefault === "confirmed" ? "border-green-500 bg-green-50" : "bg-white border-gray-200 hover:border-gray-300"}">
                  <input 
                    type="radio" 
                    name="singlesAdminStatus" 
                    value="confirmed"
                    ${settings.singlesAdminDefault === "confirmed" ? "checked" : ""}
                    onchange="updateMatchStatusSettings()"
                    class="mt-1 h-4 w-4 text-green-600 focus:ring-green-500">
                  <div class="ml-3">
                    <span class="font-semibold text-gray-800">Bestätigt</span>
                    <p class="text-xs text-gray-600 mt-0.5">Sofort berücksichtigt</p>
                  </div>
                </label>
                
                <label class="flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all ${settings.singlesAdminDefault === "unconfirmed" ? "border-yellow-500 bg-yellow-50" : "bg-white border-gray-200 hover:border-gray-300"}">
                  <input 
                    type="radio" 
                    name="singlesAdminStatus" 
                    value="unconfirmed"
                    ${settings.singlesAdminDefault === "unconfirmed" ? "checked" : ""}
                    onchange="updateMatchStatusSettings()"
                    class="mt-1 h-4 w-4 text-yellow-600 focus:ring-yellow-500">
                  <div class="ml-3">
                    <span class="font-semibold text-gray-800">Unbestätigt</span>
                    <p class="text-xs text-gray-600 mt-0.5">Manuelle Bestätigung</p>
                  </div>
                </label>
              </div>
            </div>
            
            <!-- Nutzer-eingetragene Einzel-Spiele -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">Nutzer-eingetragene Spiele</label>
              <div class="space-y-2">
                <label class="flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all ${settings.singlesUserDefault === "confirmed" ? "border-green-500 bg-green-50" : "bg-white border-gray-200 hover:border-gray-300"}">
                  <input 
                    type="radio" 
                    name="singlesUserStatus" 
                    value="confirmed"
                    ${settings.singlesUserDefault === "confirmed" ? "checked" : ""}
                    onchange="updateMatchStatusSettings()"
                    class="mt-1 h-4 w-4 text-green-600 focus:ring-green-500">
                  <div class="ml-3">
                    <span class="font-semibold text-gray-800">Bestätigt</span>
                    <p class="text-xs text-gray-600 mt-0.5">Sofort berücksichtigt</p>
                  </div>
                </label>
                
                <label class="flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all ${settings.singlesUserDefault === "unconfirmed" ? "border-yellow-500 bg-yellow-50" : "bg-white border-gray-200 hover:border-gray-300"}">
                  <input 
                    type="radio" 
                    name="singlesUserStatus" 
                    value="unconfirmed"
                    ${settings.singlesUserDefault === "unconfirmed" ? "checked" : ""}
                    onchange="updateMatchStatusSettings()"
                    class="mt-1 h-4 w-4 text-yellow-600 focus:ring-yellow-500">
                  <div class="ml-3">
                    <span class="font-semibold text-gray-800">Unbestätigt</span>
                    <p class="text-xs text-gray-600 mt-0.5">Manuelle Bestätigung</p>
                  </div>
                </label>
                
                <label class="flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all ${settings.singlesUserDefault === "rejected" ? "border-red-500 bg-red-50" : "bg-white border-gray-200 hover:border-gray-300"}">
                  <input 
                    type="radio" 
                    name="singlesUserStatus" 
                    value="rejected"
                    ${settings.singlesUserDefault === "rejected" ? "checked" : ""}
                    onchange="updateMatchStatusSettings()"
                    class="mt-1 h-4 w-4 text-red-600 focus:ring-red-500">
                  <div class="ml-3">
                    <span class="font-semibold text-gray-800">Abgelehnt</span>
                    <p class="text-xs text-gray-600 mt-0.5">Nicht berücksichtigt</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
          
          <!-- Rechte Spalte: Doppel-Spiele -->
          <div class="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <h4 class="text-lg font-bold text-gray-800 mb-4 text-center">Doppel-Spiele</h4>
            
            <!-- Admin-eingetragene Doppel-Spiele -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-3">Admin-eingetragene Spiele</label>
              <div class="space-y-2">
                <label class="flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all ${settings.doublesAdminDefault === "confirmed" ? "border-green-500 bg-green-50" : "bg-white border-gray-200 hover:border-gray-300"}">
                  <input 
                    type="radio" 
                    name="doublesAdminStatus" 
                    value="confirmed"
                    ${settings.doublesAdminDefault === "confirmed" ? "checked" : ""}
                    onchange="updateMatchStatusSettings()"
                    class="mt-1 h-4 w-4 text-green-600 focus:ring-green-500">
                  <div class="ml-3">
                    <span class="font-semibold text-gray-800">Bestätigt</span>
                    <p class="text-xs text-gray-600 mt-0.5">Sofort berücksichtigt</p>
                  </div>
                </label>
                
                <label class="flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all ${settings.doublesAdminDefault === "unconfirmed" ? "border-yellow-500 bg-yellow-50" : "bg-white border-gray-200 hover:border-gray-300"}">
                  <input 
                    type="radio" 
                    name="doublesAdminStatus" 
                    value="unconfirmed"
                    ${settings.doublesAdminDefault === "unconfirmed" ? "checked" : ""}
                    onchange="updateMatchStatusSettings()"
                    class="mt-1 h-4 w-4 text-yellow-600 focus:ring-yellow-500">
                  <div class="ml-3">
                    <span class="font-semibold text-gray-800">Unbestätigt</span>
                    <p class="text-xs text-gray-600 mt-0.5">Manuelle Bestätigung</p>
                  </div>
                </label>
              </div>
            </div>
            
            <!-- Nutzer-eingetragene Doppel-Spiele -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">Nutzer-eingetragene Spiele</label>
              <div class="space-y-2">
                <label class="flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all ${settings.doublesUserDefault === "confirmed" ? "border-green-500 bg-green-50" : "bg-white border-gray-200 hover:border-gray-300"}">
                  <input 
                    type="radio" 
                    name="doublesUserStatus" 
                    value="confirmed"
                    ${settings.doublesUserDefault === "confirmed" ? "checked" : ""}
                    onchange="updateMatchStatusSettings()"
                    class="mt-1 h-4 w-4 text-green-600 focus:ring-green-500">
                  <div class="ml-3">
                    <span class="font-semibold text-gray-800">Bestätigt</span>
                    <p class="text-xs text-gray-600 mt-0.5">Sofort berücksichtigt</p>
                  </div>
                </label>
                
                <label class="flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all ${settings.doublesUserDefault === "unconfirmed" ? "border-yellow-500 bg-yellow-50" : "bg-white border-gray-200 hover:border-gray-300"}">
                  <input 
                    type="radio" 
                    name="doublesUserStatus" 
                    value="unconfirmed"
                    ${settings.doublesUserDefault === "unconfirmed" ? "checked" : ""}
                    onchange="updateMatchStatusSettings()"
                    class="mt-1 h-4 w-4 text-yellow-600 focus:ring-yellow-500">
                  <div class="ml-3">
                    <span class="font-semibold text-gray-800">Unbestätigt</span>
                    <p class="text-xs text-gray-600 mt-0.5">Manuelle Bestätigung</p>
                  </div>
                </label>
                
                <label class="flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all ${settings.doublesUserDefault === "rejected" ? "border-red-500 bg-red-50" : "bg-white border-gray-200 hover:border-gray-300"}">
                  <input 
                    type="radio" 
                    name="doublesUserStatus" 
                    value="rejected"
                    ${settings.doublesUserDefault === "rejected" ? "checked" : ""}
                    onchange="updateMatchStatusSettings()"
                    class="mt-1 h-4 w-4 text-red-600 focus:ring-red-500">
                  <div class="ml-3">
                    <span class="font-semibold text-gray-800">Abgelehnt</span>
                    <p class="text-xs text-gray-600 mt-0.5">Nicht berücksichtigt</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Info-Box unterhalb -->
        <p class="text-sm text-gray-600 mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <strong>Info:</strong> Diese Einstellungen bestimmen, welchen Status neue Spiele automatisch erhalten. Nur bestätigte Spiele beeinflussen die Tabelle bzw. Pyramide.
        </p>
      </div>

      <!-- Challenge-Validierungs-Einstellungen -->
      <div class="bg-white rounded-lg p-6 border border-gray-200">
        <div class="mb-6">
          <h3 class="text-xl font-bold text-gray-800 mb-1">Herausforderungs-Validierung</h3>
        </div>
        
        <!-- Grid Layout für Einzel und Doppel nebeneinander -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <!-- Linke Spalte: Einzel-Spiele -->
          <div class="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <h4 class="text-lg font-bold text-gray-800 text-center mb-1">Einzel</h4>
            <p class="text-sm text-gray-600 mb-2">Dürfen mehr als 2 Gruppenspiele für die selbe Paarung eingetragen werden?</p>
            
            <div class="space-y-3">
              <label class="flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${singlesValidationMode === "allow" ? "border-blue-500 bg-blue-50" : "bg-white border-gray-200 hover:border-gray-300"}">
                <input 
                  type="radio" 
                  name="singlesValidationMode" 
                  value="allow"
                  ${singlesValidationMode === "allow" ? "checked" : ""}
                  onchange="updateValidationMode('allow', 'singles')"
                  class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500">
                <div class="ml-3">
                  <span class="font-semibold text-gray-800">Erlauben</span>
                  
                </div>
              </label>
              
              <label class="flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${singlesValidationMode === "warn" ? "border-orange-500 bg-orange-50" : "bg-white border-gray-200 hover:border-gray-300"}">
                <input 
                  type="radio" 
                  name="singlesValidationMode" 
                  value="warn"
                  ${singlesValidationMode === "warn" ? "checked" : ""}
                  onchange="updateValidationMode('warn', 'singles')"
                  class="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500">
                <div class="ml-3">
                  <span class="font-semibold text-gray-800">Warnen</span>
                </div>
              </label>
              
              <label class="flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${singlesValidationMode === "block" ? "border-red-500 bg-red-50" : "bg-white border-gray-200 hover:border-gray-300"}">
                <input 
                  type="radio" 
                  name="singlesValidationMode" 
                  value="block"
                  ${singlesValidationMode === "block" ? "checked" : ""}
                  onchange="updateValidationMode('block', 'singles')"
                  class="mt-1 h-4 w-4 text-red-600 focus:ring-red-500">
                <div class="ml-3">
                  <span class="font-semibold text-gray-800">Blockieren</span>
                </div>
              </label>
            </div>
          </div>
          
          <!-- Rechte Spalte: Doppel-Spiele -->
          <div class="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <h4 class="text-lg font-bold text-gray-800 text-center mb-1">Doppel</h4>
            <p class="text-sm text-gray-600 mb-2">Dürfen Spiele mit regelwidriger Herausforderung eingetragen werden?</p>
            
            <div class="space-y-3">
              <label class="flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${doublesValidationMode === "allow" ? "border-blue-500 bg-blue-50" : "bg-white border-gray-200 hover:border-gray-300"}">
                <input 
                  type="radio" 
                  name="doublesValidationMode" 
                  value="allow"
                  ${doublesValidationMode === "allow" ? "checked" : ""}
                  onchange="updateValidationMode('allow', 'doubles')"
                  class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500">
                <div class="ml-3">
                  <span class="font-semibold text-gray-800">Erlauben</span>
                </div>
              </label>
              
              <label class="flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${doublesValidationMode === "warn" ? "border-orange-500 bg-orange-50" : "bg-white border-gray-200 hover:border-gray-300"}">
                <input 
                  type="radio" 
                  name="doublesValidationMode" 
                  value="warn"
                  ${doublesValidationMode === "warn" ? "checked" : ""}
                  onchange="updateValidationMode('warn', 'doubles')"
                  class="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500">
                <div class="ml-3">
                  <span class="font-semibold text-gray-800">Warnen</span>
                </div>
              </label>
              
              <label class="flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${doublesValidationMode === "block" ? "border-red-500 bg-red-50" : "bg-white border-gray-200 hover:border-gray-300"}">
                <input 
                  type="radio" 
                  name="doublesValidationMode" 
                  value="block"
                  ${doublesValidationMode === "block" ? "checked" : ""}
                  onchange="updateValidationMode('block', 'doubles')"
                  class="mt-1 h-4 w-4 text-red-600 focus:ring-red-500">
                <div class="ml-3">
                  <span class="font-semibold text-gray-800">Blockieren</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Anzeige-Einstellungen für Matches-Tab -->
      <div class="bg-white rounded-lg p-6 border border-gray-200">
        <div class="mb-6">
          <h3 class="text-xl font-bold text-gray-800 mb-1">Anzeige-Einstellungen für unbestätige Spiele</h3>
          <p class="text-sm text-gray-600">Legt fest, ob unbestätigte Spiele auf der Seite "Spiele" angezeigt werden</p>
        </div>
        
        <div class="space-y-3">
          <label class="flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${displaySettings.showUnconfirmedSingles ? "border-indigo-500 bg-indigo-50" : "bg-gray-50 border-gray-200 hover:border-gray-300"}">
            <input 
              type="checkbox" 
              id="showUnconfirmedSingles"
              ${displaySettings.showUnconfirmedSingles ? "checked" : ""}
              onchange="updateMatchesDisplaySettings()"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded">
            <div class="ml-3">
              <span class="font-semibold text-gray-800">Unbestätigte Einzel-Spiele anzeigen</span>
            </div>
          </label>
          
          <label class="flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${displaySettings.showUnconfirmedDoubles ? "border-indigo-500 bg-indigo-50" : "bg-gray-50 border-gray-200 hover:border-gray-300"}">
            <input 
              type="checkbox" 
              id="showUnconfirmedDoubles"
              ${displaySettings.showUnconfirmedDoubles ? "checked" : ""}
              onchange="updateMatchesDisplaySettings()"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded">
            <div class="ml-3">
              <span class="font-semibold text-gray-800">Unbestätigte Doppel-Spiele anzeigen</span>
            </div>
          </label>
        </div>
        
      </div>
    </div>
  `;
}