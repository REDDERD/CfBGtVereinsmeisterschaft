// js/services/usage-stats-service.js
// Einfache Nutzungsstatistik: aggregierte Tageszähler in Firestore.
//
// Gespeichert werden nur Summen je Tag und Seite, z. B.
//   stats/2026-10-24 → { appStarts: 37, doubles: 41, admin_doubles: 12, ... }
// Keine Cookies, kein localStorage, keine IDs, keine Zeitstempel einzelner
// Aufrufe. Aufrufe eingeloggter Admins zählen in eigenen Feldern (Präfix admin_).
// Lokal landen die Zähler im Firestore-Emulator (siehe js/config/firebase.js).

// Muss zur Whitelist in firestore/firestore.rules passen
const USAGE_STATS_PAGES = [
  "home",
  "singles",
  "doubles",
  "challenges",
  "statistics",
  "matches",
  "players",
  "playerProfile",
  "archive",
  "admin",
];

const USAGE_STATS_PAGE_LABELS = {
  home: "Startseite",
  singles: "Einzel",
  doubles: "Doppel",
  challenges: "Herausforderungen",
  statistics: "Statistik",
  matches: "Spiele",
  players: "Spieler",
  playerProfile: "Spielerprofil",
  archive: "Archiv",
  admin: "Admin",
};

// Erst zählen, wenn feststeht, ob ein Admin eingeloggt ist
let _usageStatsReady = false;
let _usageStatsLastPage = null;

function _getUsageStatsDayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Zählt einen Zähler des heutigen Tages um 1 hoch (fire-and-forget).
 */
function _incrementUsageStat(key) {
  const field = state.isAdmin ? `admin_${key}` : key;
  db.collection("stats")
    .doc(_getUsageStatsDayKey())
    .set({ [field]: firebase.firestore.FieldValue.increment(1) }, { merge: true })
    .catch((error) => console.warn("Nutzungsstatistik nicht gespeichert:", error.message));
}

/**
 * Einmal pro App-Laden, nach dem ersten Auth-Ergebnis aufrufen.
 */
function startUsageStats() {
  if (_usageStatsReady) return;
  _usageStatsReady = true;
  _incrementUsageStat("appStarts");
}

/**
 * Zählt die aktuelle Seite, wenn sie sich seit dem letzten Aufruf geändert hat.
 * Wird nach jedem render() aufgerufen.
 */
function trackCurrentPageView() {
  if (!_usageStatsReady) return;
  const page = state.currentPage || "home";
  if (page === _usageStatsLastPage) return;
  _usageStatsLastPage = page;
  if (USAGE_STATS_PAGES.includes(page)) _incrementUsageStat(page);
}

// ========== Auswertung (Admin-Tab "Statistik") ==========

let usageStatsChartInstance = null;

function setUsageStatsRange(days) {
  state.usageStats.rangeDays = days;
  loadUsageStats();
}

async function loadUsageStats() {
  const days = state.usageStats.rangeDays;
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));

  state.usageStats.loading = true;
  render();

  try {
    const snapshot = await db
      .collection("stats")
      .where(firebase.firestore.FieldPath.documentId(), ">=", _getUsageStatsDayKey(from))
      .get();
    state.usageStats.days = snapshot.docs.map((doc) => ({ day: doc.id, counts: doc.data() }));
  } catch (error) {
    console.error("Fehler beim Laden der Nutzungsstatistik:", error);
    Toast.error("Fehler beim Laden der Statistik: " + error.message);
    state.usageStats.days = [];
  }

  state.usageStats.loading = false;
  render();
}

/**
 * Lückenlose Tagesliste des gewählten Zeitraums (Tage ohne Aufrufe = 0).
 */
function getUsageStatsDaySeries() {
  const byDay = Object.fromEntries((state.usageStats.days || []).map((d) => [d.day, d.counts]));
  const series = [];
  for (let i = state.usageStats.rangeDays - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const day = _getUsageStatsDayKey(date);
    series.push({ day, date, counts: byDay[day] || {} });
  }
  return series;
}

function sumUsageStat(series, key) {
  return series.reduce((sum, d) => sum + (d.counts[key] || 0), 0);
}

/**
 * Zeichnet das Diagramm "App-Starts pro Tag". Das Canvas wird bei jedem
 * render() neu erzeugt, deshalb wird das Diagramm danach neu aufgebaut.
 */
function initUsageStatsChart() {
  if (usageStatsChartInstance) {
    usageStatsChartInstance.destroy();
    usageStatsChartInstance = null;
  }

  const canvas = document.getElementById("usageStatsChart");
  if (!canvas || typeof Chart === "undefined") return;

  const series = getUsageStatsDaySeries();
  const isDark = document.documentElement.classList.contains("dark");
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const labelColor = isDark ? "#94a3b8" : "#6b7280";

  usageStatsChartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels: series.map((d) =>
        d.date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }),
      ),
      datasets: [
        {
          label: "Besucher",
          data: series.map((d) => d.counts.appStarts || 0),
          borderColor: "#4f46e5",
          backgroundColor: "#4f46e5",
          tension: 0.25,
          pointRadius: 2,
          borderWidth: 2,
        },
        {
          label: "Admins",
          data: series.map((d) => d.counts.admin_appStarts || 0),
          borderColor: "#f59e0b",
          backgroundColor: "#f59e0b",
          tension: 0.25,
          pointRadius: 2,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false, // wird bei jedem render() neu aufgebaut
      interaction: { mode: "index", intersect: false },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: labelColor, maxTicksLimit: 10 } },
        y: {
          beginAtZero: true,
          grid: { color: gridColor },
          ticks: { color: labelColor, precision: 0 },
        },
      },
      plugins: {
        legend: { labels: { color: labelColor, boxWidth: 12 } },
      },
    },
  });
}
