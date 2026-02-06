// js/services/match-service.js
// Match-Eintragung für Einzel und Doppel
// (Bearbeiten/Löschen → match-edit-handlers.js)
// (Status-Einstellungen → match-status-handlers.js)

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

  const player1 = state.players.find(player => player.id === p1);
  const player2 = state.players.find(player => player.id === p2);

  if (!player1 || !player2) {
    Toast.error("Spieler nicht gefunden");
    return;
  }

  // Validierung: Spieler müssen in derselben Gruppe sein
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

  // Validierung: Prüfe, ob diese Paarung bereits 2x gespielt wurde
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

  // Bestimme den Status basierend auf den Einstellungen
  const matchStatus = _getDefaultMatchStatus('singles');

  // Bestimme die Runde basierend auf der Spielergruppe
  const round = player1.singlesGroup === 1 ? 'group1' : 'group2';

  await db.collection("singlesMatches").add({
    player1Id: p1,
    player2Id: p2,
    sets,
    round,
    status: matchStatus,
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

  const t1player1 = state.players.find(p => p.id === t1p1);
  const t1player2 = state.players.find(p => p.id === t1p2);
  const t2player1 = state.players.find(p => p.id === t2p1);
  const t2player2 = state.players.find(p => p.id === t2p2);

  if (!t1player1 || !t1player2 || !t2player1 || !t2player2) {
    Toast.error("Einer oder mehrere Spieler nicht gefunden");
    return;
  }

  // Validierung: Pool-Kombination prüfen
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

  // Prüfe ob eine offene Challenge existiert
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
        await db
          .collection("challenges")
          .doc(challengeToComplete.id)
          .update({
            status: "completed",
            completedAt: firebase.firestore.FieldValue.serverTimestamp(),
          });
      } else {
        challengeToComplete = null;
      }
    }
  }

  const matchStatus = _getDefaultMatchStatus('doubles');

  await db.collection("doublesMatches").add({
    team1: { player1Id: t1p1, player2Id: t1p2 },
    team2: { player1Id: t2p1, player2Id: t2p2 },
    sets,
    status: matchStatus,
    date: firebase.firestore.FieldValue.serverTimestamp(),
  });

  // Pyramide aktualisieren (nur wenn bestätigt)
  if (matchStatus === 'confirmed') {
    let t1Sets = 0,
      t2Sets = 0;
    sets.forEach((set) => {
      if (set.t1 > set.t2) t1Sets++;
      else t2Sets++;
    });

    const winnerId = t1Sets > t2Sets ? t1p1 : t2p1;
    const loserId = t1Sets > t2Sets ? t2p1 : t1p1;

    await updatePyramidAfterChallenge(winnerId, loserId);
  }

  // Wenn aus einer Challenge heraus, als erledigt markieren
  if (state.prefilledDoubles && state.prefilledDoubles.challengeId) {
    await db
      .collection("challenges")
      .doc(state.prefilledDoubles.challengeId)
      .update({
        status: "completed",
        completedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
  }

  state.prefilledDoubles = null;

  if (matchStatus === 'confirmed') {
    state.pyramidLoading = true;
    render();
    await loadPyramid();
  }

  Toast.success("Doppel-Spiel erfolgreich eingetragen!");
}

// ========== Pyramide nach Herausforderung aktualisieren ==========

async function updatePyramidAfterChallenge(winnerId, loserId) {
  const pyramidDoc = await db.collection("pyramid").doc("current").get();
  if (!pyramidDoc.exists) {
    console.log("Pyramid doc does not exist");
    return;
  }

  const pyramidData = pyramidDoc.data();
  const levels = pyramidLevelsToArray(pyramidData);
  let flatPositions = flattenPyramidLevels(levels);

  const winnerPos = flatPositions.indexOf(winnerId);
  const loserPos = flatPositions.indexOf(loserId);

  if (winnerPos === -1 || loserPos === -1) {
    return;
  }

  // Nur aktualisieren wenn Gewinner unter Verlierer steht
  if (winnerPos > loserPos) {
    const winner = flatPositions[winnerPos];
    flatPositions.splice(winnerPos, 1);
    flatPositions.splice(loserPos, 0, winner);

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

// ========== Match-Status ändern (Einzel, Doppel, Knockout) ==========

async function updateMatchStatus(matchId, matchType, newStatus) {
  let collection;
  if (matchType === 'singles' || matchType === 'knockout') {
    collection = 'singlesMatches';
  } else if (matchType === 'doubles') {
    collection = 'doublesMatches';
  } else {
    Toast.error("Ungültiger Match-Typ");
    return;
  }
  
  try {
    const matchDoc = await db.collection(collection).doc(matchId).get();
    
    if (!matchDoc.exists) {
      Toast.error("Spiel nicht gefunden");
      return;
    }
    
    const oldStatus = matchDoc.data().status;
    
    await db.collection(collection).doc(matchId).update({
      status: newStatus,
      statusChangedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    
    // Wenn ein Doppelspiel bestätigt wird → Pyramide aktualisieren
    if (matchType === 'doubles' && newStatus === 'confirmed' && oldStatus !== 'confirmed') {
      const matchData = matchDoc.data();
      const sets = matchData.sets;
      
      let t1Sets = 0, t2Sets = 0;
      sets.forEach((set) => {
        if (set.t1 > set.t2) t1Sets++;
        else t2Sets++;
      });

      const winnerId = t1Sets > t2Sets ? matchData.team1.player1Id : matchData.team2.player1Id;
      const loserId = t1Sets > t2Sets ? matchData.team2.player1Id : matchData.team1.player1Id;

      await updatePyramidAfterChallenge(winnerId, loserId);
      
      state.pyramidLoading = true;
      render();
      await loadPyramid();
    }
    
    const statusText = newStatus === 'confirmed' ? 'bestätigt' : newStatus === 'rejected' ? 'abgelehnt' : 'unbestätigt';
    Toast.success(`Spiel wurde als ${statusText} markiert`);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Status:', error);
    Toast.error("Fehler beim Aktualisieren des Status");
  }
}

// ========== Hilfsfunktion: Standard-Status ermitteln ==========

function _getDefaultMatchStatus(type) {
  let matchStatus = 'unconfirmed';
  const settings = state.matchStatusSettings;
  
  if (settings) {
    if (state.isAdmin) {
      matchStatus = (type === 'singles') 
        ? (settings.singlesAdminDefault || 'confirmed')
        : (settings.doublesAdminDefault || 'confirmed');
    } else {
      matchStatus = (type === 'singles')
        ? (settings.singlesUserDefault || 'unconfirmed')
        : (settings.doublesUserDefault || 'unconfirmed');
    }
  } else if (state.isAdmin) {
    matchStatus = 'confirmed';
  }
  
  return matchStatus;
}
