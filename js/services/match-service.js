// js/services/match-service.js
// Match-bezogene Funktionen für Einzel und Doppel

async function addSinglesMatch() {
  const p1 = document.getElementById("singlesP1").value;
  const p2 = document.getElementById("singlesP2").value;

  const set1P1 = parseInt(document.getElementById("set1P1").value);
  const set1P2 = parseInt(document.getElementById("set1P2").value);
  const set2P1 = parseInt(document.getElementById("set2P1").value);
  const set2P2 = parseInt(document.getElementById("set2P2").value);
  const set3P1 = parseInt(document.getElementById("set3P1").value);
  const set3P2 = parseInt(document.getElementById("set3P2").value);

  if (!p1 || !p2 || p1 === p2) {
    Toast.error("Bitte zwei verschiedene Spieler auswählen");
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

  // Check if set 3 is needed
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
  } else if (!isNaN(set3P1) || !isNaN(set3P2)) {
    Toast.warning("Dritter Satz nicht erlaubt (Spielstand bereits 2:0)");
    return;
  }

  // Neue Validierungen für Einzel-Gruppenspiele
  const player1 = state.players.find(player => player.id === p1);
  const player2 = state.players.find(player => player.id === p2);

  if (!player1 || !player2) {
    Toast.error("Spieler nicht gefunden");
    return;
  }

  // Validierung 1: Spieler müssen in derselben Gruppe sein
  if (player1.singlesGroup !== player2.singlesGroup) {
    const confirmed = await Modal.warn({
      title: 'Spieler in unterschiedlichen Gruppen',
      message: `${player1.name} ist in Gruppe ${player1.singlesGroup} und ${player2.name} ist in Gruppe ${player2.singlesGroup}. Gruppenspiele sollten nur innerhalb derselben Gruppe stattfinden. Möchtest du das Spiel trotzdem eintragen?`,
      confirmText: 'Ja, eintragen',
      cancelText: 'Abbrechen'
    });
    
    if (!confirmed) {
      return;
    }
  }

  // Validierung 2: Prüfe, ob diese Paarung bereits 2x gespielt wurde
  const existingMatches = state.singlesMatches.filter(match => 
    (match.player1Id === p1 && match.player2Id === p2) || 
    (match.player1Id === p2 && match.player2Id === p1)
  );

  if (existingMatches.length >= 2) {
    const confirmed = await Modal.warn({
      title: 'Paarung bereits 2x gespielt',
      message: `${player1.name} und ${player2.name} haben bereits ${existingMatches.length} Spiele gegeneinander absolviert. Da es nur Hin- und Rückrunde gibt, macht es wenig Sinn, mehr als 2 Spiele pro Paarung einzutragen. Möchtest du das Spiel trotzdem eintragen?`,
      confirmText: 'Ja, eintragen',
      cancelText: 'Abbrechen'
    });
    
    if (!confirmed) {
      return;
    }
  }

  await db.collection("singlesMatches").add({
    player1Id: p1,
    player2Id: p2,
    sets,
    date: firebase.firestore.FieldValue.serverTimestamp(),
  });

  // Reset form
  document.getElementById("singlesP1").value = "";
  document.getElementById("singlesP2").value = "";
  document.getElementById("set1P1").value = "";
  document.getElementById("set1P2").value = "";
  document.getElementById("set2P1").value = "";
  document.getElementById("set2P2").value = "";
  document.getElementById("set3P1").value = "";
  document.getElementById("set3P2").value = "";

  resetMatchEntry();

  Toast.success("Spiel erfolgreich eingetragen!");
  render();
}

async function addDoublesMatch() {
  const t1p1 = document.getElementById("doublesT1P1").value;
  const t1p2 = document.getElementById("doublesT1P2").value;
  const t2p1 = document.getElementById("doublesT2P1").value;
  const t2p2 = document.getElementById("doublesT2P2").value;

  const set1T1 = parseInt(document.getElementById("doublesSet1T1").value);
  const set1T2 = parseInt(document.getElementById("doublesSet1T2").value);
  const set2T1 = parseInt(document.getElementById("doublesSet2T1").value);
  const set2T2 = parseInt(document.getElementById("doublesSet2T2").value);
  const set3T1 = parseInt(document.getElementById("doublesSet3T1").value);
  const set3T2 = parseInt(document.getElementById("doublesSet3T2").value);

  if (!t1p1 || !t1p2 || !t2p1 || !t2p2) {
    Toast.error("Bitte alle 4 Spieler auswählen");
    return;
  }

  // Validierung: Kein Spieler darf in beiden Teams sein
  const allPlayers = [t1p1, t1p2, t2p1, t2p2];
  const uniquePlayers = new Set(allPlayers);
  if (uniquePlayers.size !== 4) {
    Toast.error("Ein Spieler kann nicht in beiden Teams spielen. Bitte wähle 4 verschiedene Spieler aus.");
    return;
  }

  if (!validateSet(set1T1, set1T2) || !validateSet(set2T1, set2T2)) {
    Toast.error("Ungültige Satz-Ergebnisse");
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
      Toast.warning("Dritter Satz ist erforderlich");
      return;
    }
  }

  // Neue Validierungen für Doppel-Spiele
  const t1player1 = state.players.find(p => p.id === t1p1);
  const t1player2 = state.players.find(p => p.id === t1p2);
  const t2player1 = state.players.find(p => p.id === t2p1);
  const t2player2 = state.players.find(p => p.id === t2p2);

  if (!t1player1 || !t1player2 || !t2player1 || !t2player2) {
    Toast.error("Einer oder mehrere Spieler nicht gefunden");
    return;
  }

  // Validierung: Jede Kombination muss aus zwei Spielern unterschiedlicher Pools bestehen
  const validatePoolCombination = (player1, player2, teamName) => {
    if (!player1.doublesPool || !player2.doublesPool) {
      return { valid: false, message: `Beide Spieler in ${teamName} müssen einem Doppel-Pool zugeordnet sein.` };
    }
    if (player1.doublesPool === player2.doublesPool) {
      return { valid: false, message: `${teamName}: ${player1.name} und ${player2.name} sind beide in Pool ${player1.doublesPool}. Jedes Team muss einen Spieler aus Pool A und einen aus Pool B haben.` };
    }
    return { valid: true };
  };

  const team1Validation = validatePoolCombination(t1player1, t1player2, "Team 1");
  if (!team1Validation.valid) {
    Toast.error(team1Validation.message);
    return;
  }

  const team2Validation = validatePoolCombination(t2player1, t2player2, "Team 2");
  if (!team2Validation.valid) {
    Toast.error(team2Validation.message);
    return;
  }

  // Validierung: Prüfe ob eine Challenge für Spieler 1 der beiden Teams existiert
  let challengeToComplete = null;
  if (state.challenges && state.challenges.length > 0) {
    challengeToComplete = state.challenges.find(challenge => 
      challenge.status === 'pending' &&
      ((challenge.challengerId === t1p1 && challenge.challengedId === t2p1) ||
       (challenge.challengerId === t2p1 && challenge.challengedId === t1p1))
    );

    if (challengeToComplete) {
      const challenger = state.players.find(p => p.id === challengeToComplete.challengerId);
      const challenged = state.players.find(p => p.id === challengeToComplete.challengedId);
      
      const confirmed = await Modal.confirm({
        title: 'Herausforderung gefunden',
        message: `Es gibt eine offene Herausforderung zwischen ${challenger?.name || 'Spieler 1'} und ${challenged?.name || 'Spieler 2'}. Soll diese Herausforderung als erledigt markiert werden?`,
        confirmText: 'Ja, als erledigt markieren',
        cancelText: 'Nein, offen lassen',
        type: 'info'
      });

      if (confirmed) {
        // Markiere Challenge als completed nach dem Spiel
        await db
          .collection("challenges")
          .doc(challengeToComplete.id)
          .update({
            status: "completed",
            completedAt: firebase.firestore.FieldValue.serverTimestamp(),
          });
      } else {
        challengeToComplete = null; // Don't mark as completed
      }
    }
  }

  await db.collection("doublesMatches").add({
    team1: { player1Id: t1p1, player2Id: t1p2 },
    team2: { player1Id: t2p1, player2Id: t2p2 },
    sets,
    date: firebase.firestore.FieldValue.serverTimestamp(),
  });

  // EVERY doubles match updates the pyramid
  let t1Sets = 0,
    t2Sets = 0;
  sets.forEach((set) => {
    if (set.t1 > set.t2) t1Sets++;
    else t2Sets++;
  });

  const winnerId = t1Sets > t2Sets ? t1p1 : t2p1;
  const loserId = t1Sets > t2Sets ? t2p1 : t1p1;

  await updatePyramidAfterChallenge(winnerId, loserId);

  // If this was from a challenge (via prefilled data), mark it as completed
  if (state.prefilledDoubles && state.prefilledDoubles.challengeId) {
    await db
      .collection("challenges")
      .doc(state.prefilledDoubles.challengeId)
      .update({
        status: "completed",
        completedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
  }

  // Clear prefilled data
  state.prefilledDoubles = null;

  // Reload pyramid after update (with delay to ensure Firestore has written)
  setTimeout(() => {
    loadPyramid();
  }, 1000);

  Toast.success("Doppel-Spiel erfolgreich eingetragen!");
  render();
}

async function updatePyramidAfterChallenge(winnerId, loserId) {
  const pyramidDoc = await db.collection("pyramid").doc("current").get();
  if (!pyramidDoc.exists) {
    console.log("Pyramid doc does not exist");
    return;
  }

  const pyramidData = pyramidDoc.data();
  const levels = pyramidLevelsToArray(pyramidData);

  // Flatten to get positions
  let flatPositions = flattenPyramidLevels(levels);

  const winnerPos = flatPositions.indexOf(winnerId);
  const loserPos = flatPositions.indexOf(loserId);

  if (winnerPos === -1 || loserPos === -1) {
    return;
  }

  // Only update if winner was below loser (higher position number = lower in pyramid)
  if (winnerPos > loserPos) {
    // Remove winner from current position
    const winner = flatPositions[winnerPos];
    flatPositions.splice(winnerPos, 1);

    // Insert winner at loser's position (pushing loser and everyone between down)
    flatPositions.splice(loserPos, 0, winner);

    // Rebuild pyramid structure
    const newPyramidData = buildPyramidLevels(flatPositions);

    await db
      .collection("pyramid")
      .doc("current")
      .set({
        ...newPyramidData,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
      });
  }
}