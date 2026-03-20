// js/components/Navigation.js
// Navigation Komponente - Mobile-First mit Bottom Tab Bar

function Navigation() {
  const navItems = [
    { id: 'home', label: 'Home', icon: icons.home || '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4"/></svg>' },
    { id: 'singles', label: 'Einzel', icon: icons.user },
    { id: 'doubles', label: 'Doppel', icon: icons.users },
    { id: 'challenges', label: 'Spiele', icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>' },
    { id: 'more', label: 'Mehr', icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>' },
  ];

  const moreItems = [
    { id: 'challenges', label: 'Herausforderungen', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>' },
    { id: 'statistics', label: 'Statistiken', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>' },
    { id: 'matches', label: 'Alle Spiele', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>' },
    { id: 'players', label: 'Spieler', icon: icons.usergroup },
  ];

  // Check if current page is one of the "more" pages
  const isMorePage = ['challenges', 'statistics', 'players'].includes(state.currentPage);

  // Desktop Navigation (top bar)
  const desktopNav = `
    <nav class="bg-white shadow-lg hidden md:block">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <div class="cursor-pointer flex items-center" onclick="navigateTo('home')">
            <img src="logo.gif" alt="CfB Gütersloh Logo" class="h-12" />
          </div>

          <div class="flex items-center space-x-1">
            <button onclick="navigateTo('singles')" class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              state.currentPage === "singles" ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-100"
            }">
              ${icons.user}
              <span class="font-medium">Einzel</span>
            </button>
            <button onclick="navigateTo('doubles')" class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              state.currentPage === "doubles" ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-100"
            }">
              ${icons.users}
              <span class="font-medium">Doppel</span>
            </button>
            <button onclick="navigateTo('challenges')" class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              state.currentPage === "challenges" ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-100"
            }">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              <span class="font-medium">Herausforderungen</span>
            </button>
            <button onclick="navigateTo('statistics')" class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              state.currentPage === "statistics" ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-100"
            }">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              <span class="font-medium">Statistiken</span>
            </button>
            <button onclick="navigateTo('matches')" class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              state.currentPage === "matches" ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-100"
            }">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
              <span class="font-medium">Spiele</span>
            </button>
            <button onclick="navigateTo('players')" class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              state.currentPage === "players" ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-100"
            }">
              ${icons.usergroup}
              <span class="font-medium">Spieler</span>
            </button>

            ${state.user
              ? `
                ${state.isAdmin ? `
                  <button onclick="navigateTo('admin')" class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    state.currentPage === "admin" ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-100"
                  }">
                    ${icons.settings}
                    <span class="font-medium">Admin</span>
                  </button>
                ` : ''}
                <button onclick="handleLogout()" class="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  ${icons.logout}
                  <span>Logout</span>
                </button>
              `
              : `
                <button onclick="navigateTo('admin')" class="flex items-center space-x-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
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

  // Mobile Bottom Tab Bar
  const mobileBottomBar = `
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div class="grid grid-cols-5 h-16">
        <button onclick="navigateTo('singles')" class="flex flex-col items-center justify-center gap-0.5 ${
          state.currentPage === 'singles' ? 'text-indigo-600' : 'text-gray-500'
        }">
          ${icons.user.replace('size-6', 'w-5 h-5')}
          <span class="text-[10px] font-medium">Einzel</span>
        </button>
        <button onclick="navigateTo('doubles')" class="flex flex-col items-center justify-center gap-0.5 ${
          state.currentPage === 'doubles' ? 'text-indigo-600' : 'text-gray-500'
        }">
          ${icons.users.replace('size-6', 'w-5 h-5')}
          <span class="text-[10px] font-medium">Doppel</span>
        </button>
        <button onclick="navigateTo('matches')" class="flex flex-col items-center justify-center gap-0.5 ${
          state.currentPage === 'matches' ? 'text-indigo-600' : 'text-gray-500'
        }">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          <span class="text-[10px] font-medium">Spiele</span>
        </button>
        <button onclick="toggleMobileMore()" class="flex flex-col items-center justify-center gap-0.5 ${
          isMorePage || state.mobileMoreOpen ? 'text-indigo-600' : 'text-gray-500'
        }">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"/></svg>
          <span class="text-[10px] font-medium">Mehr</span>
        </button>
        ${state.user
          ? `
            <button onclick="handleLogout()" class="flex flex-col items-center justify-center gap-0.5 text-red-500">
              ${icons.logout.replace('size-5', 'w-5 h-5')}
              <span class="text-[10px] font-medium">Logout</span>
            </button>
          `
          : `
            <button onclick="navigateTo('admin')" class="flex flex-col items-center justify-center gap-0.5 ${
              state.currentPage === 'admin' ? 'text-indigo-600' : 'text-gray-500'
            }">
              ${icons.login.replace('size-5', 'w-5 h-5')}
              <span class="text-[10px] font-medium">Login</span>
            </button>
          `
        }
      </div>
    </nav>

    ${state.mobileMoreOpen ? `
      <div class="md:hidden fixed inset-0 z-40" onclick="closeMobileMore()">
        <div class="absolute inset-0 bg-black bg-opacity-30"></div>
        <div class="absolute bottom-16 left-0 right-0 bg-white rounded-t-2xl shadow-2xl p-4 safe-area-bottom" onclick="event.stopPropagation()">
          <div class="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <div class="grid grid-cols-3 gap-3">
            <button onclick="closeMobileMore(); navigateTo('challenges')" class="flex flex-col items-center gap-1.5 p-3 rounded-xl ${
              state.currentPage === 'challenges' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'
            }">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              <span class="text-xs font-medium">Heraus&shy;forderungen</span>
            </button>
            <button onclick="closeMobileMore(); navigateTo('statistics')" class="flex flex-col items-center gap-1.5 p-3 rounded-xl ${
              state.currentPage === 'statistics' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'
            }">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              <span class="text-xs font-medium">Statistiken</span>
            </button>
            <button onclick="closeMobileMore(); navigateTo('players')" class="flex flex-col items-center gap-1.5 p-3 rounded-xl ${
              state.currentPage === 'players' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'
            }">
              ${icons.usergroup}
              <span class="text-xs font-medium">Spieler</span>
            </button>
            ${state.user && state.isAdmin ? `
              <button onclick="closeMobileMore(); navigateTo('admin')" class="flex flex-col items-center gap-1.5 p-3 rounded-xl ${
                state.currentPage === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'
              }">
                ${icons.settings}
                <span class="text-xs font-medium">Admin</span>
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    ` : ''}
  `;

  // Mobile top bar (minimal)
  const mobileTopBar = `
    <header class="md:hidden bg-white shadow-sm px-4 py-3 flex items-center justify-center">
      <div class="cursor-pointer flex items-center" onclick="navigateTo('home')">
        <img src="logo.gif" alt="CfB Gütersloh Logo" class="h-8" />
      </div>
    </header>
  `;

  return `
    ${desktopNav}
    ${mobileTopBar}
    ${mobileBottomBar}
  `;
}
