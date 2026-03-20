// js/pages/challenges/ChallengesSinglesTab.js
// Einzel-Herausforderungen Tab - Mobile-First

function ChallengesSinglesTab() {
  const group1Players = getGroupPlayers(1);
  const group2Players = getGroupPlayers(2);

  function generateMatchups(players) {
    const matchups = [];
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        matchups.push({
          player1: players[i],
          player2: players[j],
        });
      }
    }
    return matchups;
  }

  const group1Matchups = generateMatchups(group1Players);
  const group2Matchups = generateMatchups(group2Players);

  const searchQuery = state.challengesSinglesSearchQuery || "";

  function filterMatchups(matchups) {
    if (!searchQuery) return matchups;
    return matchups.filter((matchup) => {
      const p1Name = matchup.player1.name.toLowerCase();
      const p2Name = matchup.player2.name.toLowerCase();
      const query = searchQuery.toLowerCase();
      return p1Name.includes(query) || p2Name.includes(query);
    });
  }

  const filteredGroup1 = filterMatchups(group1Matchups);
  const filteredGroup2 = filterMatchups(group2Matchups);

  function getMatchesForPairing(p1Id, p2Id) {
    const matches = state.singlesMatches.filter(
      (match) =>
        (match.player1Id === p1Id && match.player2Id === p2Id) ||
        (match.player1Id === p2Id && match.player2Id === p1Id),
    );

    const sortedMatches = matches
      .filter((m) => m.date && m.date.seconds)
      .sort((a, b) => a.date.seconds - b.date.seconds)
      .slice(0, 2);

    return sortedMatches;
  }

  function getMatchResult(match, p1Id, p2Id) {
    if (!match || !match.sets) return null;

    const sets = match.sets;
    let p1Sets = 0, p2Sets = 0;

    sets.forEach((set) => {
      if (set.p1 > set.p2) p1Sets++;
      else p2Sets++;
    });

    const isP1Player1 = match.player1Id === p1Id;
    const p1SetsActual = isP1Player1 ? p1Sets : p2Sets;
    const p2SetsActual = isP1Player1 ? p2Sets : p1Sets;

    const setDetails = sets.map((set) => {
      if (isP1Player1) {
        return { p1: set.p1, p2: set.p2 };
      } else {
        return { p1: set.p2, p2: set.p1 };
      }
    });

    return {
      p1Sets: p1SetsActual,
      p2Sets: p2SetsActual,
      setDetails: setDetails,
      date: match.date,
    };
  }

  function renderMatchupCard(matchup, groupNum) {
    const p1 = matchup.player1;
    const p2 = matchup.player2;
    const matches = getMatchesForPairing(p1.id, p2.id);

    const hinspiel = matches[0] ? getMatchResult(matches[0], p1.id, p2.id) : null;
    const rueckspiel = matches[1] ? getMatchResult(matches[1], p1.id, p2.id) : null;

    function renderMatchSlot(label, result, canEnter) {
      if (result) {
        return `
          <div class="border rounded p-2 bg-gray-50">
            <div class="text-[10px] font-semibold text-gray-500 mb-1">${label}</div>
            <div class="flex items-center justify-between gap-1">
              <span class="text-xs truncate ${result.p1Sets > result.p2Sets ? "font-bold text-green-600" : "text-gray-600"}">${p1.name}</span>
              <span class="text-sm font-bold flex-shrink-0">${result.p1Sets}:${result.p2Sets}</span>
              <span class="text-xs truncate text-right ${result.p2Sets > result.p1Sets ? "font-bold text-green-600" : "text-gray-600"}">${p2.name}</span>
            </div>
            <div class="text-[10px] text-gray-500 text-center mt-1">
              ${result.setDetails.map((set) => `${set.p1}:${set.p2}`).join(", ")}
              <span class="ml-1">${new Date(result.date.seconds * 1000).toLocaleDateString("de-DE")}</span>
            </div>
          </div>`;
      }

      if (canEnter && state.user && !state.knockoutPhaseActive) {
        return `
          <div class="border rounded p-2">
            <div class="text-[10px] font-semibold text-gray-500 mb-1">${label}</div>
            <button
              onclick="openSinglesMatchEntryForChallenge('${p1.id}', '${p2.id}')"
              class="w-full px-2 py-1.5 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition-colors">
              Eintragen
            </button>
          </div>`;
      }

      return `
        <div class="border rounded p-2">
          <div class="text-[10px] font-semibold text-gray-500 mb-1">${label}</div>
          <div class="text-center text-xs text-gray-400 py-1">
            ${state.knockoutPhaseActive ? 'Nicht gespielt' : label === 'Rückspiel' && !hinspiel ? 'Hinspiel zuerst' : 'Ausstehend'}
          </div>
        </div>`;
    }

    return `
      <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow">
        <div class="text-center mb-2">
          <h3 class="font-bold text-gray-800 text-sm">
            <span class="truncate">${p1.name}</span>
            <span class="text-gray-400 mx-1">vs</span>
            <span class="truncate">${p2.name}</span>
          </h3>
          <p class="text-[10px] text-gray-400">Gruppe ${groupNum}</p>
        </div>

        <div class="space-y-1.5">
          ${renderMatchSlot('Hinspiel', hinspiel, true)}
          ${renderMatchSlot('Rückspiel', rueckspiel, !!hinspiel)}
        </div>
      </div>
    `;
  }

  return `
    <div>
      ${state.knockoutPhaseActive ? `
        <div class="mb-4 p-2.5 bg-blue-50 border border-blue-300 rounded-lg">
          <p class="flex items-center gap-2 text-xs sm:text-sm text-blue-800">
            ${icons.info}
            <span>Die Gruppenphase ist beendet.</span>
          </p>
        </div>
      ` : ""}

      <div class="mb-4">
        <input
          type="text"
          id="challengesSinglesSearchInput"
          placeholder="Spieler suchen..."
          value="${searchQuery}"
          onkeyup="updateChallengesSinglesSearch(this.value)"
          class="w-full px-3 py-2.5 border border-gray-300 rounded-lg">
      </div>

      ${filteredGroup1.length === 0 && filteredGroup2.length === 0
        ? `<div class="text-center py-6 text-gray-500 text-sm">Keine Paarungen gefunden</div>`
        : `
        ${filteredGroup1.length > 0 ? `
          <div class="mb-6">
            <h3 class="text-sm sm:text-base font-bold text-gray-700 mb-3">Gruppe 1</h3>
            <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              ${filteredGroup1.map((matchup) => renderMatchupCard(matchup, 1)).join("")}
            </div>
          </div>
        ` : ""}

        ${filteredGroup2.length > 0 ? `
          <div>
            <h3 class="text-sm sm:text-base font-bold text-gray-700 mb-3">Gruppe 2</h3>
            <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              ${filteredGroup2.map((matchup) => renderMatchupCard(matchup, 2)).join("")}
            </div>
          </div>
        ` : ""}
      `}
    </div>
  `;
}
