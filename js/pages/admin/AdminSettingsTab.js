// js/pages/admin/AdminSettingsTab.js
// Admin-Tab: Einstellungen für Status und Challenge-Validierung

function AdminSettingsTab() {
  const settings = state.matchStatusSettings || {};
  const validationMode = state.doublesValidationMode || "allow";
  const displaySettings = state.matchesDisplaySettings || {
    showUnconfirmedSingles: false,
    showUnconfirmedDoubles: false,
  };

  return `
    <div class="space-y-6">
      <div class="mb-6">
        <h3 class="text-xl font-bold text-gray-800 mb-3">Einstellungen</h3>
        <p class="text-gray-600">Verwalte die Standard-Einstellungen für Spielstatus, Challenge-Validierung und Anzeige von Spielen.</p>
      </div>

      <!-- Status-Einstellungen -->
      <div class="bg-white rounded-lg p-6 border border-gray-200">
      <h3 class="text-xl font-bold text-gray-800 mb-4">Status-Einstellungen</h3>

        <!-- Status-Einstellungen für Einzel-Spiele -->
        <div class="bg-white rounded-lg p-6 border border-gray-200 mb-4">
          <h3 class="text-xl font-bold text-gray-800 mb-4">Status-Einstellungen für Einzel-Spiele</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Standard-Status für Admin-eingetragene Spiele</label>
              <select id="singlesAdminStatus" class="w-full px-3 py-2 border border-gray-300 rounded-lg" onchange="updateMatchStatusSettings()">
                <option value="confirmed" ${settings.singlesAdminDefault === "confirmed" ? "selected" : ""}>Bestätigt</option>
                <option value="unconfirmed" ${settings.singlesAdminDefault === "unconfirmed" ? "selected" : ""}>Unbestätigt</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Standard-Status für Nutzer-eingetragene Spiele</label>
              <select id="singlesUserStatus" class="w-full px-3 py-2 border border-gray-300 rounded-lg" onchange="updateMatchStatusSettings()">
                <option value="confirmed" ${settings.singlesUserDefault === "confirmed" ? "selected" : ""}>Bestätigt</option>
                <option value="unconfirmed" ${settings.singlesUserDefault === "unconfirmed" ? "selected" : ""}>Unbestätigt</option>
                <option value="rejected" ${settings.singlesUserDefault === "rejected" ? "selected" : ""}>Abgelehnt</option>
              </select>
            </div>
          </div>
          <p class="text-sm text-gray-600 mt-3">Diese Einstellungen bestimmen, welchen Status neue Einzel-Spiele automatisch erhalten. Nur bestätigte Spiele beeinflussen die Tabelle.</p>
        </div>


      <!-- Status-Einstellungen für Doppel-Spiele -->
      <div class="bg-white rounded-lg p-6 border border-gray-200">
        <h4 class="text-xl font-bold text-gray-800 mb-4">Doppel</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Standard-Status für Admin-eingetragene Spiele</label>
            <select id="doublesAdminStatus" class="w-full px-3 py-2 border border-gray-300 rounded-lg" onchange="updateMatchStatusSettings()">
              <option value="confirmed" ${settings.doublesAdminDefault === "confirmed" ? "selected" : ""}>Bestätigt</option>
              <option value="unconfirmed" ${settings.doublesAdminDefault === "unconfirmed" ? "selected" : ""}>Unbestätigt</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Standard-Status für Nutzer-eingetragene Spiele</label>
            <select id="doublesUserStatus" class="w-full px-3 py-2 border border-gray-300 rounded-lg" onchange="updateMatchStatusSettings()">
              <option value="confirmed" ${settings.doublesUserDefault === "confirmed" ? "selected" : ""}>Bestätigt</option>
              <option value="unconfirmed" ${settings.doublesUserDefault === "unconfirmed" ? "selected" : ""}>Unbestätigt</option>
              <option value="rejected" ${settings.doublesUserDefault === "rejected" ? "selected" : ""}>Abgelehnt</option>
            </select>
          </div>
        </div>
        <p class="text-sm text-gray-600 mt-3">Diese Einstellungen bestimmen, welchen Status neue Doppel-Spiele automatisch erhalten. Nur bestätigte Spiele beeinflussen die Pyramide.</p>
      </div>
            </div>

      <!-- Challenge-Validierungs-Einstellungen -->
      <div class="bg-white rounded-lg p-6 border border-gray-200">
        <div class="flex items-start gap-3 mb-4">
          <svg class="w-6 h-6 text-gray-700 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
          </svg>
          <div>
            <h3 class="text-xl font-bold text-gray-800 mb-1">Challenge-Validierung (Doppel)</h3>
            <p class="text-sm text-gray-600">Legt fest, wie mit regelwidrigen Herausforderungen umgegangen wird</p>
          </div>
        </div>
        
        <div class="space-y-3">
          <label class="flex items-start p-4 bg-gray-50 rounded-lg border-2 cursor-pointer transition-all ${validationMode === "allow" ? "border-gray-500 bg-gray-100" : "border-gray-200 hover:border-gray-300"}">
            <input 
              type="radio" 
              name="validationMode" 
              value="allow"
              ${validationMode === "allow" ? "checked" : ""}
              onchange="updateValidationMode('allow')"
              class="mt-1 h-4 w-4 text-gray-600 focus:ring-gray-500">
            <div class="ml-3">
              <span class="font-semibold text-gray-800">Erlauben</span>
              <p class="text-sm text-gray-600 mt-1">Alle Herausforderungen werden ohne Prüfung zugelassen</p>
            </div>
          </label>
          
          <label class="flex items-start p-4 bg-gray-50 rounded-lg border-2 cursor-pointer transition-all ${validationMode === "warn" ? "border-gray-500 bg-gray-100" : "border-gray-200 hover:border-gray-300"}">
            <input 
              type="radio" 
              name="validationMode" 
              value="warn"
              ${validationMode === "warn" ? "checked" : ""}
              onchange="updateValidationMode('warn')"
              class="mt-1 h-4 w-4 text-gray-600 focus:ring-gray-500">
            <div class="ml-3">
              <span class="font-semibold text-gray-800">Warnen</span>
              <p class="text-sm text-gray-600 mt-1">Zeigt eine Warnung an und fragt nach Bestätigung</p>
            </div>
          </label>
          
          <label class="flex items-start p-4 bg-gray-50 rounded-lg border-2 cursor-pointer transition-all ${validationMode === "block" ? "border-gray-500 bg-gray-100" : "border-gray-200 hover:border-gray-300"}">
            <input 
              type="radio" 
              name="validationMode" 
              value="block"
              ${validationMode === "block" ? "checked" : ""}
              onchange="updateValidationMode('block')"
              class="mt-1 h-4 w-4 text-gray-600 focus:ring-gray-500">
            <div class="ml-3">
              <span class="font-semibold text-gray-800">Blockieren</span>
              <p class="text-sm text-gray-600 mt-1">Verhindert regelwidrige Herausforderungen komplett</p>
            </div>
          </label>
        </div>
      </div>

      <!-- Anzeige-Einstellungen für Matches-Tab -->
      <div class="bg-white rounded-lg p-6 border border-gray-200">
        <div class="flex items-start gap-3 mb-4">
          <svg class="w-6 h-6 text-gray-700 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
          <div>
            <h3 class="text-xl font-bold text-gray-800 mb-1">Anzeige-Einstellungen für Matches-Tab</h3>
            <p class="text-sm text-gray-600">Legt fest, ob unbestätigte Spiele im Matches-Tab angezeigt werden</p>
          </div>
        </div>
        
        <div class="space-y-3">
          <label class="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300 transition-all">
            <input 
              type="checkbox" 
              id="showUnconfirmedSingles"
              ${displaySettings.showUnconfirmedSingles ? "checked" : ""}
              onchange="updateMatchesDisplaySettings()"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded">
            <div class="ml-3">
              <span class="font-semibold text-gray-800">Unbestätigte Einzel-Spiele anzeigen</span>
              <p class="text-sm text-gray-600 mt-1">Zeigt unbestätigte Einzel-Spiele im Matches-Tab mit einem Badge an</p>
            </div>
          </label>
          
          <label class="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300 transition-all">
            <input 
              type="checkbox" 
              id="showUnconfirmedDoubles"
              ${displaySettings.showUnconfirmedDoubles ? "checked" : ""}
              onchange="updateMatchesDisplaySettings()"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded">
            <div class="ml-3">
              <span class="font-semibold text-gray-800">Unbestätigte Doppel-Spiele anzeigen</span>
              <p class="text-sm text-gray-600 mt-1">Zeigt unbestätigte Doppel-Spiele im Matches-Tab mit einem Badge an</p>
            </div>
          </label>
        </div>
        
        <p class="text-sm text-gray-600 mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <strong>Hinweis:</strong> Diese Einstellungen betreffen nur die Anzeige auf der Seite "Spiele". Unbestätigte Spiele haben keinen Einfluss auf Tabellen oder Rankings.
        </p>
      </div>
    </div>
  `;
}
