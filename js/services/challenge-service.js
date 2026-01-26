// js/services/challenge-service.js
// Herausforderungs-bezogene Funktionen

async function addChallenge() {
  const challenger = document.getElementById("newChallenger").value;
  const challenged = document.getElementById("newChallenged").value;
  const dateStr = document.getElementById("challengeDate").value;

  if (!challenger || !challenged || !dateStr) {
    alert("Bitte alle Felder ausfüllen");
    return;
  }

  if (challenger === challenged) {
    alert("Herausforderer und Herausgeforderter müssen unterschiedlich sein");
    return;
  }

  // Validate date
  const selectedDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    alert("Das Datum darf nicht in der Vergangenheit liegen");
    return;
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

  alert("Herausforderung erfolgreich eingetragen!");
}

async function markChallengeCompleted(challengeId) {
  if (confirm("Herausforderung als erledigt markieren?")) {
    await db.collection("challenges").doc(challengeId).update({
      status: "completed",
      completedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    alert("Herausforderung als erledigt markiert");
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
    alert("Keine Spieler im Doppel-Pool!");
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
    alert("Pyramide erfolgreich initialisiert!");

    // Force re-read from Firebase
    const doc = await db.collection("pyramid").doc("current").get();
  } catch (error) {
    console.error("❌ Fehler beim Initialisieren:", error);
    alert("Fehler: " + error.message);
  }
}

async function debugFirebase() {
  try {
    const doc = await db.collection("pyramid").doc("current").get();

    if (doc.exists) {
      const data = doc.data();
      const levels = pyramidLevelsToArray(data);

      alert(
        "Firebase Check:\nDoc exists: " +
          doc.exists +
          "\nKeys: " +
          Object.keys(data).join(", ") +
          "\nLevels array length: " +
          levels.length
      );
    } else {
      alert("Firebase Dokument existiert nicht!");
    }
  } catch (error) {
    console.error("Debug error:", error);
    alert("Error: " + error.message);
  }
}