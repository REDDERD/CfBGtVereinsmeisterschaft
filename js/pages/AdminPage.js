// js/pages/AdminPage.js
// Admin-Seite: Orchestriert Login, Tabs und Sub-Komponenten

function AdminPage() {
  if (!state.user) {
    return AdminLoginView();
  }

  if (!state.isAdmin) {
    return AdminNoPermissionView();
  }

  const tabs = [
    { id: "players", label: "Spieler" },
    { id: "singlesTable", label: "Einzel" },
    { id: "doublesRanking", label: "Doppel" },
    { id: "matchApproval", label: "Spiele" },
    { id: "export", label: "Export" },
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
        ${state.adminTab === "matchApproval" ? AdminMatchApprovalTab() : ""}
        ${state.adminTab === "export" ? AdminExportTab() : ""}
      </div>
    </div>`;
}