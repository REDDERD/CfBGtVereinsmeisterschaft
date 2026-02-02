// js/services/player-service.js
// Spieler-bezogene Funktionen

async function addPlayer() {
  const nameInput = document.getElementById("playerName");
  
  if (!nameInput) {
    Toast.error("Namensfeld nicht gefunden");
    return;
  }
  
  const name = nameInput.value.trim();

  if (!name) {
    Toast.error("Bitte Namen eingeben");
    return;
  }

  await db.collection("players").add({
    name,
    singlesGroup: null,
    doublesPool: null,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });

  nameInput.value = "";

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
  const singlesGroupSelect = document.getElementById(`editSingles_${playerId}`);
  const doublesPoolSelect = document.getElementById(`editDoubles_${playerId}`);
  
  const singlesGroup = singlesGroupSelect.value ? parseInt(singlesGroupSelect.value) : null;
  const doublesPool = doublesPoolSelect.value || null;

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