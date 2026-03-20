// js/pages/HomePage.js

function HomePage() {
  const allMatches = [
    ...state.singlesMatches.filter(match => match.status === 'confirmed').map(match => ({
      ...match,
      type: 'singles'
    })),
    ...state.knockoutMatches.map(match => ({
      ...match,
      type: 'knockout'
    })),
    ...state.doublesMatches.filter(match => match.status === 'confirmed').map(match => ({
      ...match,
      type: 'doubles'
    }))
  ];

  const recentMatches = allMatches
    .sort((a, b) => {
      const aTime = a.date?.seconds || a.createdAt?.seconds || 0;
      const bTime = b.date?.seconds || b.createdAt?.seconds || 0;
      return bTime - aTime;
    })
    .slice(0, 5);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime() / 1000;

  const upcomingChallenges = state.challenges.filter((c) => {
    if (c.status === "completed") return false;
    const challengeDate = c.date?.seconds || 0;
    return challengeDate <= todayTimestamp + 86400;
  });

  const unconfirmedSingles = state.isAdmin ? state.singlesMatches.filter(m => m.status === 'unconfirmed').length : 0;
  const unconfirmedDoubles = state.isAdmin ? state.doublesMatches.filter(m => m.status === 'unconfirmed').length : 0;
  const totalUnconfirmed = unconfirmedSingles + unconfirmedDoubles;

  return `
    <div class="space-y-4 sm:space-y-6">
      <div class="text-center">
        <h2 class="text-xl sm:text-2xl md:text-4xl font-bold text-gray-800">Vereinsmeisterschaft</h2>
      </div>

      ${(() => {
        const active = state.announcements.filter(a => a.active);
        if (active.length === 0) return '';
        return active.map(a => `
          <div class="relative rounded-xl overflow-hidden shadow-lg bg-gradient-to-r from-indigo-600 to-indigo-800">
            <div class="px-4 py-3 sm:px-6 sm:py-5 flex items-center gap-3">
              <div class="flex-shrink-0 relative flex items-center justify-center w-3 h-3">
                <div class="absolute w-3 h-3 rounded-full bg-white opacity-30 animate-ping"></div>
                <div class="w-2 h-2 rounded-full bg-white"></div>
              </div>
              <p class="text-white font-medium text-sm sm:text-base leading-relaxed">${renderAnnouncementText(a.text, 'font-bold underline underline-offset-2 hover:no-underline cursor-pointer')}</p>
            </div>
          </div>
        `).join('');
      })()}

      ${state.isAdmin && totalUnconfirmed > 0 ? `
        <div class="bg-orange-50 border-2 border-orange-400 rounded-xl shadow-lg p-4 sm:p-6">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1">
              <h3 class="text-lg sm:text-xl font-bold text-gray-800 mb-1">${totalUnconfirmed} unbestätigte${totalUnconfirmed === 1 ? 's' : ''} Spiel${totalUnconfirmed === 1 ? '' : 'e'}</h3>
              <p class="text-sm text-gray-600 mb-3">
                ${unconfirmedSingles > 0 ? `${unconfirmedSingles} Einzel` : ''}
                ${unconfirmedSingles > 0 && unconfirmedDoubles > 0 ? ', ' : ''}
                ${unconfirmedDoubles > 0 ? `${unconfirmedDoubles} Doppel` : ''}
              </p>
              <button
                onclick="navigateTo('admin'); state.adminTab = 'matchApproval'; render();"
                class="px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold transition-colors text-sm">
                Spiele überprüfen
              </button>
            </div>
            <svg class="w-8 h-8 sm:w-10 sm:h-10 text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
        </div>
      ` : ''}

      ${upcomingChallenges.length > 0 ? `
        <div class="bg-yellow-50 border-2 border-yellow-400 rounded-xl shadow-lg p-4 sm:p-6">
          <h3 class="text-lg sm:text-xl font-bold text-gray-800 mb-3">Anstehende Herausforderungen</h3>
          <div class="space-y-2">
            ${upcomingChallenges.map((challenge) => {
              const challengeDate = challenge.date?.seconds || 0;
              const date = new Date(challengeDate * 1000);
              const isOverdue = challengeDate < todayTimestamp;
              const dateStr = date.toLocaleDateString("de-DE");
              return `
                <div class="p-3 ${isOverdue ? "bg-red-100 border-red-500" : "bg-white border-yellow-500"} border-l-4 rounded-lg">
                  <div class="flex items-center justify-between gap-2">
                    <div class="min-w-0">
                      <div class="font-bold text-gray-800 text-sm sm:text-base truncate">${getPlayerName(challenge.challengerId)} vs ${getPlayerName(challenge.challengedId)}</div>
                      <div class="text-xs ${isOverdue ? "text-red-600 font-semibold" : "text-gray-600"}">${dateStr} ${isOverdue ? "ÜBERFÄLLIG" : "Heute"}</div>
                    </div>
                    ${state.user && !state.knockoutPhaseActive ? "<button onclick='enterResultFromChallenge(\"" + challenge.id + "\")' class='px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs sm:text-sm flex-shrink-0'>Ergebnis</button>" : "" }
                  </div>
                </div>`;
            }).join("")}
          </div>
        </div>
      ` : ""}

      <div class="grid grid-cols-2 gap-3 sm:gap-6">
        <div onclick="navigateTo('singles')" class="bg-white rounded-xl shadow-lg p-4 sm:p-8 cursor-pointer hover:shadow-xl transition-shadow active:scale-[0.98]">
          <div class="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4">
            <div class="text-yellow-500">${icons.user}</div>
            <h3 class="text-base sm:text-xl md:text-2xl font-bold text-gray-800">Einzel</h3>
          </div>
          <p class="text-gray-600 text-xs sm:text-sm hidden sm:block">Gruppenphasen mit K.O.-System</p>
        </div>

        <div onclick="navigateTo('doubles')" class="bg-white rounded-xl shadow-lg p-4 sm:p-8 cursor-pointer hover:shadow-xl transition-shadow active:scale-[0.98]">
          <div class="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4">
            <div class="text-blue-500">${icons.users}</div>
            <h3 class="text-base sm:text-xl md:text-2xl font-bold text-gray-800">Doppel</h3>
          </div>
          <p class="text-gray-600 text-xs sm:text-sm hidden sm:block">Pyramiden-Herausforderungen</p>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h3 class="text-lg sm:text-xl font-bold text-gray-800 mb-3">Letzte Ergebnisse</h3>
        ${recentMatches.length === 0 ? `
          <p class="text-gray-500 text-center py-6 text-sm">Noch keine Spiele eingetragen</p>
        ` : `
          <div class="space-y-2">
            ${recentMatches.map(match => MatchCard(match, 'home')).join('')}
          </div>
        `}
      </div>
    </div>`;
}
