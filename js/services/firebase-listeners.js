// js/services/firebase-listeners.js
// Firebase Realtime Listeners

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

  // Players
  db.collection("players")
    .orderBy("name")
    .onSnapshot((snapshot) => {
      state.players = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      render();
    });

  // Singles Matches
  db.collection("singlesMatches")
    .orderBy("date", "desc")
    .onSnapshot((snapshot) => {
      const allSingles = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Filtere nach Gruppenspiele und KO-Spiele
      state.singlesMatches = allSingles;
      
      // Extrahiere die KO-Matches für separate Anzeige
      state.knockoutMatches = allSingles.filter(match => 
        match.round && match.round !== 'group1' && match.round !== 'group2'
      );
      
      render();
    });

  // Doubles Matches
  db.collection("doublesMatches")
    .orderBy("date", "desc")
    .onSnapshot((snapshot) => {
      state.doublesMatches = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      render();
    });

  // Pyramid
  db.collection("pyramid")
    .doc("current")
    .onSnapshot((doc) => {
      // Only update if we're not in the middle of a manual load
      // Manual loads happen after match entry to ensure proper processing
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
    });

  // Challenges
  db.collection("challenges")
    .where("status", "==", "pending")
    .onSnapshot((snapshot) => {
      state.challenges = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      render();
    });

  // Knockout Settings
  db.collection("settings")
    .doc("knockout")
    .onSnapshot((doc) => {
      if (doc.exists) {
        state.knockoutPhaseActive = doc.data().active || false;
        state.frozenStandings = doc.data().frozenStandings || null;
        render();
      }
    });

  // Knockout Config
  db.collection("settings")
    .doc("knockoutConfig")
    .onSnapshot((doc) => {
      if (doc.exists) {
        state.knockoutConfig = doc.data();
        render();
      }
    });

  // Match Status Settings
  db.collection("settings")
    .doc("defaultMatchStatus")
    .onSnapshot((doc) => {
      if (doc.exists) {
        state.matchStatusSettings = doc.data();
      } else {
        // Fallback zu Standard-Werten
        state.matchStatusSettings = {
          singlesAdminDefault: 'confirmed',
          singlesUserDefault: 'unconfirmed',
          doublesAdminDefault: 'confirmed',
          doublesUserDefault: 'unconfirmed',
        };
      }
      render();
    });
  
  // Matches Display Settings
  db.collection("settings")
    .doc("matchesDisplay")
    .onSnapshot((doc) => {
      if (doc.exists) {
        state.matchesDisplaySettings = doc.data();
      } else {
        // Fallback zu Standard-Werten
        state.matchesDisplaySettings = {
          showUnconfirmedSingles: false,
          showUnconfirmedDoubles: false,
        };
      }
      render();
    });
  
  // Doubles Validation Mode
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
}

// Load pyramid manually
async function loadPyramid() {

  try {
    state.pyramidLoading = true;
    render();

    const doc = await db.collection("pyramid").doc("current").get();
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
        await db.collection("pyramid").doc("current").set({
          ...newPyramidData,
          lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
        });

        // Reload after update
        const updatedDoc = await db.collection("pyramid").doc("current").get();
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