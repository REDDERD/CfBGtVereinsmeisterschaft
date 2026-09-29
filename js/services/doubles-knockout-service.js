// js/services/doubles-knockout-service.js
// Doppel-K.O.-Phase Verwaltung (Aktivierung, Spiele, Konfiguration)
// Analog zu knockout-service.js (Einzel), nur mit Teams statt Einzelspielern.
//
// Zwei Modi (die Entscheidung über den Spielmodus steht noch aus):
//   'quarter' → 8 Teams: jeder der Top 8 spielt mit einem (zugelosten) Partner
//               Runden: quarter (4) → semi (2) → final / thirdPlace
//   'semi'    → 4 Teams: je 2 Top-8-Spieler bilden ein Team
//               Runden: semi (2) → final / thirdPlace

const DOUBLES_KNOCKOUT_ROUND_NAMES = {
  quarter: "Viertelfinale",
  semi: "Halbfinale",
  thirdPlace: "Spiel um Platz 3",
  final: "Finale",
};

// ========== View-Steuerung ==========

function setDoublesView(view) {
  state.doublesView = view;
  render();
}

function showFrozenPyramidPhase() {
  state.doublesView = "pyramid";
  render();
}

// ========== Rangfolge & Konfiguration ==========

function getDoublesKnockoutStartRound() {
  return state.doublesKnockoutConfig?.mode === "semi" ? "semi" : "quarter";
}

function getDoublesKnockoutSlotCount() {
  return getDoublesKnockoutStartRound() === "semi" ? 2 : 4;
}

/**
 * Rangfolge, gegen die die konfigurierten Positionen aufgelöst werden.
 * Nach Start der K.O.-Phase die eingefrorene, davor die aktuelle Pyramide.
 */
function getDoublesRankingList() {
  if (state.doublesKnockoutPhaseActive && state.frozenPyramid) {
    return state.frozenPyramid;
  }
  return flattenPyramidLevels(state.pyramid.levels || []);
}

/**
 * Löst eine Positionsangabe ("p1" … "p8") gegen die Rangfolge auf.
 */
function getDoublesPositionPlayerId(position) {
  if (!position) return null;
  const place = parseInt(position.replace("p", ""));
  if (isNaN(place)) return null;
  return getDoublesRankingList()[place - 1] || null;
}

function getDoublesKnockoutConfigTeam(matchNum, slot) {
  const config = state.doublesKnockoutConfig || {};
  const prefix = getDoublesKnockoutStartRound() === "semi" ? "sf" : "qf";
  const player1Id = getDoublesPositionPlayerId(
    config[`${prefix}_${matchNum}_${slot}_pos`],
  );
  const player2Id = config[`${prefix}_${matchNum}_${slot}_partner`] || null;

  if (!player1Id && !player2Id) return null;
  return { player1Id: player1Id || null, player2Id };
}

// ========== Spiele & Bracket-Logik ==========

function getDoublesKnockoutMatch(round, matchNum) {
  return state.doublesKnockoutMatches.find(
    (m) => m.round === round && m.matchNum === matchNum,
  );
}

function getDoublesKnockoutSetsWon(match) {
  let t1 = 0,
    t2 = 0;
  (match.sets || []).forEach((set) => {
    if (set.t1 > set.t2) t1++;
    else t2++;
  });
  return { t1, t2 };
}

function getDoublesKnockoutWinnerTeam(round, matchNum) {
  const match = getDoublesKnockoutMatch(round, matchNum);
  if (!match || !match.sets) return null;
  const { t1, t2 } = getDoublesKnockoutSetsWon(match);
  return t1 > t2 ? match.team1 : match.team2;
}

function getDoublesKnockoutLoserTeam(round, matchNum) {
  const match = getDoublesKnockoutMatch(round, matchNum);
  if (!match || !match.sets) return null;
  const { t1, t2 } = getDoublesKnockoutSetsWon(match);
  return t1 > t2 ? match.team2 : match.team1;
}

/**
 * Ermittelt die beiden Teams eines Bracket-Spiels.
 * Rückgabe: { team1, team2, team1Fallback, team2Fallback }
 * team1/team2 sind null, solange das Team noch nicht feststeht.
 */
function getDoublesKnockoutTeams(round, matchNum) {
  const startRound = getDoublesKnockoutStartRound();

  if (round === startRound) {
    return {
      team1: getDoublesKnockoutConfigTeam(matchNum, "t1"),
      team2: getDoublesKnockoutConfigTeam(matchNum, "t2"),
      team1Fallback: "Team 1",
      team2Fallback: "Team 2",
    };
  }

  if (round === "semi") {
    return {
      team1: getDoublesKnockoutWinnerTeam("quarter", matchNum === 1 ? 1 : 3),
      team2: getDoublesKnockoutWinnerTeam("quarter", matchNum === 1 ? 2 : 4),
      team1Fallback: `Gew. VF ${matchNum === 1 ? 1 : 3}`,
      team2Fallback: `Gew. VF ${matchNum === 1 ? 2 : 4}`,
    };
  }

  if (round === "thirdPlace") {
    return {
      team1: getDoublesKnockoutLoserTeam("semi", 1),
      team2: getDoublesKnockoutLoserTeam("semi", 2),
      team1Fallback: "Verl. HF 1",
      team2Fallback: "Verl. HF 2",
    };
  }

  if (round === "final") {
    return {
      team1: getDoublesKnockoutWinnerTeam("semi", 1),
      team2: getDoublesKnockoutWinnerTeam("semi", 2),
      team1Fallback: "Gew. HF 1",
      team2Fallback: "Gew. HF 2",
    };
  }

  return {
    team1: null,
    team2: null,
    team1Fallback: "TBD",
    team2Fallback: "TBD",
  };
}

function getDoublesTeamLabel(team, fallback) {
  if (!team) return fallback;
  const name1 = team.player1Id ? getPlayerName(team.player1Id) : "?";
  const name2 = team.player2Id ? getPlayerName(team.player2Id) : "Partner offen";
  return `${name1} / ${name2}`;
}

function isDoublesTeamComplete(team) {
  return !!(team && team.player1Id && team.player2Id);
}

// ========== Ergebnis-Eintragung ==========

function openDoublesKnockoutMatchEntry(round, matchNum) {
  state.doublesKnockoutEntryMatch = { round, matchNum };
  state.doublesKnockoutEntry = { set3Disabled: true };
  render();
}

function closeDoublesKnockoutMatchEntry() {
  state.doublesKnockoutEntryMatch = null;
  state.doublesKnockoutEntry = {};
  render();
}

async function saveDoublesKnockoutMatch() {
  const round = document.getElementById("dkoRound").value;
  const matchNum = parseInt(document.getElementById("dkoMatchNum").value);

  const team1 = {
    player1Id: document.getElementById("dkoT1P1Id").value,
    player2Id: document.getElementById("dkoT1P2Id").value,
  };
  const team2 = {
    player1Id: document.getElementById("dkoT2P1Id").value,
    player2Id: document.getElementById("dkoT2P2Id").value,
  };

  if (
    !team1.player1Id ||
    !team1.player2Id ||
    !team2.player1Id ||
    !team2.player2Id
  ) {
    Toast.error("Teams sind noch nicht vollständig");
    return;
  }

  const allPlayers = [
    team1.player1Id,
    team1.player2Id,
    team2.player1Id,
    team2.player2Id,
  ];
  if (new Set(allPlayers).size !== 4) {
    Toast.error("Ein Spieler kann nicht in beiden Teams spielen");
    return;
  }

  const set1T1 = parseInt(document.getElementById("dkoSet1T1").value);
  const set1T2 = parseInt(document.getElementById("dkoSet1T2").value);
  const set2T1 = parseInt(document.getElementById("dkoSet2T1").value);
  const set2T2 = parseInt(document.getElementById("dkoSet2T2").value);
  const set3T1 = parseInt(document.getElementById("dkoSet3T1").value);
  const set3T2 = parseInt(document.getElementById("dkoSet3T2").value);

  if (!validateSet(set1T1, set1T2) || !validateSet(set2T1, set2T2)) {
    Toast.error("Ungültige Satz-Ergebnisse in Satz 1 oder 2");
    return;
  }

  const sets = [
    { t1: set1T1, t2: set1T2 },
    { t1: set2T1, t2: set2T2 },
  ];

  const set1Winner = set1T1 > set1T2 ? "t1" : "t2";
  const set2Winner = set2T1 > set2T2 ? "t1" : "t2";

  if (set1Winner !== set2Winner) {
    if (!isNaN(set3T1) && !isNaN(set3T2)) {
      if (!validateSet(set3T1, set3T2)) {
        Toast.error("Ungültiges Satz-Ergebnis in Satz 3");
        return;
      }
      sets.push({ t1: set3T1, t2: set3T2 });
    } else {
      Toast.warning("Dritter Satz ist erforderlich (Spielstand 1:1)");
      return;
    }
  }

  try {
    const existingMatch = getDoublesKnockoutMatch(round, matchNum);

    if (existingMatch) {
      await seasonCollection("doublesMatches").doc(existingMatch.id).update({
        team1,
        team2,
        sets,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      await seasonCollection("doublesMatches").add({
        round,
        matchNum,
        team1,
        team2,
        sets,
        status: _getDefaultMatchStatus("doubles"),
        date: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }

    state.doublesKnockoutEntryMatch = null;
    state.doublesKnockoutEntry = {};
    Toast.success("K.O.-Spiel erfolgreich eingetragen!");
    render();
  } catch (error) {
    console.error("Fehler beim Speichern:", error);
    Toast.error("Fehler beim Speichern: " + error.message);
  }
}

// ========== Aktivierung / Deaktivierung ==========

async function activateDoublesKnockoutPhase() {
  const ranking = flattenPyramidLevels(state.pyramid.levels || []);
  const needed = getDoublesKnockoutStartRound() === "semi" ? 4 : 8;

  if (ranking.length < needed) {
    Toast.error(
      `Die Pyramide enthält nur ${ranking.length} Spieler, für diesen Modus werden mindestens ${needed} benötigt.`,
    );
    return;
  }

  const confirmed = await Modal.confirm({
    title: "Doppel-K.O.-Phase starten?",
    message:
      "Möchtest du die K.O.-Phase im Doppel jetzt starten? Die aktuelle Pyramiden-Rangfolge wird eingefroren und ist die Grundlage für die Paarungen. Neue Pyramiden-Spiele sind danach nicht mehr möglich.",
    confirmText: "K.O.-Phase starten",
    cancelText: "Abbrechen",
    type: "warning",
  });

  if (!confirmed) return;

  try {
    state.doublesKnockoutPhaseActive = true;
    state.frozenPyramid = ranking;

    await db.collection("settings").doc("doublesKnockout").set({
      active: true,
      frozenPyramid: ranking,
      activatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    Toast.success(
      "Doppel-K.O.-Phase aktiviert! Die Pyramiden-Rangfolge wurde eingefroren.",
      4000,
    );
    render();
  } catch (error) {
    console.error("Fehler beim Aktivieren:", error);
    Toast.error("Fehler beim Aktivieren: " + error.message);
  }
}

async function deactivateDoublesKnockoutPhase() {
  const confirmed = await Modal.confirm({
    title: "Doppel-K.O.-Phase deaktivieren?",
    message:
      "Möchtest du die K.O.-Phase im Doppel wirklich deaktivieren? Die Pyramide bleibt erhalten, aber alle Spiele der K.O.-Phase werden gelöscht.",
    confirmText: "Deaktivieren",
    cancelText: "Abbrechen",
    type: "danger",
  });

  if (!confirmed) return;

  try {
    state.doublesKnockoutPhaseActive = false;
    state.frozenPyramid = null;
    state.doublesView = "pyramid";

    await db.collection("settings").doc("doublesKnockout").set({
      active: false,
      frozenPyramid: null,
      deactivatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    for (const match of state.doublesMatches.filter((m) => m.round)) {
      await seasonCollection("doublesMatches").doc(match.id).delete();
    }

    Toast.success("Doppel-K.O.-Phase deaktiviert.");
    render();
  } catch (error) {
    console.error("Fehler beim Deaktivieren:", error);
    Toast.error("Fehler beim Deaktivieren: " + error.message);
  }
}

// ========== Konfiguration ==========

/**
 * Wechselt den Bracket-Modus lokal (erst "Paarungen speichern" schreibt ihn weg).
 */
function setDoublesKnockoutMode(mode) {
  state.doublesKnockoutConfig = {
    ...(state.doublesKnockoutConfig || {}),
    mode: mode === "semi" ? "semi" : "quarter",
  };
  render();
}

async function saveDoublesKnockoutConfig() {
  const prefix = getDoublesKnockoutStartRound() === "semi" ? "sf" : "qf";
  const config = { mode: getDoublesKnockoutStartRound() };

  for (let i = 1; i <= getDoublesKnockoutSlotCount(); i++) {
    ["t1", "t2"].forEach((slot) => {
      const pos = document.getElementById(`d${prefix}_${i}_${slot}_pos`)?.value;
      const partner = document.getElementById(
        `d${prefix}_${i}_${slot}_partner`,
      )?.value;
      if (pos) config[`${prefix}_${i}_${slot}_pos`] = pos;
      if (partner) config[`${prefix}_${i}_${slot}_partner`] = partner;
    });
  }

  state.doublesKnockoutConfig = config;

  try {
    await db
      .collection("settings")
      .doc("doublesKnockoutConfig")
      .set({
        ...config,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

    Toast.success("Doppel-Paarungen erfolgreich gespeichert!");
  } catch (error) {
    console.error("Fehler beim Speichern:", error);
    Toast.error("Fehler beim Speichern: " + error.message);
  }
}
