// js/pages/admin/AdminSinglesTableTab.js
// Admin-Tab: Einzel-Tabellen und K.O.-Phase Konfiguration

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
  const settings = state.matchStatusSettings || {};

  return `
    <div>
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

      <!-- Status-Einstellungen für Einzel-Spiele -->
      <div class="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 class="text-xl font-bold text-gray-800 mb-4">Status-Einstellungen</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Standard-Status für Admin-eingetragene Spiele</label>
            <select id="singlesAdminStatus" class="w-full px-3 py-2 border border-gray-300 rounded-lg" onchange="updateMatchStatusSettings()">
              <option value="confirmed" ${settings.singlesAdminDefault === "confirmed" ? "selected" : ""}>Bestätigt</option>
              <option value="unconfirmed" ${settings.singlesAdminDefault === "unconfirmed" ? "selected" : ""}>Unbestätigt</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Standard-Status für Nutzer-eingetragene Spiele</label>
            <select id="singlesUserStatus" class="w-full px-3 py-2 border border-gray-300 rounded-lg" onchange="updateMatchStatusSettings()">
              <option value="confirmed" ${settings.singlesUserDefault === "confirmed" ? "selected" : ""}>Bestätigt</option>
              <option value="unconfirmed" ${settings.singlesUserDefault === "unconfirmed" ? "selected" : ""}>Unbestätigt</option>
              <option value="rejected" ${settings.singlesUserDefault === "rejected" ? "selected" : ""}>Abgelehnt</option>
            </select>
          </div>
        </div>
      </div>
    </div>`;
}