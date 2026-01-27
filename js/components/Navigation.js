// js/components/Navigation.js
// Navigation Komponente

function Navigation() {
  return `
    <nav class="bg-white shadow-lg">
      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between py-4 md:h-16">
          <div class="flex items-center justify-between mb-4 md:mb-0">
            <h1 class="text-xl md:text-2xl font-bold text-indigo-600 cursor-pointer" onclick="navigateTo('home')">CfB Gütersloh Vereinsmeisterschaft</h1>
            <button onclick="toggleMobileMenu()" class="md:hidden p-2 text-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
          </div>
          
          <div id="mobileMenu" class="flex-col md:flex-row md:flex items-start md:items-center space-y-2 md:space-y-0 md:space-x-2 ${
            state.mobileMenuOpen ? "flex" : "hidden md:flex"
          }">
            <button onclick="navigateTo('singles')" class="w-full md:w-auto flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              state.currentPage === "singles"
                ? "bg-indigo-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }">
              ${icons.user}
              <span class="font-medium">Einzel</span>
            </button>
            <button onclick="navigateTo('doubles')" class="w-full md:w-auto flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              state.currentPage === "doubles"
                ? "bg-indigo-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }">
              ${icons.users}
              <span class="font-medium">Doppel</span>
            </button>
            <button onclick="navigateTo('challenges')" class="w-full md:w-auto flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              state.currentPage === "challenges"
                ? "bg-indigo-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              <span class="font-medium">Herausforderungen</span>
            </button>
            <button onclick="navigateTo('players')" class="w-full md:w-auto flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              state.currentPage === "players"
                ? "bg-indigo-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }">
              ${icons.usergroup}
              <span class="font-medium">Spieler</span>
            </button>
            
            ${
              state.user
                ? `
                <button onclick="navigateTo('admin')" class="w-full md:w-auto flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  state.currentPage === "admin"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }">
                  ${icons.settings}
                  <span class="font-medium">Admin</span>
                </button>
                <button onclick="handleLogout()" class="w-full md:w-auto flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  ${icons.logout}
                  <span>Logout</span>
                </button>
              `
                : `
                <button onclick="navigateTo('admin')" class="w-full md:w-auto flex items-center space-x-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                  ${icons.login}
                  <span>Admin Login</span>
                </button>
              `
            }
          </div>
        </div>
      </div>
    </nav>
  `;
}