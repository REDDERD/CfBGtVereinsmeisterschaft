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

  await seasonCollection("players").add({
    name,
    singlesGroup: null,
    doublesPool: null,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });

  nameInput.value = "";

  Toast.success("Spieler erfolgreich hinzugefügt!");
}

/**
 * Darf der Spieler in der Doppel-Finalrunde (K.O.-Phase) als Partner zugelost
 * werden? Ohne gesetztes Feld gilt er als zugelassen.
 */
function isPlayerDoublesKnockoutEligible(player) {
  return player?.doublesKnockoutEligible !== false;
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
  
  const knockoutEligibleInput = document.getElementById(`editKnockoutEligible_${playerId}`);

  const singlesGroup = singlesGroupSelect.value ? parseInt(singlesGroupSelect.value) : null;
  const doublesPool = doublesPoolSelect.value || null;
  const doublesKnockoutEligible = knockoutEligibleInput ? knockoutEligibleInput.checked : true;

  if (!name) {
    Toast.error("Bitte Namen eingeben");
    return;
  }

  await seasonCollection("players").doc(playerId).update({
    name,
    singlesGroup,
    doublesPool,
    doublesKnockoutEligible,
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
    await seasonCollection("players").doc(playerId).delete();
    Toast.success("Spieler gelöscht");
  }
}