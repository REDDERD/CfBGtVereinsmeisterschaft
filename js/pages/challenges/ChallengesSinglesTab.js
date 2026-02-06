// js/pages/challenges/ChallengesSinglesTab.js
// Einzel-Herausforderungen Tab

function ChallengesSinglesTab() {
  if (state.knockoutPhaseActive) {
    return `
      <div class="p-3 bg-blue-50 border border-blue-300 rounded-lg">
        <p class="text-sm text-blue-800">Die Gruppenphase ist beendet. Einzel-Herausforderungen sind nur während der Gruppenphase möglich.</p>
      </div>`;
  }

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
    let p1Sets = 0,
      p2Sets = 0;

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

    const hinspiel = matches[0]
      ? getMatchResult(matches[0], p1.id, p2.id)
      : null;
    const rueckspiel = matches[1]
      ? getMatchResult(matches[1], p1.id, p2.id)
      : null;

    return `
      <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
        <div class="text-center mb-3">
          <h3 class="font-bold text-gray-800">${p1.name} <span class="text-gray-500">vs</span> ${p2.name}</h3>
          <p class="text-xs text-gray-500">Gruppe ${groupNum}</p>
        </div>
        
        <div class="space-y-2">
          <!-- Hinspiel -->
          <div class="border rounded p-2 ${hinspiel ? "bg-gray-50" : "bg-white"}">
            <div class="text-xs font-semibold text-gray-600 mb-1">Hinspiel</div>
            ${
              hinspiel
                ? `
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm ${hinspiel.p1Sets > hinspiel.p2Sets ? "font-bold text-green-600" : "text-gray-700"}">${p1.name}</span>
                <span class="text-lg font-bold">${hinspiel.p1Sets} : ${hinspiel.p2Sets}</span>
                <span class="text-sm ${hinspiel.p2Sets > hinspiel.p1Sets ? "font-bold text-green-600" : "text-gray-700"}">${p2.name}</span>
              </div>
              <div class="text-xs text-gray-600 text-center">
                ${hinspiel.setDetails.map((set) => `${set.p1}:${set.p2}`).join(", ")}
              </div>
              <div class="text-xs text-gray-500 text-center mt-2">
                ${new Date(hinspiel.date.seconds * 1000).toLocaleDateString("de-DE")}
              </div>
            `
                : `
              ${
                state.user
                  ? `
                <button 
                  onclick="openSinglesMatchEntryForChallenge('${p1.id}', '${p2.id}')"
                  class="w-full px-3 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
                >
                  Ergebnis eintragen
                </button>
              `
                  : `
                <div class="text-center text-sm text-gray-400">Noch nicht gespielt</div>
              `
              }
            `
            }
          </div>
          
          <!-- Rückspiel -->
          <div class="border rounded p-2 ${rueckspiel ? "bg-gray-50" : "bg-white"}">
            <div class="text-xs font-semibold text-gray-600 mb-1">Rückspiel</div>
            ${
              rueckspiel
                ? `
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm ${rueckspiel.p1Sets > rueckspiel.p2Sets ? "font-bold text-green-600" : "text-gray-700"}">${p1.name}</span>
                <span class="text-lg font-bold">${rueckspiel.p1Sets} : ${rueckspiel.p2Sets}</span>
                <span class="text-sm ${rueckspiel.p2Sets > rueckspiel.p1Sets ? "font-bold text-green-600" : "text-gray-700"}">${p2.name}</span>
              </div>
              <div class="text-xs text-gray-600 text-center space-y-1">
                ${rueckspiel.setDetails.map((set) => `${set.p1}:${set.p2}`).join(", ")}
              </div>
              <div class="text-xs text-gray-500 text-center mt-2">
                ${new Date(rueckspiel.date.seconds * 1000).toLocaleDateString("de-DE")}
              </div>
            `
                : `
              ${
                state.user && hinspiel
                  ? `
                <button 
                  onclick="openSinglesMatchEntryForChallenge('${p1.id}', '${p2.id}')"
                  class="w-full px-3 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
                >
                  Ergebnis eintragen
                </button>
              `
                  : `
                <div class="text-center text-sm text-gray-400">${hinspiel ? "Noch nicht gespielt" : "Hinspiel zuerst"}</div>
              `
              }
            `
            }
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div>
      <!-- Suchfeld -->
      <div class="mb-6">
        <input 
          type="text" 
          id="challengesSinglesSearchInput" 
          placeholder="Nach Spielername suchen..." 
          value="${searchQuery}" 
          onkeyup="updateChallengesSinglesSearch(this.value)" 
          class="w-full px-4 py-2 border border-gray-300 rounded-lg"
        >
      </div>
      
      ${
        filteredGroup1.length === 0 && filteredGroup2.length === 0
          ? `
        <div class="text-center py-8 text-gray-500">
          Keine Paarungen gefunden
        </div>
      `
          : `
        <!-- Gruppe 1 -->
        ${
          filteredGroup1.length > 0
            ? `
          <div class="mb-8">
            <h3 class="text-lg font-bold text-gray-700 mb-4">Gruppe 1</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              ${filteredGroup1.map((matchup) => renderMatchupCard(matchup, 1)).join("")}
            </div>
          </div>
        `
            : ""
        }
        
        <!-- Gruppe 2 -->
        ${
          filteredGroup2.length > 0
            ? `
          <div>
            <h3 class="text-lg font-bold text-gray-700 mb-4">Gruppe 2</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              ${filteredGroup2.map((matchup) => renderMatchupCard(matchup, 2)).join("")}
            </div>
          </div>
        `
            : ""
        }
      `
      }
    </div>
  `;
}
