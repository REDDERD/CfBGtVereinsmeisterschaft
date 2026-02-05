// js/components/MatchCard.js
// Zentrale UI-Komponente zum Anzeigen von Spielen

/**
 * Zentrale Komponente zur Anzeige eines Spiels
 * @param {Object} match - Das Spiel-Objekt
 * @param {string} context - Kontext: 'home', 'matches', 'admin'
 * @returns {string} HTML-String der Match-Card
 */
function MatchCard(match, context = 'home') {
  const isAdmin = state.isAdmin;
  const isSingles = match.type === 'singles' || match.player1Id; // Fallback für alte Spiele ohne type
  const status = match.status || 'confirmed';
  
  // Datum formatieren
  const dateStr = match.date 
    ? new Date(match.date.seconds ? match.date.seconds * 1000 : match.date.toDate()).toLocaleDateString('de-DE')
    : '';
  
  // Spieler-Namen und Score ermitteln
  let player1Name, player2Name, scoreText, player1Sets, player2Sets;
  
  if (isSingles) {
    player1Name = getPlayerName(match.player1Id);
    player2Name = getPlayerName(match.player2Id);
    scoreText = match.sets ? match.sets.map(s => `${s.p1}:${s.p2}`).join(', ') : 'Ausstehend';
    player1Sets = 0;
    player2Sets = 0;
    if (match.sets) {
      match.sets.forEach(set => {
        if (set.p1 > set.p2) player1Sets++;
        else player2Sets++;
      });
    }
  } else {
    player1Name = `${getPlayerName(match.team1.player1Id)} / ${getPlayerName(match.team1.player2Id)}`;
    player2Name = `${getPlayerName(match.team2.player1Id)} / ${getPlayerName(match.team2.player2Id)}`;
    scoreText = match.sets ? match.sets.map(s => `${s.t1}:${s.t2}`).join(', ') : 'Ausstehend';
    player1Sets = 0;
    player2Sets = 0;
    if (match.sets) {
      match.sets.forEach(set => {
        if (set.t1 > set.t2) player1Sets++;
        else player2Sets++;
      });
    }
  }
  
  // Gewinner ermitteln
  const hasWinner = player1Sets !== player2Sets;
  const player1Wins = player1Sets > player2Sets;
  const player2Wins = player2Sets > player1Sets;
  
  // Badge-Funktionen
  const getTypeBadge = () => {
    return isSingles
      ? '<span class="px-2 py-1 text-xs font-semibold rounded border bg-yellow-100 text-yellow-800 border-yellow-300">Einzel</span>'
      : '<span class="px-2 py-1 text-xs font-semibold rounded border bg-blue-100 text-blue-800 border-blue-300">Doppel</span>';
  };
  
  const getStatusBadge = () => {
    if (context !== 'admin') return '';
    
    const statusMap = {
      unconfirmed: {
        label: 'Unbestätigt',
        color: 'bg-orange-100 text-orange-800 border-orange-300'
      },
      confirmed: {
        label: 'Bestätigt',
        color: 'bg-green-100 text-green-800 border-green-300'
      },
      rejected: {
        label: 'Abgelehnt',
        color: 'bg-red-100 text-red-800 border-red-300'
      }
    };
    const s = statusMap[status] || statusMap['confirmed'];
    return `<span class="px-2 py-1 text-xs font-semibold rounded border ${s.color}">${s.label}</span>`;
  };
  
  const getKnockoutBadge = () => {
    if (!match.knockoutRound) return '';
    
    const roundNames = {
      'final': 'Finale',
      'semifinal': 'Halbfinale',
      'quarterfinal': 'Viertelfinale',
      'round16': 'Achtelfinale'
    };
    
    const roundName = roundNames[match.knockoutRound] || match.knockoutRound;
    return `<span class="px-2 py-1 text-xs font-semibold rounded border bg-purple-100 text-purple-800 border-purple-300">${roundName}</span>`;
  };
  
  // Buttons basierend auf Kontext
  const getButtons = () => {
    if (!isAdmin) return '';
    
    switch (context) {
      case 'home':
        return ''; // Keine Buttons auf der Homepage
        
      case 'matches':
        // Bearbeiten und Löschen Buttons
        const matchType = isSingles ? 'singles' : 'doubles';
        const editFunction = isSingles ? 'editSinglesMatch' : 'editDoublesMatch';
        const deleteFunction = isSingles ? 'deleteSinglesMatch' : 'deleteDoublesMatch';
        
        return `
          <div class="flex space-x-2 ml-4">
            <button 
              onclick="${editFunction}('${match.id}')" 
              class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
              title="Bearbeiten">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            <button 
              onclick="${deleteFunction}('${match.id}')" 
              class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
              title="Löschen">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        `;
        
      case 'admin':
        // Status-Buttons
        const buttons = [];
        
        if (status !== 'confirmed') {
          buttons.push(`
            <button 
              onclick="updateMatchStatus('${match.id}', '${isSingles ? 'singles' : 'doubles'}', 'confirmed')" 
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              title="Bestätigen">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </button>
          `);
        }
        
        if (status !== 'rejected') {
          buttons.push(`
            <button 
              onclick="updateMatchStatus('${match.id}', '${isSingles ? 'singles' : 'doubles'}', 'rejected')" 
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
              title="Ablehnen">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          `);
        }
        
        if (status !== 'unconfirmed') {
          buttons.push(`
            <button 
              onclick="updateMatchStatus('${match.id}', '${isSingles ? 'singles' : 'doubles'}', 'unconfirmed')" 
              class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center"
              title="Auf Unbestätigt setzen">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </button>
          `);
        }
        
        return `<div class="flex gap-2">${buttons.join('')}</div>`;
        
      default:
        return '';
    }
  };
  
  // HTML zusammenbauen
  return `
    <div class="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div class="flex-1">
          <!-- Badges -->
          <div class="flex flex-wrap items-center gap-2 mb-2">
            ${getTypeBadge()}
            ${getKnockoutBadge()}
            ${getStatusBadge()}
            ${dateStr ? `<span class="text-sm text-gray-500">${dateStr}</span>` : ''}
          </div>
          
          <!-- Spieler und Score -->
          <div class="font-medium text-gray-800 mb-1">
            <span class="${player1Wins ? 'text-green-600 font-bold' : ''}">${player1Name}</span>
            <span class="text-indigo-600 font-bold mx-2">${player1Sets}</span>
            <span class="text-gray-500">:</span>
            <span class="text-indigo-600 font-bold mx-2">${player2Sets}</span>
            <span class="${player2Wins ? 'text-green-600 font-bold' : ''}">${player2Name}</span>
          </div>
          
          <!-- Detaillierter Score -->
          <div class="text-sm text-gray-600">
            ${scoreText}
          </div>
        </div>
        
        <!-- Buttons -->
        ${getButtons()}
      </div>
    </div>
  `;
}