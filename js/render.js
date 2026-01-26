// js/render.js
// Haupt-Render-Funktion

function render() {
  const app = document.getElementById("app");

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
    <div class="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
      ${content}
    </div>
  `;
}