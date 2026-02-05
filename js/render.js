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
      content = ChallengesPage();
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
      content = AdminPage();
      break;
    default:
      content = HomePage();
  }

  app.innerHTML = `
    ${Navigation()}
    <div class="container mx-auto px-4 py-4 sm:py-8 max-w-7xl w-full">
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