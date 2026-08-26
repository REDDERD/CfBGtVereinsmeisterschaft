// js/components/MatchCard.js
// Zentrale UI-Komponente zum Anzeigen von Spielen - Mobile-First

function MatchCard(match, context = 'home') {
  const isAdmin = state.isAdmin;
  const isSingles = match.type === 'singles' || (match.player1Id && match.round);
  const isKnockout = match.round && match.round !== 'group1' && match.round !== 'group2';
  const status = match.status || 'confirmed';

  let dateStr = '';
  const matchDate = match.date
    ? new Date(match.date.seconds ? match.date.seconds * 1000 : match.date.toDate())
    : (match.createdAt ? new Date(match.createdAt.seconds * 1000) : null);
  if (matchDate) {
    dateStr = matchDate.toLocaleDateString('de-DE');
    if (context === 'admin') {
      dateStr += ` ${matchDate.toLocaleTimeString('de-DE')}`;
    }
  }

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
    const t1p2 = match.team1?.player2Id;
    const t2p2 = match.team2?.player2Id;
    player1Name = t1p2 ? `${getPlayerName(match.team1.player1Id)} / ${getPlayerName(t1p2)}` : getPlayerName(match.team1.player1Id);
    player2Name = t2p2 ? `${getPlayerName(match.team2.player1Id)} / ${getPlayerName(t2p2)}` : getPlayerName(match.team2.player1Id);
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

  const player1Wins = player1Sets > player2Sets;
  const player2Wins = player2Sets > player1Sets;

  const getTypeBadge = () => {
    return isSingles
      ? '<span class="px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold rounded bg-yellow-100 text-yellow-800 border border-yellow-300">Einzel</span>'
      : '<span class="px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold rounded bg-blue-100 text-blue-800 border border-blue-300">Doppel</span>';
  };

  const getStatusBadge = () => {
    if (context !== 'admin' && context !== 'matches') return '';
    if (context === 'matches' && status !== 'unconfirmed') return '';

    const statusMap = {
      unconfirmed: { label: 'Offen', color: 'bg-orange-100 text-orange-800 border-orange-300' },
      confirmed: { label: 'OK', color: 'bg-green-100 text-green-800 border-green-300' },
      rejected: { label: 'Abgelehnt', color: 'bg-red-100 text-red-800 border-red-300' }
    };
    const s = statusMap[status] || statusMap['confirmed'];
    return `<span class="px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold rounded border ${s.color}">${s.label}</span>`;
  };

  const getWalkoverBadge = () => {
    if (!match.walkover) return '';
    return '<span class="px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold rounded bg-gray-100 text-gray-500 border border-gray-300">Kampflos</span>';
  };

  const getKnockoutBadge = () => {
    if (!isKnockout) return '';
    const roundNames = {
      'final': 'Finale', 'semifinal': 'HF', 'semi': 'HF',
      'quarterfinal': 'VF', 'quarter': 'VF', 'round16': 'AF', 'thirdPlace': 'Pl.3'
    };
    const roundName = roundNames[match.round] || match.round;
    return `<span class="px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold rounded bg-purple-100 text-purple-800 border border-purple-300">${roundName}</span>`;
  };

  const getButtons = () => {
    if (!isAdmin) return '';

    if (context === 'admin') {
      const matchType = isSingles ? 'singles' : 'doubles';
      const editFunction = isSingles ? 'editSinglesMatch' : 'editDoublesMatch';
      const deleteFunction = isSingles ? 'deleteSinglesMatch' : 'deleteDoublesMatch';

      const statusButtons = [];
      if (status !== 'confirmed') {
        statusButtons.push(`<button onclick="updateMatchStatus('${match.id}', '${matchType}', 'confirmed')" class="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700" title="Bestätigen">${icons.check}</button>`);
      }
      if (status !== 'rejected') {
        statusButtons.push(`<button onclick="updateMatchStatus('${match.id}', '${matchType}', 'rejected')" class="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700" title="Ablehnen">${icons.x}</button>`);
      }
      if (status !== 'unconfirmed') {
        statusButtons.push(`<button onclick="updateMatchStatus('${match.id}', '${matchType}', 'unconfirmed')" class="p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700" title="Offen">${icons.exclamation_triangle}</button>`);
      }

      return `
        <div class="flex gap-1.5 flex-shrink-0 flex-wrap justify-end">
          ${statusButtons.slice(0, 2).join('')}
          <button onclick="${editFunction}('${match.id}')" class="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" title="Bearbeiten">${icons.edit}</button>
          <button onclick="${deleteFunction}('${match.id}')" class="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700" title="Löschen">${icons.trash}</button>
        </div>
      `;
    }
    return '';
  };

  return `
    <div class="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-gray-300 transition-colors">
      <div class="flex items-start justify-between gap-2">
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-center gap-1 mb-1.5">
            ${getTypeBadge()}
            ${getKnockoutBadge()}
            ${getWalkoverBadge()}
            ${getStatusBadge()}
            ${dateStr ? `<span class="text-xs text-gray-400">${dateStr}</span>` : ''}
          </div>

          <!-- Score display - compact for mobile -->
          <div class="flex items-center gap-1.5 text-sm sm:text-base mb-0.5">
            <span class="truncate ${player1Wins ? 'text-green-600 font-bold' : 'font-medium text-gray-800'}">${player1Name}</span>
            <span class="flex-shrink-0">
              <span class="text-indigo-600 font-bold">${player1Sets}</span>
              <span class="text-gray-400 mx-0.5">:</span>
              <span class="text-indigo-600 font-bold">${player2Sets}</span>
            </span>
          </div>
          <div class="flex items-center gap-1.5 text-sm sm:text-base">
            <span class="truncate ${player2Wins ? 'text-green-600 font-bold' : 'font-medium text-gray-800'}">${player2Name}</span>
          </div>
          <div class="text-xs text-gray-500 mt-1">${scoreText}</div>
        </div>

        ${getButtons()}
      </div>
    </div>
  `;
}
