// js/services/knockout-service.js
// K.O.-Phase bezogene Funktionen

function setSinglesView(view) {
  state.singlesView = view;
  render();
}

function showFrozenGroupPhase() {
  state.singlesView = "group";
  render();
}

function openKnockoutMatchEntry(round, matchNum) {
  state.knockoutEntryMatch = { round, matchNum };
  resetMatchEntry();
  render();
}

function closeKnockoutMatchEntry() {
  state.knockoutEntryMatch = null;
  render();
}

async function saveKnockoutMatch() {
  const player1Id = document.getElementById("koPlayer1Id").value;
  const player2Id = document.getElementById("koPlayer2Id").value;
  const round = document.getElementById("koRound").value;
  const matchNum = parseInt(document.getElementById("koMatchNum").value);

  const set1P1 = parseInt(document.getElementById("koSet1P1").value);
  const set1P2 = parseInt(document.getElementById("koSet1P2").value);
  const set2P1 = parseInt(document.getElementById("koSet2P1").value);
  const set2P2 = parseInt(document.getElementById("koSet2P2").value);
  const set3P1 = parseInt(document.getElementById("koSet3P1").value);
  const set3P2 = parseInt(document.getElementById("koSet3P2").value);

  if (!player1Id || !player2Id) {
    alert("Spieler nicht verfügbar");
    return;
  }

  if (!validateSet(set1P1, set1P2) || !validateSet(set2P1, set2P2)) {
    alert("Ungültige Satz-Ergebnisse in Satz 1 oder 2");
    return;
  }

  const sets = [
    { p1: set1P1, p2: set1P2 },
    { p1: set2P1, p2: set2P2 },
  ];

  const set1Winner = set1P1 > set1P2 ? "p1" : "p2";
  const set2Winner = set2P1 > set2P2 ? "p1" : "p2";

  // Check if set 3 is needed
  if (set1Winner !== set2Winner) {
    if (!isNaN(set3P1) && !isNaN(set3P2)) {
      if (!validateSet(set3P1, set3P2)) {
        alert("Ungültiges Satz-Ergebnis in Satz 3");
        return;
      }
      sets.push({ p1: set3P1, p2: set3P2 });
    } else {
      alert("Dritter Satz ist erforderlich (Spielstand 1:1)");
      return;
    }
  }

  try {
    // Prüfe ob bereits ein Ergebnis für dieses Spiel existiert
    const existingMatch = state.knockoutMatches.find(
      (m) => m.round === round && m.matchNum === matchNum
    );

    if (existingMatch) {
      // Update existing match
      await db
        .collection("knockoutMatches")
        .doc(existingMatch.id)
        .update({
          player1Id,
          player2Id,
          sets,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
    } else {
      // Create new match
      await db.collection("knockoutMatches").add({
        round,
        matchNum,
        player1Id,
        player2Id,
        sets,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }

    state.knockoutEntryMatch = null;
    alert("K.O.-Spiel erfolgreich eingetragen!");
    render();
  } catch (error) {
    console.error("Fehler beim Speichern:", error);
    alert("Fehler beim Speichern: " + error.message);
  }
}

async function cancelKnockoutMatch(round, matchNum) {
  const canCancel = checkCanCancelMatch(round, matchNum);

  if (!canCancel) {
    alert(
      "Dieses Spiel kann nicht mehr storniert werden, da bereits ein nachfolgendes Spiel stattgefunden hat."
    );
    return;
  }

  if (
    !confirm(
      "Spielergebnis wirklich stornieren? Der Gewinner wird aus der nächsten Runde entfernt."
    )
  ) {
    return;
  }

  try {
    const match = state.knockoutMatches.find(
      (m) => m.round === round && m.matchNum === matchNum
    );
    if (match) {
      await db.collection("knockoutMatches").doc(match.id).delete();
      alert("Spielergebnis storniert.");
      render();
    }
  } catch (error) {
    console.error("Fehler beim Stornieren:", error);
    alert("Fehler beim Stornieren: " + error.message);
  }
}

function checkCanCancelMatch(round, matchNum) {
  const getKnockoutMatch = (r, m) =>
    state.knockoutMatches.find(
      (match) => match.round === r && match.matchNum === m
    );

  // Finale und Platz 3 können immer storniert werden
  if (round === "final" || round === "thirdPlace") return true;

  // Für Viertelfinale: Prüfe ob zugehöriges Halbfinale schon gespielt wurde
  if (round === "quarter") {
    const sfNum = matchNum <= 2 ? 1 : 2;
    const sfMatch = getKnockoutMatch("semi", sfNum);
    if (sfMatch && sfMatch.sets) return false;
    return true;
  }

  // Für Halbfinale: Prüfe ob Finale oder Platz 3 schon gespielt wurde
  if (round === "semi") {
    const finalMatch = getKnockoutMatch("final", 1);
    const thirdMatch = getKnockoutMatch("thirdPlace", 1);
    if ((finalMatch && finalMatch.sets) || (thirdMatch && thirdMatch.sets))
      return false;
    return true;
  }

  return true;
}

async function activateKnockoutPhase() {
  if (
    !confirm(
      "K.O.-Phase jetzt starten? Die aktuellen Gruppenphase-Tabellen werden eingefroren und können nicht mehr geändert werden."
    )
  ) {
    return;
  }

  // Aktuelle Tabellen einfrieren
  const group1 = calculateStandings(1);
  const group2 = calculateStandings(2);

  const frozenStandings = {
    group1: group1,
    group2: group2,
  };

  state.knockoutPhaseActive = true;
  state.frozenStandings = frozenStandings;

  // Save to Firebase
  await db.collection("settings").doc("knockout").set({
    active: true,
    frozenStandings: frozenStandings,
    activatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });

  alert("K.O.-Phase aktiviert! Die Gruppenphase-Tabellen wurden eingefroren.");
  render();
}

async function deactivateKnockoutPhase() {
  if (
    !confirm(
      "K.O.-Phase wirklich deaktivieren? Alle K.O.-Spiele-Ergebnisse bleiben erhalten, aber die eingefrorenen Tabellen werden verworfen."
    )
  ) {
    return;
  }

  state.knockoutPhaseActive = false;
  state.frozenStandings = null;
  state.singlesView = "group";

  // Save to Firebase
  await db.collection("settings").doc("knockout").set({
    active: false,
    frozenStandings: null,
    deactivatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });

  alert("K.O.-Phase deaktiviert.");
  render();
}

async function saveKnockoutConfig() {
  // Sammle alle Viertelfinale-Paarungen
  const config = {};
  for (let i = 1; i <= 4; i++) {
    const p1 = document.getElementById(`qf_${i}_p1`)?.value || "";
    const p2 = document.getElementById(`qf_${i}_p2`)?.value || "";
    if (p1) config[`qf_${i}_p1`] = p1;
    if (p2) config[`qf_${i}_p2`] = p2;
  }

  state.knockoutConfig = config;

  try {
    await db
      .collection("settings")
      .doc("knockoutConfig")
      .set({
        ...config,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

    alert("Paarungen erfolgreich gespeichert!");
  } catch (error) {
    console.error("Fehler beim Speichern:", error);
    alert("Fehler beim Speichern: " + error.message);
  }
}

// Ranking-Verwaltung
function movePlayerUp(index) {
  const levels = state.pyramid.levels || [];
  const flatPositions = flattenPyramidLevels(levels);

  if (index > 0) {
    const temp = flatPositions[index];
    flatPositions[index] = flatPositions[index - 1];
    flatPositions[index - 1] = temp;

    // Update state
    state.pyramid.levels = rebuildPyramidLevels(flatPositions);
    render();
  }
}

function movePlayerDown(index) {
  const levels = state.pyramid.levels || [];
  const flatPositions = flattenPyramidLevels(levels);

  if (index < flatPositions.length - 1) {
    const temp = flatPositions[index];
    flatPositions[index] = flatPositions[index + 1];
    flatPositions[index + 1] = temp;

    // Update state
    state.pyramid.levels = rebuildPyramidLevels(flatPositions);
    render();
  }
}

function rebuildPyramidLevels(flatPositions) {
  const levels = [];
  let idx = 0;
  let levelNum = 1;

  while (idx < flatPositions.length) {
    const levelPlayers = flatPositions.slice(idx, idx + levelNum);
    levels.push(levelPlayers);
    idx += levelNum;
    levelNum++;
  }

  return levels;
}

async function saveDoublesRanking() {
  const levels = state.pyramid.levels || [];

  const levelsObject = {};
  levels.forEach((level, idx) => {
    levelsObject[`level${idx + 1}`] = level;
  });

  await db
    .collection("pyramid")
    .doc("current")
    .set({
      ...levelsObject,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
    });

  alert("Rangfolge gespeichert!");
}