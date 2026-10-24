// js/pages/admin/AdminStatsTab.js
// Admin-Tab: Nutzungsstatistik (aggregierte Seitenaufrufe)

function AdminStatsTab() {
  const { rangeDays, loading, days } = state.usageStats;

  if (days === null) {
    // Tab war schon aktiv (z. B. Rückkehr auf die Admin-Seite) → jetzt laden
    if (!loading) setTimeout(loadUsageStats);
    return `<div class="text-center py-8 text-gray-500 text-sm">Statistik wird geladen...</div>`;
  }

  const series = getUsageStatsDaySeries();
  const today = series[series.length - 1]?.counts || {};
  const startsTotal = sumUsageStat(series, "appStarts");
  const adminStartsTotal = sumUsageStat(series, "admin_appStarts");

  const pageRows = USAGE_STATS_PAGES.map((page) => ({
    page,
    visitors: sumUsageStat(series, page),
    admins: sumUsageStat(series, `admin_${page}`),
  })).sort((a, b) => b.visitors - a.visitors || b.admins - a.admins);

  const tile = (label, value, hint) => `
    <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <div class="text-xs text-gray-500">${label}</div>
      <div class="text-2xl font-bold text-gray-800">${value}</div>
      ${hint ? `<div class="text-xs text-gray-500 mt-0.5">${hint}</div>` : ""}
    </div>`;

  return `
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 class="text-xl font-bold text-gray-800">Nutzungsstatistik</h3>
          <p class="text-xs text-gray-500">Gezählt werden nur Summen je Tag und Seite – keine Cookies, keine Nutzer-IDs.</p>
        </div>
        <div class="flex gap-1">
          ${[7, 30, 90]
            .map(
              (d) => `
            <button onclick="setUsageStatsRange(${d})" class="px-3 py-1.5 rounded-lg text-sm font-medium ${rangeDays === d ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}">${d} Tage</button>`,
            )
            .join("")}
          <button onclick="loadUsageStats()" class="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200" title="Aktualisieren" ${loading ? "disabled" : ""}>↻</button>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        ${tile("App-Starts heute", today.appStarts || 0, `Admins: ${today.admin_appStarts || 0}`)}
        ${tile(`App-Starts ${rangeDays} Tage`, startsTotal, `Admins: ${adminStartsTotal}`)}
        ${tile("Ø App-Starts pro Tag", (startsTotal / rangeDays).toFixed(1).replace(".", ","), "ohne Admins")}
        ${tile(`Seitenaufrufe ${rangeDays} Tage`, pageRows.reduce((s, r) => s + r.visitors, 0), `Admins: ${pageRows.reduce((s, r) => s + r.admins, 0)}`)}
      </div>

      <div class="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
        <h4 class="font-semibold text-gray-800 mb-2 text-sm sm:text-base">App-Starts pro Tag</h4>
        <div class="relative" style="height: 220px">
          <canvas id="usageStatsChart" aria-label="App-Starts pro Tag, Besucher und Admins" role="img"></canvas>
        </div>
      </div>

      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-gray-600">
            <tr>
              <th class="text-left font-semibold px-3 py-2">Seite</th>
              <th class="text-right font-semibold px-3 py-2">Besucher</th>
              <th class="text-right font-semibold px-3 py-2">Admins</th>
            </tr>
          </thead>
          <tbody>
            ${pageRows
              .map(
                (r) => `
            <tr class="border-t border-gray-100">
              <td class="px-3 py-2 text-gray-800">${USAGE_STATS_PAGE_LABELS[r.page] || r.page}</td>
              <td class="px-3 py-2 text-right font-semibold text-gray-800 tabular-nums">${r.visitors}</td>
              <td class="px-3 py-2 text-right text-gray-500 tabular-nums">${r.admins}</td>
            </tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>

      <p class="text-xs text-gray-500">„App-Starts“ = einmal pro Laden der App, „Seitenaufrufe“ = jeder Wechsel auf eine Seite. Eindeutige Besucher werden bewusst nicht erfasst.</p>
    </div>`;
}
