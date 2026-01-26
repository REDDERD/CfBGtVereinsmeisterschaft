// js/services/firebase-listeners.js
// Firebase Realtime Listeners

function initFirebaseListeners() {
  // Auth State
  auth.onAuthStateChanged((user) => {
    state.user = user;
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
      state.singlesMatches = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
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
      if (doc.exists) {
        state.pyramid = doc.data();
      }
      render();
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

  // Knockout Matches
  db.collection("knockoutMatches")
    .orderBy("createdAt", "desc")
    .onSnapshot((snapshot) => {
      state.knockoutMatches = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      render();
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
}

// Load pyramid manually
async function loadPyramid() {
  try {
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
      render();
    }
  } catch (error) {
    console.error("Error loading pyramid:", error);
  }
}