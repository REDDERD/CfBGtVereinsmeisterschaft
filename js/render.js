// js/render.js
// Haupt-Render-Funktion

function render() {
  const app = document.getElementById("app");
  
  // Speichere das aktuelle aktive Element und dessen Cursor-Position
  const activeElement = document.activeElement;
  const activeElementId = activeElement?.id;
  const selectionStart = activeElement?.selectionStart;
  const selectionEnd = activeElement?.selectionEnd;

  let content = "";

  switch (state.currentPage) {
    case "singles":
      content = SinglesPage();
      break;
    case "doubles":
      content = DoublesPage();
      break;
    case "challenges":
      content = state.archiveMode ? HomePage() : ChallengesPage();
      break;
    case "statistics":
      content = StatisticsPage();
      break;
    case "players":
      content = PlayersPage();
      break;
    case "matches":
      content = MatchesPage();
      break;
    case "playerProfile":
      content = PlayerProfilePage(state.selectedPlayerId);
      break;
    case "admin":
      content = state.archiveMode ? HomePage() : AdminPage();
      break;
    case "archive":
      content = ArchivePage();
      break;
    default:
      content = HomePage();
  }

  // Archiv-Banner
  const archiveBanner = state.archiveMode ? `
    <div class="bg-amber-100 dark:bg-amber-900 border-b-2 border-amber-400 dark:border-amber-600 px-4 py-2 flex items-center justify-between">
      <span class="font-semibold text-amber-800 dark:text-amber-200 text-sm sm:text-base">
        Archiv: Saison ${state.archiveYear}
      </span>
      <button onclick="exitArchiveMode()" class="px-3 py-1 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 transition-colors">
        Zur aktuellen Saison
      </button>
    </div>
  ` : '';

  app.innerHTML = `
    ${Navigation()}
    ${archiveBanner}
    <div class="container mx-auto px-3 sm:px-4 py-3 sm:py-8 max-w-7xl w-full pb-20 md:pb-8">
      ${content}
    </div>
  `;
  
  // Stelle den Fokus und die Cursor-Position wieder her
  if (activeElementId) {
    const element = document.getElementById(activeElementId);
    if (element) {
      element.focus();
      if (typeof selectionStart === 'number' && typeof selectionEnd === 'number') {
        try {
          element.setSelectionRange(selectionStart, selectionEnd);
        } catch (e) {
          // Ignoriere Fehler bei Elementen die keine Selection unterstützen
        }
      }
    }
  }
}