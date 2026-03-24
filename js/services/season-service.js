// js/services/season-service.js
// Saison-Verwaltung: Wechsel, Anlegen, Archiv-Sichtbarkeit

/**
 * Wechselt die aktive Saison
 */
async function changeActiveSeason(yearStr) {
  const year = parseInt(yearStr);
  if (!year || isNaN(year)) {
    Toast.error("Ungültiges Jahr");
    return;
  }

  try {
    await db.collection("settings").doc("activeSeason").set({ year });
    Toast.success(`Saison ${year} aktiviert`);
  } catch (error) {
    console.error("Fehler beim Wechseln der Saison:", error);
    Toast.error("Fehler beim Wechseln der Saison");
  }
}

/**
 * Erstellt eine neue Saison
 */
async function createNewSeason() {
  const yearInput = document.getElementById("newSeasonYear");
  const year = parseInt(yearInput?.value);

  if (!year || year < 2020 || year > 2099) {
    Toast.error("Bitte ein gültiges Jahr eingeben (2020–2099)");
    return;
  }

  // Prüfen ob Saison schon existiert
  const existingDoc = await db.collection("seasons").doc(String(year)).get();
  if (existingDoc.exists) {
    Toast.error(`Saison ${year} existiert bereits`);
    return;
  }

  const copyPlayers = document.getElementById("copyPlayers")?.checked || false;
  const copyPlayerSettings = document.getElementById("copyPlayerSettings")?.checked || false;
  const archiveVisible = document.getElementById("newSeasonArchiveVisible")?.checked ?? true;

  const confirmed = await Modal.confirm({
    title: `Saison ${year} anlegen?`,
    message: `Neue Saison ${year} wird angelegt.${copyPlayers ? ` Spieler werden aus Saison ${state.activeSeason} übernommen${copyPlayerSettings ? ' (inkl. Gruppen/Pools)' : ' (ohne Gruppen/Pools)'}.` : ''}`,
    confirmText: "Anlegen",
    cancelText: "Abbrechen",
    type: "info",
  });

  if (!confirmed) return;

  try {
    // 1. Saison-Dokument erstellen
    await db.collection("seasons").doc(String(year)).set({
      label: `Saison ${year}`,
      archiveVisible: archiveVisible,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    // 2. Spieler kopieren (falls gewünscht)
    if (copyPlayers && state.players.length > 0) {
      const targetPlayersCol = db.collection("seasons").doc(String(year)).collection("players");

      for (const player of state.players) {
        const playerData = {
          name: player.name,
          singlesGroup: copyPlayerSettings ? (player.singlesGroup || null) : null,
          doublesPool: copyPlayerSettings ? (player.doublesPool || null) : null,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        };
        await targetPlayersCol.add(playerData);
      }
    }

    Toast.success(`Saison ${year} erfolgreich angelegt${copyPlayers ? ` (${state.players.length} Spieler kopiert)` : ''}`);

    // Zur neuen Saison wechseln?
    const switchConfirmed = await Modal.confirm({
      title: "Zur neuen Saison wechseln?",
      message: `Möchtest du jetzt zur Saison ${year} wechseln?`,
      confirmText: "Ja, wechseln",
      cancelText: "Nein, bei ${state.activeSeason} bleiben",
      type: "info",
    });

    if (switchConfirmed) {
      await changeActiveSeason(String(year));
    }
  } catch (error) {
    console.error("Fehler beim Anlegen der Saison:", error);
    Toast.error("Fehler beim Anlegen: " + error.message);
  }
}

/**
 * Aktualisiert die Archiv-Sichtbarkeit einer Saison
 */
async function updateSeasonArchiveVisibility(year, visible) {
  try {
    await db.collection("seasons").doc(String(year)).update({
      archiveVisible: visible,
    });
    // Lokalen State aktualisieren
    const season = state.seasons?.find(s => s.year === year);
    if (season) {
      season.archiveVisible = visible;
    }
    Toast.success(`Saison ${year} ${visible ? 'wird' : 'wird nicht'} im Archiv angezeigt`);
  } catch (error) {
    console.error("Fehler beim Aktualisieren:", error);
    Toast.error("Fehler beim Aktualisieren");
  }
}
