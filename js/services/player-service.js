// js/services/player-service.js
// Spieler-bezogene Funktionen

async function addPlayer() {
  const name = document.getElementById("newPlayerName").value.trim();
  const singlesGroup =
    parseInt(document.getElementById("newPlayerSinglesGroup").value) || null;
  const doublesPool = document.getElementById("newPlayerDoublesPool").checked;

  if (!name) {
    Toast.error("Bitte Namen eingeben");
    return;
  }

  await db.collection("players").add({
    name,
    singlesGroup,
    doublesPool,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });

  document.getElementById("newPlayerName").value = "";
  document.getElementById("newPlayerSinglesGroup").value = "";
  document.getElementById("newPlayerDoublesPool").checked = false;

  Toast.success("Spieler erfolgreich hinzugefügt!");
}

function editPlayer(playerId) {
  state.editingPlayer = playerId;
  render();
}

function cancelEditPlayer() {
  state.editingPlayer = null;
  render();
}

async function savePlayer(playerId) {
  const name = document.getElementById(`editName_${playerId}`).value.trim();
  const singlesGroup =
    parseInt(document.getElementById(`editSinglesGroup_${playerId}`).value) ||
    null;
  const doublesPool = document.getElementById(
    `editDoublesPool_${playerId}`
  ).checked;

  if (!name) {
    Toast.error("Bitte Namen eingeben");
    return;
  }

  await db.collection("players").doc(playerId).update({
    name,
    singlesGroup,
    doublesPool,
  });

  state.editingPlayer = null;
  render();
}

async function deletePlayer(playerId) {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return;

  const confirmed = await Modal.confirm({
    title: 'Spieler löschen?',
    message: `Möchtest du "${player.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`,
    confirmText: 'Löschen',
    cancelText: 'Abbrechen',
    type: 'danger'
  });

  if (confirmed) {
    await db.collection("players").doc(playerId).delete();
    Toast.success("Spieler gelöscht");
  }
}