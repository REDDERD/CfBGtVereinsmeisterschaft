// js/services/firebase-listeners.js
// Firebase Realtime Listeners

// Speichert aktive Saison-Listener zum Aufräumen bei Saisonwechsel
let seasonUnsubscribers = [];

function initFirebaseListeners() {
  // Auth State
  auth.onAuthStateChanged(async (user) => {
    state.user = user;

    // Load admin status from Firestore if user is logged in
    if (user) {
      try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          state.isAdmin = userData.isAdmin || false;
        } else {
          state.isAdmin = false;
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        state.isAdmin = false;
      }
    } else {
      state.isAdmin = false;
    }

    render();
  });

  // ========== Globale Listener (saisonunabhängig) ==========

  // Active Season Setting — muss zuerst geladen werden
  db.collection("settings")
    .doc("activeSeason")
    .onSnapshot((doc) => {
      let liveYear;
      if (doc.exists) {
        liveYear = doc.data().year;
      } else {
        liveYear = new Date().getFullYear();
      }

      // Immer die "echte" Live-Saison tracken
      state.liveActiveSeason = liveYear;

      // Nur aktualisieren wenn NICHT im Archiv-Modus
      if (!state.archiveMode) {
        const previousSeason = state.activeSeason;
        state.activeSeason = liveYear;
        if (previousSeason !== state.activeSeason) {
          initSeasonListeners();
        }
      }
    });

  // Alle Saisons laden (für Admin-Dropdown)
  db.collection("seasons")
    .onSnapshot((snapshot) => {
      state.seasons = snapshot.docs.map((doc) => ({
        year: parseInt(doc.id),
        ...doc.data(),
      }));
      render();
    });

  // Knockout Settings (global)
  db.collection("settings")
    .doc("knockout")
    .onSnapshot((doc) => {
      if (doc.exists) {
        state.knockoutPhaseActive = doc.data().active || false;
        state.frozenStandings = doc.data().frozenStandings || null;
        render();
      }
    });

  // Knockout Config (global)
  db.collection("settings")
    .doc("knockoutConfig")
    .onSnapshot((doc) => {
      if (doc.exists) {
        state.knockoutConfig = doc.data();
        render();
      }
    });

  // Match Status Settings (global)
  db.collection("settings")
    .doc("defaultMatchStatus")
    .onSnapshot((doc) => {
      if (doc.exists) {
        state.matchStatusSettings = doc.data();
      } else {
        state.matchStatusSettings = {
          singlesAdminDefault: 'confirmed',
          singlesUserDefault: 'unconfirmed',
          doublesAdminDefault: 'confirmed',
          doublesUserDefault: 'unconfirmed',
        };
      }
      render();
    });

  // Matches Display Settings (global)
  db.collection("settings")
    .doc("matchesDisplay")
    .onSnapshot((doc) => {
      if (doc.exists) {
        state.matchesDisplaySettings = doc.data();
      } else {
        state.matchesDisplaySettings = {
          showUnconfirmedSingles: false,
          showUnconfirmedDoubles: false,
        };
      }
      render();
    });

  // Doubles Validation Mode (global)
  db.collection("settings")
    .doc("doublesValidation")
    .onSnapshot((doc) => {
      if (doc.exists) {
        state.doublesValidationMode = doc.data().mode || 'allow';
      } else {
        state.doublesValidationMode = 'allow';
      }
      render();
    });

  // Singles Validation Mode (global)
  db.collection("settings")
    .doc("singlesValidation")
    .onSnapshot((doc) => {
      if (doc.exists) {
        state.singlesValidationMode = doc.data().mode || 'allow';
      } else {
        state.singlesValidationMode = 'allow';
      }
      render();
    });

  // Ankündigungen (global, saisonunabhängig)
  db.collection("announcements")
    .orderBy("createdAt", "desc")
    .onSnapshot((snapshot) => {
      state.announcements = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      render();
    });
}

// ========== Saison-Listener (werden bei Saisonwechsel neu gestartet) ==========

function initSeasonListeners() {
  // Alte Listener aufräumen
  seasonUnsubscribers.forEach(unsub => unsub());
  seasonUnsubscribers = [];

  // State zurücksetzen für neue Saison
  state.players = [];
  state.singlesMatches = [];
  state.doublesMatches = [];
  state.knockoutMatches = [];
  state.pyramid = { levels: [] };
  state.pyramidInitialized = false;
  state.challenges = [];

  // Players
  seasonUnsubscribers.push(
    seasonCollection("players")
      .orderBy("name")
      .onSnapshot((snapshot) => {
        state.players = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        render();
      })
  );

  // Singles Matches
  seasonUnsubscribers.push(
    seasonCollection("singlesMatches")
      .orderBy("date", "desc")
      .onSnapshot((snapshot) => {
        const allSingles = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        state.singlesMatches = allSingles;

        state.knockoutMatches = allSingles.filter(match =>
          match.round && match.round !== 'group1' && match.round !== 'group2'
        );

        render();
      })
  );

  // Doubles Matches
  seasonUnsubscribers.push(
    seasonCollection("doublesMatches")
      .orderBy("date", "desc")
      .onSnapshot((snapshot) => {
        state.doublesMatches = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        render();
      })
  );

  // Pyramid
  seasonUnsubscribers.push(
    seasonDoc("pyramid", "current")
      .onSnapshot((doc) => {
        if (!state.pyramidLoading) {
          if (doc.exists) {
            const data = doc.data();
            const levelsArray = pyramidLevelsToArray(data);
            state.pyramid = {
              levels: levelsArray,
            };
            state.pyramidInitialized = true;
          } else {
            state.pyramidInitialized = false;
          }
          render();
        }
      })
  );

  // Challenges
  seasonUnsubscribers.push(
    seasonCollection("challenges")
      .where("status", "==", "pending")
      .onSnapshot((snapshot) => {
        state.challenges = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        render();
      })
  );

  render();
}

// Load pyramid manually
async function loadPyramid() {
  // Im Archiv-Modus niemals Pyramide schreiben (neue Spieler hinzufügen etc.)
  if (state.archiveMode) return;

  try {
    state.pyramidLoading = true;
    render();

    const doc = await seasonDoc("pyramid", "current").get();
    if (doc.exists) {
      const data = doc.data();
      const levelsArray = pyramidLevelsToArray(data);

      // Check if there are new players that need to be added
      const doublesPlayers = state.players.filter((p) => p.doublesPool);
      const doublesPlayerIds = doublesPlayers.map((p) => p.id);

      // Get current players in pyramid
      let flatPositions = flattenPyramidLevels(levelsArray);

      // Find new players not in pyramid
      const newPlayers = doublesPlayerIds.filter(
        (id) => !flatPositions.includes(id)
      );

      if (newPlayers.length > 0) {
        // Add new players to the bottom
        flatPositions = [...flatPositions, ...newPlayers];

        // Rebuild pyramid structure
        const newPyramidData = buildPyramidLevels(flatPositions);

        // Save updated pyramid
        await seasonDoc("pyramid", "current").set({
          ...newPyramidData,
          lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
        });

        // Reload after update
        const updatedDoc = await seasonDoc("pyramid", "current").get();
        if (updatedDoc.exists) {
          const updatedData = updatedDoc.data();
          const updatedLevels = pyramidLevelsToArray(updatedData);
          state.pyramid = {
            levels: updatedLevels,
          };
        }
      } else {
        state.pyramid = {
          levels: levelsArray,
        };
      }
      state.pyramidInitialized = true;
      state.pyramidLoading = false;
      render();
    } else {
      state.pyramidLoading = false;
      render();
    }
  } catch (error) {
    console.error("Error loading pyramid:", error);
    state.pyramidLoading = false;
    render();
  }
}