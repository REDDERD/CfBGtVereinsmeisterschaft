// js/pages/HomePage.js

function HomePage() {
  // Kombiniere alle Spiele: Singles, KO und Doubles
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
  
  // Sortiere nach Datum und nimm die letzten 5
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

  // Zähle unbestätigte Spiele (nur für Admins sichtbar)
  const unconfirmedSingles = state.isAdmin ? state.singlesMatches.filter(m => m.status === 'unconfirmed').length : 0;
  const unconfirmedDoubles = state.isAdmin ? state.doublesMatches.filter(m => m.status === 'unconfirmed').length : 0;
  const totalUnconfirmed = unconfirmedSingles + unconfirmedDoubles;

  return `
    <div class="space-y-8">
      <div class="text-center">
        <h2 class="text-2xl md:text-4xl font-bold text-gray-800 mb-4">Willkommen zur Vereinsmeisterschaft</h2>
        <p class="text-lg md:text-xl text-gray-600">Aktuell ${state.players.length} registrierte Spieler</p>
      </div>
      
      ${state.isAdmin && totalUnconfirmed > 0 ? `
        <div class="bg-orange-50 border-2 border-orange-400 rounded-xl shadow-lg p-6">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="text-xl md:text-2xl font-bold text-gray-800 mb-2">Neue Spiele zum Bestätigen</h3>
              <p class="text-gray-700 mb-4">
                Es gibt ${totalUnconfirmed} unbestätigte${totalUnconfirmed === 1 ? 's' : ''} Spiel${totalUnconfirmed === 1 ? '' : 'e'}:
                ${unconfirmedSingles > 0 ? `${unconfirmedSingles} Einzel` : ''}
                ${unconfirmedSingles > 0 && unconfirmedDoubles > 0 ? ' und ' : ''}
                ${unconfirmedDoubles > 0 ? `${unconfirmedDoubles} Doppel` : ''}
              </p>
              <button 
                onclick="navigateTo('admin'); state.adminTab = 'matchApproval'; render();" 
                class="px-6 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold transition-colors">
                Spiele überprüfen
              </button>
            </div>
            <div class="ml-4">
              <svg class="w-12 h-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
          </div>
        </div>
      ` : ''}
      
      ${upcomingChallenges.length > 0 ? `
        <div class="bg-yellow-50 border-2 border-yellow-400 rounded-xl shadow-lg p-6">
          <h3 class="text-xl md:text-2xl font-bold text-gray-800 mb-4">Anstehende Herausforderungen</h3>
          <div class="space-y-3">
            ${upcomingChallenges.map((challenge) => {
              const challengeDate = challenge.date?.seconds || 0;
              const date = new Date(challengeDate * 1000);
              const isOverdue = challengeDate < todayTimestamp;
              const dateStr = date.toLocaleDateString("de-DE");
              return `
                <div class="p-4 ${isOverdue ? "bg-red-100 border-red-500" : "bg-white border-yellow-500"} border-l-4 rounded-lg">
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="font-bold text-gray-800">${getPlayerName(challenge.challengerId)} vs ${getPlayerName(challenge.challengedId)}</div>
                      <div class="text-sm ${isOverdue ? "text-red-600 font-semibold" : "text-gray-600"}">${dateStr} ${isOverdue ? "ÜBERFÄLLIG" : "Heute"}</div>
                    </div>
                    ${state.user && !state.knockoutPhaseActive ? "<button onclick='enterResultFromChallenge(\"" + challenge.id + "\")' class='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm'>Ergebnis eintragen</button>" : "" }
                  </div>
                </div>`;
            }).join("")}
          </div>
        </div>
      ` : ""}
      
      <div class="grid md:grid-cols-2 gap-6">
        <div onclick="navigateTo('singles')" class="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-shadow">
          <div class="flex items-center space-x-4 mb-4">
            <div class="text-yellow-500">${icons.user}</div>
            <h3 class="text-xl md:text-2xl font-bold text-gray-800">Einzel-Turnier</h3>
          </div>
          <p class="text-gray-600">Gruppenphasen mit anschließendem K.O.-System</p>
        </div>
        
        <div onclick="navigateTo('doubles')" class="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-shadow">
          <div class="flex items-center space-x-4 mb-4">
            <div class="text-blue-500">${icons.users}</div>
            <h3 class="text-xl md:text-2xl font-bold text-gray-800">Doppel-Pyramide</h3>
          </div>
          <p class="text-gray-600">Herausforderungs-System mit dynamischer Rangfolge</p>
        </div>
      </div>
      
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h3 class="text-xl md:text-2xl font-bold text-gray-800 mb-4">Letzte Ergebnisse</h3>
        ${recentMatches.length === 0 ? `
          <p class="text-gray-500 text-center py-8">Noch keine Spiele eingetragen</p>
        ` : `
          <div class="space-y-3">
            ${recentMatches.map(match => MatchCard(match, 'home')).join('')}
          </div>
        `}
      </div>
    </div>`;
}