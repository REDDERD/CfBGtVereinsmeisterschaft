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
  const isSingles = match.type === 'singles' || (match.player1Id && match.round);
  const isKnockout = match.round && match.round !== 'group1' && match.round !== 'group2';
  const status = match.status || 'confirmed';
  
  // Datum formatieren
  let dateStr = '';
  if (match.date) {
    dateStr = new Date(match.date.seconds ? match.date.seconds * 1000 : match.date.toDate()).toLocaleDateString('de-DE');
  } else if (match.createdAt) {
    dateStr = new Date(match.createdAt.seconds * 1000).toLocaleDateString('de-DE');
  }
  
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
    if (isKnockout) {
      return '<span class="px-2 py-1 text-xs font-semibold rounded border bg-yellow-100 text-yellow-800 border-yellow-300">Einzel</span>';
    }
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
    if (!isKnockout) return '';
    
    const round = match.round;
    const roundNames = {
      'final': 'Finale',
      'semifinal': 'Halbfinale',
      'semi': 'Halbfinale',
      'quarterfinal': 'Viertelfinale',
      'quarter': 'Viertelfinale',
      'round16': 'Achtelfinale',
      'thirdPlace': 'Platz 3'
    };
    
    const roundName = roundNames[round] || round;
    return `<span class="px-2 py-1 text-xs font-semibold rounded border bg-purple-100 text-purple-800 border-purple-300">${roundName}</span>`;
  };
  
  // Buttons basierend auf Kontext
  const getButtons = () => {
    if (!isAdmin) return '';
    
    switch (context) {
      case 'home':
        return ''; // Keine Buttons auf der Homepage
        
      case 'matches':
        return ''; // Keine Buttons mehr auf der MatchesPage
        
      case 'admin':
        // 2x2 Grid mit Status-Buttons (oben) und Edit/Delete-Buttons (unten)
        // Bestimme den Match-Type für die Funktionsaufrufe
        const matchType = isSingles ? 'singles' : 'doubles';
        const editFunction = isSingles ? 'editSinglesMatch' : 'editDoublesMatch';
        const deleteFunction = isSingles ? 'deleteSinglesMatch' : 'deleteDoublesMatch';
        
        // Status-Buttons (nur die anzeigen, die nicht der aktuelle Status sind)
        const statusButtons = [];
        
        if (status !== 'confirmed') {
          statusButtons.push(`
            <button 
              onclick="updateMatchStatus('${match.id}', '${matchType}', 'confirmed')" 
              class="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              title="Bestätigen">${icons.check}
            </button>
          `);
        } else {
          statusButtons.push('<div></div>'); // Platzhalter
        }
        
        if (status !== 'rejected') {
          statusButtons.push(`
            <button 
              onclick="updateMatchStatus('${match.id}', '${matchType}', 'rejected')" 
              class="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
              title="Ablehnen">
              ${icons.x}
            </button>
          `);
        } else {
          statusButtons.push('<div></div>'); // Platzhalter
        }
        
        if (status !== 'unconfirmed') {
          statusButtons.push(`
            <button 
              onclick="updateMatchStatus('${match.id}', '${matchType}', 'unconfirmed')" 
              class="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center"
              title="Auf Unbestätigt setzen">
              ${icons.exclamation_triangle}
            </button>
          `);
        }
        
        // Wenn alle 3 Status-Buttons angezeigt werden sollen, zeige nur 2 (die wichtigsten)
        // um das Grid sauber zu halten
        const visibleStatusButtons = statusButtons.filter(btn => btn !== '<div></div>').slice(0, 2);
        
        // Fülle mit Platzhaltern auf, wenn nur 1 Status-Button
        while (visibleStatusButtons.length < 2) {
          visibleStatusButtons.push('<div></div>');
        }
        
        return `
          <div class="grid grid-cols-2 gap-2" style="min-width: 120px;">
            <!-- Zeile 1: Status-Buttons -->
            ${visibleStatusButtons.join('')}
            
            <!-- Zeile 2: Edit/Delete-Buttons -->
            <button 
              onclick="${editFunction}('${match.id}')" 
              class="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              title="Bearbeiten">
              ${icons.edit}
            </button>
            <button 
              onclick="${deleteFunction}('${match.id}')" 
              class="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
              title="Löschen">
              ${icons.trash}
            </button>
          </div>
        `;
        
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