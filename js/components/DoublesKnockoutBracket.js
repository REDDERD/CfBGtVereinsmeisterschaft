// js/components/DoublesKnockoutBracket.js
// Doppel-K.O.-Bracket Komponente - Mobile-First
// Analog zu KnockoutBracket.js (Einzel), nur mit Teams statt Einzelspielern.

function DoublesKnockoutBracketView() {
  const startRound = getDoublesKnockoutStartRound();

  const renderMatchCard = (round, matchNum, title, borderColor = "blue") => {
    const match = getDoublesKnockoutMatch(round, matchNum);
    const { team1, team2, team1Fallback, team2Fallback } =
      getDoublesKnockoutTeams(round, matchNum);
    const isPlayed = match && match.sets;
    const canPlay =
      isDoublesKnockoutTeamReady(team1) && isDoublesKnockoutTeamReady(team2);

    let winnerIsTeam1 = null;
    if (isPlayed) {
      const { t1, t2 } = getDoublesKnockoutSetsWon(match);
      winnerIsTeam1 = t1 > t2;
    }

    const teamRow = (label, isTeam1) => {
      const setScores = isPlayed
        ? match.sets
            .map((set) => {
              const own = isTeam1 ? set.t1 : set.t2;
              const other = isTeam1 ? set.t2 : set.t1;
              return `<span class="inline-block px-1.5 py-0.5 text-xs rounded ${own > other ? "border border-green-600 bg-white font-semibold" : "bg-gray-100"}">${own}</span>`;
            })
            .join("")
        : "";
      const isWinner = isPlayed && winnerIsTeam1 === isTeam1;

      return `
      <div class="px-2.5 py-2 ${isWinner ? "bg-green-100 font-bold" : "bg-gray-50"} rounded text-sm flex justify-between items-center gap-2">
        <span class="truncate flex-1" title="${label}">${label}</span>
        ${isPlayed ? `<div class="flex gap-0.5 flex-shrink-0">${setScores}</div>` : ""}
      </div>`;
    };

    // Bei gespielten Spielen die tatsächlich eingetragenen Teams anzeigen
    const label1 = isPlayed
      ? getDoublesPlayedTeamLabel(match.team1)
      : getDoublesTeamLabel(team1, team1Fallback);
    const label2 = isPlayed
      ? getDoublesPlayedTeamLabel(match.team2)
      : getDoublesTeamLabel(team2, team2Fallback);

    return `
      <div class="bg-white p-3 sm:p-4 rounded-lg border-2 border-${borderColor}-400">
        <div class="flex items-center justify-between gap-2 mb-2">
          <div class="text-xs sm:text-sm font-medium text-gray-700">${title}</div>
          ${isPlayed && match.walkover ? '<span class="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-gray-100 text-gray-500 border border-gray-300">Kampflos</span>' : ""}
        </div>
        <div class="space-y-1.5">
          ${teamRow(label1, true)}
          <div class="text-center text-xs text-gray-400">vs</div>
          ${teamRow(label2, false)}
        </div>
        ${
          !isPlayed && state.isAdmin && !isReadOnly() && canPlay
            ? `<button onclick="openDoublesKnockoutMatchEntry('${round}', ${matchNum})" class="mt-2 w-full px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">Ergebnis eintragen</button>`
            : !isPlayed && state.isAdmin && !isReadOnly()
              ? '<div class="mt-2 text-center text-xs text-gray-400">Teams stehen noch nicht fest</div>'
              : ""
        }
      </div>`;
  };

  return `
    <div class="space-y-4">
      ${state.doublesKnockoutEntryMatch ? DoublesKnockoutMatchEntryModal() : ""}
      <div class="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 sm:p-6 rounded-lg border-2 border-yellow-400">
        <h3 class="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-4">K.O.-Phase Doppel</h3>

        ${
          startRound === "quarter"
            ? `
        <div class="mb-4">
          <h4 class="font-bold text-gray-700 mb-2 text-sm sm:text-base">Viertelfinale</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            ${renderMatchCard("quarter", 1, "VF 1")}
            ${renderMatchCard("quarter", 2, "VF 2")}
            ${renderMatchCard("quarter", 3, "VF 3")}
            ${renderMatchCard("quarter", 4, "VF 4")}
          </div>
        </div>
        `
            : ""
        }

        <div class="mb-4">
          <h4 class="font-bold text-gray-700 mb-2 text-sm sm:text-base">Halbfinale</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
            ${renderMatchCard("semi", 1, "HF 1")}
            ${renderMatchCard("semi", 2, "HF 2")}
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
          ${renderMatchCard("thirdPlace", 1, "Spiel um Platz 3", "amber")}
          ${renderMatchCard("final", 1, "Finale", "yellow")}
        </div>
      </div>
    </div>`;
}

function DoublesKnockoutMatchEntryModal() {
  const { round, matchNum } = state.doublesKnockoutEntryMatch;
  const { team1, team2, team1Fallback, team2Fallback } =
    getDoublesKnockoutTeams(round, matchNum);

  const team1Label = getDoublesTeamLabel(team1, team1Fallback);
  const team2Label = getDoublesTeamLabel(team2, team2Fallback);
  const perMatch = isDoublesKnockoutPartnerPerMatch();

  const title =
    round === "thirdPlace" || round === "final"
      ? DOUBLES_KNOCKOUT_ROUND_NAMES[round]
      : `${DOUBLES_KNOCKOUT_ROUND_NAMES[round]} ${matchNum}`;

  // Bei Partnern je Spiel steckt der Partner in einem Select (gleiche ID wie
  // das Hidden-Input im Modus "feste Partner", damit das Speichern identisch bleibt)
  const partnerOptions = perMatch
    ? getDoublesKnockoutPartnerOptions(team1, team2)
    : [];

  const teamBlock = (team, slot, fallback) => {
    const seedName = team?.player1Id ? getPlayerName(team.player1Id) : fallback;
    return `
      <div>
        <div class="text-xs font-semibold text-gray-500 mb-1">${slot === "t1" ? "Team 1" : "Team 2"}</div>
        <div class="font-bold text-base sm:text-lg mb-1.5">${seedName}</div>
        <select id="dko${slot === "t1" ? "T1" : "T2"}P2Id" class="w-full px-3 py-2.5 border rounded-lg bg-white text-sm">
          <option value="">Partner wählen...</option>
          ${partnerOptions.map((p) => `<option value="${p.id}">${p.name} (Pool ${p.doublesPool})</option>`).join("")}
        </select>
      </div>`;
  };

  return `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div class="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-lg p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg sm:text-xl font-bold text-gray-800">${title}</h3>
          <button onclick="closeDoublesKnockoutMatchEntry()" class="p-2 hover:bg-gray-100 rounded-full">${icons.x}</button>
        </div>
        <div class="mb-4 p-3 bg-indigo-50 rounded-lg">
          ${
            perMatch
              ? `
            <p class="text-xs text-gray-600 mb-3">In diesem Modus werden die Partner je Spiel neu gesetzt. Weiter kommt nur der gesetzte Spieler.</p>
            <div class="space-y-3">
              ${teamBlock(team1, "t1", team1Fallback)}
              <div class="text-center text-gray-500 text-sm">vs</div>
              ${teamBlock(team2, "t2", team2Fallback)}
            </div>
          `
              : `
            <div class="text-center">
              <div class="font-bold text-base sm:text-lg">${team1Label}</div>
              <div class="text-gray-500 text-sm my-1">vs</div>
              <div class="font-bold text-base sm:text-lg">${team2Label}</div>
            </div>
          `
          }
        </div>
        <input type="hidden" id="dkoT1P1Id" value="${team1?.player1Id || ""}">
        <input type="hidden" id="dkoT2P1Id" value="${team2?.player1Id || ""}">
        ${
          perMatch
            ? ""
            : `
        <input type="hidden" id="dkoT1P2Id" value="${team1?.player2Id || ""}">
        <input type="hidden" id="dkoT2P2Id" value="${team2?.player2Id || ""}">
        `
        }
        <input type="hidden" id="dkoRound" value="${round}">
        <input type="hidden" id="dkoMatchNum" value="${matchNum}">
        <div class="space-y-3 mb-5">
          ${[1, 2, 3]
            .map((i) => {
              const disabled =
                i === 3 && state.doublesKnockoutEntry?.set3Disabled;
              return `
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-600 w-12 flex-shrink-0">Satz ${i}</span>
            <input type="number" id="dkoSet${i}T1" min="0" max="30" placeholder="T1"
              oninput="updateDoublesKnockoutMatchEntry('dkoSet${i}T1', this.value)"
              ${disabled ? "disabled" : ""}
              class="flex-1 px-3 py-2.5 border rounded-lg text-center ${disabled ? "bg-gray-200" : ""}">
            <span class="text-gray-400 font-bold">:</span>
            <input type="number" id="dkoSet${i}T2" min="0" max="30" placeholder="T2"
              oninput="updateDoublesKnockoutMatchEntry('dkoSet${i}T2', this.value)"
              ${disabled ? "disabled" : ""}
              class="flex-1 px-3 py-2.5 border rounded-lg text-center ${disabled ? "bg-gray-200" : ""}">
          </div>`;
            })
            .join("")}
        </div>
        <div class="flex gap-3">
          <button onclick="closeDoublesKnockoutMatchEntry()" class="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">Abbrechen</button>
          <button onclick="saveDoublesKnockoutMatch()" class="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">Speichern</button>
        </div>

        <div class="mt-5 pt-4 border-t border-gray-200">
          <div class="text-xs font-semibold text-gray-600 mb-2">Kampfloses Spiel</div>
          <div class="flex flex-col sm:flex-row gap-2">
            <button onclick="saveDoublesKnockoutWalkover('t1')" class="flex-1 min-w-0 px-3 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800 text-sm font-medium">
              <span class="block truncate">Sieg: ${team1Label}</span>
            </button>
            <button onclick="saveDoublesKnockoutWalkover('t2')" class="flex-1 min-w-0 px-3 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800 text-sm font-medium">
              <span class="block truncate">Sieg: ${team2Label}</span>
            </button>
          </div>
          <p class="text-xs text-gray-400 mt-1.5">Ergebnis wird als 21:0, 21:0 gespeichert. Partner ist dabei optional.</p>
        </div>
      </div>
    </div>`;
}

/**
 * Eingefrorene Doppel-Rangfolge (Endstand der Pyramidenphase) als Pyramide.
 */
function FrozenPyramidView(flatPositions) {
  const levels = pyramidLevelsToArray(buildPyramidLevels(flatPositions || []));

  if (levels.length === 0) {
    return `<div class="text-center py-8 bg-gray-50 rounded-lg"><p class="text-gray-600">Keine eingefrorene Rangfolge vorhanden</p></div>`;
  }

  return `
    <div class="overflow-x-auto scrollbar-hide -mx-4 sm:-mx-6 px-4 sm:px-6">
      <div class="space-y-1.5 sm:space-y-2 inline-block min-w-full">
        ${levels
          .map(
            (level) => `
          <div class="flex flex-nowrap justify-center items-center gap-1 sm:gap-2">
            ${level
              .map((playerId) => {
                const name = getPlayerName(playerId);
                const shortName =
                  name.length > 12 ? name.substring(0, 11) + "." : name;
                return `
              <div class="bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-400 border-2 rounded-lg px-2 py-1.5 sm:px-4 sm:py-2.5 text-center shadow-sm flex-shrink-0" style="min-width: 70px">
                <div class="font-bold text-gray-800 text-xs sm:text-sm leading-tight whitespace-nowrap" title="${name}">
                  <span class="sm:hidden">${shortName}</span>
                  <span class="hidden sm:inline">${name}</span>
                </div>
              </div>`;
              })
              .join("")}
          </div>`,
          )
          .join("")}
      </div>
    </div>`;
}
