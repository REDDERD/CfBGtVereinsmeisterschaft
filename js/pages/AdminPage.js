// js/pages/AdminPage.js
// Admin-Seite - Mobile-First

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
    { id: "announcements", label: "News" },
    { id: "settings", label: "Einstell." },
    { id: "export", label: "Export" },
  ];

  return `
    <div class="space-y-4 sm:space-y-6">
      <div class="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4">Admin</h2>

        <!-- Scrollable tab bar for mobile -->
        <div class="flex gap-1 mb-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          ${tabs
            .map(
              (tab) => `
            <button onclick="setAdminTab('${tab.id}')" class="px-3 py-2 rounded-lg whitespace-nowrap text-xs sm:text-sm font-medium transition-colors flex-shrink-0 ${
              state.adminTab === tab.id
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }">
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
        ${state.adminTab === "announcements" ? AdminAnnouncementsTab() : ""}
        ${state.adminTab === "settings" ? AdminSettingsTab() : ""}
        ${state.adminTab === "export" ? AdminExportTab() : ""}
      </div>
    </div>`;
}
