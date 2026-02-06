// js/services/knockout-service.js
// K.O.-Phase Verwaltung (Aktivierung, Spiele, Konfiguration)
// (Ranking-Verwaltung → ranking-service.js)

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
    Toast.error("Spieler nicht verfügbar");
    return;
  }

  if (!validateSet(set1P1, set1P2) || !validateSet(set2P1, set2P2)) {
    Toast.error("Ungültige Satz-Ergebnisse in Satz 1 oder 2");
    return;
  }

  const sets = [
    { p1: set1P1, p2: set1P2 },
    { p1: set2P1, p2: set2P2 },
  ];

  const set1Winner = set1P1 > set1P2 ? "p1" : "p2";
  const set2Winner = set2P1 > set2P2 ? "p1" : "p2";

  if (set1Winner !== set2Winner) {
    if (!isNaN(set3P1) && !isNaN(set3P2)) {
      if (!validateSet(set3P1, set3P2)) {
        Toast.error("Ungültiges Satz-Ergebnis in Satz 3");
        return;
      }
      sets.push({ p1: set3P1, p2: set3P2 });
    } else {
      Toast.warning("Dritter Satz ist erforderlich (Spielstand 1:1)");
      return;
    }
  }

  try {
    const defaultStatus = state.isAdmin
      ? state.matchStatusSettings.singlesAdminDefault
      : state.matchStatusSettings.singlesUserDefault;

    const existingMatch = state.knockoutMatches.find(
      (m) => m.round === round && m.matchNum === matchNum,
    );

    if (existingMatch) {
      await db.collection("singlesMatches").doc(existingMatch.id).update({
        player1Id,
        player2Id,
        sets,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      await db.collection("singlesMatches").add({
        round,
        matchNum,
        player1Id,
        player2Id,
        sets,
        status: defaultStatus,
        date: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }

    state.knockoutEntryMatch = null;
    Toast.success("K.O.-Spiel erfolgreich eingetragen!");
    render();
  } catch (error) {
    console.error("Fehler beim Speichern:", error);
    Toast.error("Fehler beim Speichern: " + error.message);
  }
}

function checkCanCancelMatch(round, matchNum) {
  const getKnockoutMatch = (r, m) =>
    state.knockoutMatches.find(
      (match) => match.round === r && match.matchNum === m,
    );

  if (round === "final" || round === "thirdPlace") return true;

  if (round === "quarter") {
    const sfNum = matchNum <= 2 ? 1 : 2;
    const sfMatch = getKnockoutMatch("semi", sfNum);
    if (sfMatch && sfMatch.sets) return false;
    return true;
  }

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
  const confirmed = await Modal.confirm({
    title: "K.O.-Phase starten?",
    message:
      "Möchtest du die K.O.-Phase jetzt starten? Die aktuellen Gruppenphase-Tabellen werden eingefroren und können nicht mehr geändert werden.",
    confirmText: "K.O.-Phase starten",
    cancelText: "Abbrechen",
    type: "warning",
  });

  if (!confirmed) {
    return;
  }

  const group1 = calculateStandings(1);
  const group2 = calculateStandings(2);

  const frozenStandings = {
    group1: group1,
    group2: group2,
  };

  state.knockoutPhaseActive = true;
  state.frozenStandings = frozenStandings;

  await db.collection("settings").doc("knockout").set({
    active: true,
    frozenStandings: frozenStandings,
    activatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });

  Toast.success(
    "K.O.-Phase aktiviert! Die Gruppenphase-Tabellen wurden eingefroren.",
    4000,
  );
  render();
}

async function deactivateKnockoutPhase() {
  const confirmed = await Modal.confirm({
    title: "K.O.-Phase deaktivieren?",
    message:
      "Möchtest du die K.O.-Phase wirklich deaktivieren? Die Ergebnisse der Gruppenphase bleiben erhalten, aber alle Spiele der K.O.-Phase werden verworfen.",
    confirmText: "Deaktivieren",
    cancelText: "Abbrechen",
    type: "danger",
  });

  if (!confirmed) {
    return;
  }

  state.knockoutPhaseActive = false;
  state.frozenStandings = null;
  state.singlesView = "group";

  await db.collection("settings").doc("knockout").set({
    active: false,
    frozenStandings: null,
    deactivatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });

  const knockoutMatchesToDelete = state.singlesMatches.filter(
    match => match.round && match.round !== 'group1' && match.round !== 'group2'
  );
  
  for (const match of knockoutMatchesToDelete) {
    await db.collection("singlesMatches").doc(match.id).delete();
  }

  Toast.success("K.O.-Phase deaktiviert.");
  render();
}

async function saveKnockoutConfig() {
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

    Toast.success("Paarungen erfolgreich gespeichert!");
  } catch (error) {
    console.error("Fehler beim Speichern:", error);
    Toast.error("Fehler beim Speichern: " + error.message);
  }
}
