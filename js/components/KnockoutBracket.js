// js/components/KnockoutBracket.js
// K.O.-Bracket Komponente - Mobile-First

function KnockoutBracketView() {
  const config = state.knockoutConfig || {};

  const getPositionPlayerId = (position) => {
    if (!position) return null;
    const [group, place] = position.split("p");
    const groupNum = group === "g1" ? 1 : 2;
    const placeNum = parseInt(place);
    if (state.frozenStandings) {
      const standings =
        groupNum === 1
          ? state.frozenStandings.group1
          : state.frozenStandings.group2;
      const player = standings[placeNum - 1];
      return player ? player.id : null;
    }
    const standings = calculateStandings(groupNum);
    const player = standings[placeNum - 1];
    return player ? player.id : null;
  };

  const getKnockoutMatch = (round, matchNum) =>
    state.knockoutMatches.find(
      (m) => m.round === round && m.matchNum === matchNum,
    );

  const getKnockoutMatchWinner = (round, matchNum) => {
    const match = getKnockoutMatch(round, matchNum);
    if (!match || !match.sets) return null;
    let p1Sets = 0,
      p2Sets = 0;
    match.sets.forEach((set) => {
      if (set.p1 > set.p2) p1Sets++;
      else p2Sets++;
    });
    return p1Sets > p2Sets ? match.player1Id : match.player2Id;
  };

  const getKnockoutMatchLoser = (round, matchNum) => {
    const match = getKnockoutMatch(round, matchNum);
    if (!match || !match.sets) return null;
    let p1Sets = 0,
      p2Sets = 0;
    match.sets.forEach((set) => {
      if (set.p1 > set.p2) p1Sets++;
      else p2Sets++;
    });
    return p1Sets > p2Sets ? match.player2Id : match.player1Id;
  };

  const getKnockoutMatchPlayers = (round, matchNum) => {
    if (round === "quarter") {
      const p1Pos = config[`qf_${matchNum}_p1`];
      const p2Pos = config[`qf_${matchNum}_p2`];
      const p1Id = getPositionPlayerId(p1Pos);
      const p2Id = getPositionPlayerId(p2Pos);
      return {
        player1Id: p1Id,
        player2Id: p2Id,
        player1Name: p1Id ? getPlayerName(p1Id) : "TBD",
        player2Name: p2Id ? getPlayerName(p2Id) : "TBD",
      };
    }
    if (round === "semi") {
      const p1 =
        matchNum === 1
          ? getKnockoutMatchWinner("quarter", 1)
          : getKnockoutMatchWinner("quarter", 3);
      const p2 =
        matchNum === 1
          ? getKnockoutMatchWinner("quarter", 2)
          : getKnockoutMatchWinner("quarter", 4);
      return {
        player1Id: p1,
        player2Id: p2,
        player1Name: p1
          ? getPlayerName(p1)
          : `Gew. VF ${matchNum === 1 ? 1 : 3}`,
        player2Name: p2
          ? getPlayerName(p2)
          : `Gew. VF ${matchNum === 1 ? 2 : 4}`,
      };
    }
    if (round === "thirdPlace") {
      const p1 = getKnockoutMatchLoser("semi", 1);
      const p2 = getKnockoutMatchLoser("semi", 2);
      return {
        player1Id: p1,
        player2Id: p2,
        player1Name: p1 ? getPlayerName(p1) : "Verl. HF 1",
        player2Name: p2 ? getPlayerName(p2) : "Verl. HF 2",
      };
    }
    if (round === "final") {
      const p1 = getKnockoutMatchWinner("semi", 1);
      const p2 = getKnockoutMatchWinner("semi", 2);
      return {
        player1Id: p1,
        player2Id: p2,
        player1Name: p1 ? getPlayerName(p1) : "Gew. HF 1",
        player2Name: p2 ? getPlayerName(p2) : "Gew. HF 2",
      };
    }
    return {
      player1Id: null,
      player2Id: null,
      player1Name: "TBD",
      player2Name: "TBD",
    };
  };

  const renderKnockoutMatchCard = (
    round,
    matchNum,
    title,
    borderColor = "blue",
  ) => {
    const match = getKnockoutMatch(round, matchNum);
    const players = getKnockoutMatchPlayers(round, matchNum);
    const isPlayed = match && match.sets;
    const canPlay = players.player1Id && players.player2Id;

    let winnerId = null;
    if (isPlayed) {
      let p1Sets = 0,
        p2Sets = 0;
      match.sets.forEach((set) => {
        if (set.p1 > set.p2) p1Sets++;
        else p2Sets++;
      });
      winnerId = p1Sets > p2Sets ? match.player1Id : match.player2Id;
    }

    const playerRow = (playerId, name, isPlayer1) => {
      const setScores = isPlayed ? match.sets.map((set) => {
        const playerScore = isPlayer1 ? set.p1 : set.p2;
        const opponentScore = isPlayer1 ? set.p2 : set.p1;
        const wonSet = playerScore > opponentScore;
        return `<span class="inline-block px-1.5 py-0.5 text-xs rounded ${wonSet ? 'border border-green-600 bg-white font-semibold' : 'bg-gray-100'}">${playerScore}</span>`;
      }).join('') : '';

      return `
      <div class="px-2.5 py-2 ${isPlayed && winnerId === playerId ? "bg-green-100 font-bold" : "bg-gray-50"} rounded text-sm flex justify-between items-center gap-2">
        <span class="truncate flex-1">${name}</span>
        ${isPlayed ? `<div class="flex gap-0.5 flex-shrink-0">${setScores}</div>` : ''}
      </div>`;
    };

    return `
      <div class="bg-white p-3 sm:p-4 rounded-lg border-2 border-${borderColor}-400">
        <div class="text-xs sm:text-sm font-medium text-gray-700 mb-2">${title}</div>
        <div class="space-y-1.5">
          ${playerRow(players.player1Id, players.player1Name, true)}
          <div class="text-center text-xs text-gray-400">vs</div>
          ${playerRow(players.player2Id, players.player2Name, false)}
        </div>
        ${
          !isPlayed && state.user && canPlay
            ? `
          <button onclick="openKnockoutMatchEntry('${round}', ${matchNum})" class="mt-2 w-full px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">Ergebnis eintragen</button>
        `
            : !isPlayed && state.user
              ? '<div class="mt-2 text-center text-xs text-gray-400">Warte auf vorherige Spiele</div>'
              : ""
        }
      </div>`;
  };

  return `
    <div class="space-y-4">
      ${state.knockoutEntryMatch ? KnockoutMatchEntryModal() : ""}
      <div class="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 sm:p-6 rounded-lg border-2 border-yellow-400">
        <h3 class="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-4">K.O.-Phase</h3>

        <!-- Viertelfinale: 2x2 grid on mobile, 4 cols on desktop -->
        <div class="mb-4">
          <h4 class="font-bold text-gray-700 mb-2 text-sm sm:text-base">Viertelfinale</h4>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            ${renderKnockoutMatchCard("quarter", 1, "VF 1")}
            ${renderKnockoutMatchCard("quarter", 2, "VF 2")}
            ${renderKnockoutMatchCard("quarter", 3, "VF 3")}
            ${renderKnockoutMatchCard("quarter", 4, "VF 4")}
          </div>
        </div>

        <!-- Halbfinale: 2 cols -->
        <div class="mb-4">
          <h4 class="font-bold text-gray-700 mb-2 text-sm sm:text-base">Halbfinale</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
            ${renderKnockoutMatchCard("semi", 1, "HF 1")}
            ${renderKnockoutMatchCard("semi", 2, "HF 2")}
          </div>
        </div>

        <!-- Finale & Platz 3 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
          ${renderKnockoutMatchCard("thirdPlace", 1, "Spiel um Platz 3", "amber")}
          ${renderKnockoutMatchCard("final", 1, "Finale", "yellow")}
        </div>
      </div>
    </div>`;
}

function KnockoutMatchEntryModal() {
  const { round, matchNum } = state.knockoutEntryMatch;
  const config = state.knockoutConfig || {};

  const getPositionPlayerId = (position) => {
    if (!position) return null;
    const [group, place] = position.split("p");
    const groupNum = group === "g1" ? 1 : 2;
    const placeNum = parseInt(place);
    if (state.frozenStandings) {
      const standings =
        groupNum === 1
          ? state.frozenStandings.group1
          : state.frozenStandings.group2;
      return standings[placeNum - 1]?.id || null;
    }
    return calculateStandings(groupNum)[placeNum - 1]?.id || null;
  };

  const getKnockoutMatch = (r, m) =>
    state.knockoutMatches.find(
      (match) => match.round === r && match.matchNum === m,
    );

  const getWinner = (r, m) => {
    const match = getKnockoutMatch(r, m);
    if (!match?.sets) return null;
    let p1 = 0,
      p2 = 0;
    match.sets.forEach((s) => {
      if (s.p1 > s.p2) p1++;
      else p2++;
    });
    return p1 > p2 ? match.player1Id : match.player2Id;
  };

  const getLoser = (r, m) => {
    const match = getKnockoutMatch(r, m);
    if (!match?.sets) return null;
    let p1 = 0,
      p2 = 0;
    match.sets.forEach((s) => {
      if (s.p1 > s.p2) p1++;
      else p2++;
    });
    return p1 > p2 ? match.player2Id : match.player1Id;
  };

  let player1Id, player2Id, player1Name, player2Name;

  if (round === "quarter") {
    player1Id = getPositionPlayerId(config[`qf_${matchNum}_p1`]);
    player2Id = getPositionPlayerId(config[`qf_${matchNum}_p2`]);
  } else if (round === "semi") {
    player1Id =
      matchNum === 1 ? getWinner("quarter", 1) : getWinner("quarter", 3);
    player2Id =
      matchNum === 1 ? getWinner("quarter", 2) : getWinner("quarter", 4);
  } else if (round === "thirdPlace") {
    player1Id = getLoser("semi", 1);
    player2Id = getLoser("semi", 2);
  } else if (round === "final") {
    player1Id = getWinner("semi", 1);
    player2Id = getWinner("semi", 2);
  }

  player1Name = player1Id ? getPlayerName(player1Id) : "TBD";
  player2Name = player2Id ? getPlayerName(player2Id) : "TBD";

  const roundNames = {
    quarter: `Viertelfinale ${matchNum}`,
    semi: `Halbfinale ${matchNum}`,
    thirdPlace: "Spiel um Platz 3",
    final: "Finale",
  };

  return `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div class="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-lg p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg sm:text-xl font-bold text-gray-800">${roundNames[round]}</h3>
          <button onclick="closeKnockoutMatchEntry()" class="p-2 hover:bg-gray-100 rounded-full">${icons.x}</button>
        </div>
        <div class="mb-4 p-3 bg-indigo-50 rounded-lg">
          <div class="text-center">
            <div class="font-bold text-base sm:text-lg">${player1Name}</div>
            <div class="text-gray-500 text-sm my-1">vs</div>
            <div class="font-bold text-base sm:text-lg">${player2Name}</div>
          </div>
        </div>
        <input type="hidden" id="koPlayer1Id" value="${player1Id || ""}">
        <input type="hidden" id="koPlayer2Id" value="${player2Id || ""}">
        <input type="hidden" id="koRound" value="${round}">
        <input type="hidden" id="koMatchNum" value="${matchNum}">
        <div class="space-y-3 mb-5">
          ${[1, 2, 3]
            .map(
              (i) => `
<div class="flex items-center gap-2">
  <span class="text-sm font-medium text-gray-600 w-12 flex-shrink-0">Satz ${i}</span>
  <input
    type="number"
    id="koSet${i}P1"
    min="0"
    max="30"
    placeholder="${player1Name.substring(0, 6)}"
    ${i === 3 ? `oninput="updateKnockoutMatchEntry('koSet${i}P1', this.value)" ${state.knockoutEntry?.set3Disabled ? "disabled" : ""}` : `oninput="updateKnockoutMatchEntry('koSet${i}P1', this.value)"`}
    class="flex-1 px-3 py-2.5 border rounded-lg text-center ${i === 3 && state.knockoutEntry?.set3Disabled ? "bg-gray-200" : ""}"
  >
  <span class="text-gray-400 font-bold">:</span>
  <input
    type="number"
    id="koSet${i}P2"
    min="0"
    max="30"
    placeholder="${player2Name.substring(0, 6)}"
    ${i === 3 ? `oninput="updateKnockoutMatchEntry('koSet${i}P2', this.value)" ${state.knockoutEntry?.set3Disabled ? "disabled" : ""}` : `oninput="updateKnockoutMatchEntry('koSet${i}P2', this.value)"`}
    class="flex-1 px-3 py-2.5 border rounded-lg text-center ${i === 3 && state.knockoutEntry?.set3Disabled ? "bg-gray-200" : ""}"
  >
</div>
          `,
            )
            .join("")}
        </div>
        <div class="flex gap-3">
          <button onclick="closeKnockoutMatchEntry()" class="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">Abbrechen</button>
          <button onclick="saveKnockoutMatch()" class="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">Speichern</button>
        </div>
      </div>
    </div>`;
}
