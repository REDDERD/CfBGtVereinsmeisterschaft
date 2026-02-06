// js/services/ranking-service.js
// Doppel-Rangfolge Verwaltung (Pyramide hoch/runter, speichern, entfernen)

function movePlayerUp(index) {
  const levels = state.pyramid.levels || [];
  const flatPositions = flattenPyramidLevels(levels);

  if (index > 0) {
    const temp = flatPositions[index];
    flatPositions[index] = flatPositions[index - 1];
    flatPositions[index - 1] = temp;

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

    state.pyramid.levels = rebuildPyramidLevels(flatPositions);
    render();
  }
}

async function removePlayerFromRanking(index, playerId) {
  const playerName = getPlayerName(playerId);

  const confirmed = await Modal.confirm({
    title: "Spieler aus Rangfolge löschen",
    message: `Möchtest du wirklich <strong>${playerName}</strong> aus der Doppel-Rangfolge entfernen? Diese Aktion kann nicht rückgängig gemacht werden.`,
    confirmText: "Ja, löschen",
    cancelText: "Abbrechen",
    type: "danger",
  });

  if (!confirmed) {
    return;
  }

  try {
    const levels = state.pyramid.levels || [];
    const flatPositions = flattenPyramidLevels(levels);

    flatPositions.splice(index, 1);

    state.pyramid.levels = rebuildPyramidLevels(flatPositions);

    const levelsObject = {};
    state.pyramid.levels.forEach((level, idx) => {
      levelsObject[`level${idx + 1}`] = level;
    });

    await db
      .collection("pyramid")
      .doc("current")
      .set({
        ...levelsObject,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
      });

    Toast.success(`${playerName} wurde aus der Rangfolge entfernt`);
    render();
  } catch (error) {
    console.error("Error removing player from ranking:", error);
    Toast.error("Fehler beim Entfernen des Spielers");
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

  Toast.success("Rangfolge gespeichert!");
}
