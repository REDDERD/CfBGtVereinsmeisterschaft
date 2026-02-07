// js/services/challenge-service.js
// Herausforderungs-bezogene Funktionen

async function addChallenge() {
  const challenger = document.getElementById("newChallenger").value;
  const challenged = document.getElementById("newChallenged").value;
  const dateStr = document.getElementById("challengeDate").value;

  if (!challenger || !challenged || !dateStr) {
    Toast.error("Bitte alle Felder ausfüllen");
    return;
  }

  if (challenger === challenged) {
    Toast.error("Herausforderer und Herausgeforderter müssen unterschiedlich sein");
    return;
  }

  // Validate date
  const selectedDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    Toast.warning("Das Datum darf nicht in der Vergangenheit liegen");
    return;
  }

  // *** NEU: Validierung der Challenge-Regeln ***
  const validationPassed = await checkChallengeValidation(challenger, challenged);
  if (!validationPassed) {
    return; // Abbrechen wenn Validierung fehlschlägt
  }

  // Convert to Firestore timestamp
  const timestamp = firebase.firestore.Timestamp.fromDate(selectedDate);

  await db.collection("challenges").add({
    challengerId: challenger,
    challengedId: challenged,
    date: timestamp,
    status: "pending",
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });

  document.getElementById("newChallenger").value = "";
  document.getElementById("newChallenged").value = "";
  document.getElementById("challengeDate").value = "";

  Toast.success("Herausforderung erfolgreich eingetragen!");
}

async function markChallengeCompleted(challengeId) {
  const confirmed = await Modal.confirm({
    title: 'Herausforderung abschließen?',
    message: 'Möchtest du diese Herausforderung als erledigt markieren?',
    confirmText: 'Als erledigt markieren',
    cancelText: 'Abbrechen',
    type: 'info'
  });
  
  if (confirmed) {
    await db.collection("challenges").doc(challengeId).update({
      status: "completed",
      completedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    Toast.success("Herausforderung als erledigt markiert");
  }
}

function enterResultFromChallenge(challengeId) {
  const challenge = state.challenges.find((c) => c.id === challengeId);
  if (challenge) {
    state.prefilledDoubles = {
      challengerId: challenge.challengerId,
      challengedId: challenge.challengedId,
      challengeId: challengeId,
    };
    state.currentPage = "doubles";
    render();
  }
}

async function initPyramid() {
  const doublesPlayers = state.players.filter((p) => p.doublesPool);

  if (doublesPlayers.length === 0) {
    Toast.error("Keine Spieler im Doppel-Pool!");
    return;
  }

  // Shuffle players
  const shuffled = [...doublesPlayers].sort(() => Math.random() - 0.5);
  const positions = shuffled.map((p) => p.id);

  const levelsObject = buildPyramidLevels(positions);

  const dataToSave = {
    ...levelsObject,
    lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
  };

  try {
    await db.collection("pyramid").doc("current").set(dataToSave);
    state.pyramidInitialized = true;
    Toast.success("Pyramide erfolgreich initialisiert!");

    // Force re-read from Firebase
    const doc = await db.collection("pyramid").doc("current").get();
  } catch (error) {
    console.error("❌ Fehler beim Initialisieren:", error);
    Toast.error("Fehler: " + error.message);
  }
}

async function debugFirebase() {
  try {
    const doc = await db.collection("pyramid").doc("current").get();

    if (doc.exists) {
      const data = doc.data();
      const levels = pyramidLevelsToArray(data);

      Toast.info(
        "Firebase Check: Doc exists: " +
          doc.exists +
          " | Keys: " +
          Object.keys(data).join(", ") +
          " | Levels: " +
          levels.length,
        5000
      );
    } else {
      Toast.error("Firebase Dokument existiert nicht!");
    }
  } catch (error) {
    console.error("Debug error:", error);
    Toast.error("Error: " + error.message);
  }
}