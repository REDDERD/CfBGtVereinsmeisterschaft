// js/app.js
// App Initialisierung

// Dark Mode initialisieren (vor render, um Flash zu vermeiden)
initDarkMode();

try {
  initFirebaseListeners();
} catch (error) {
  console.error("Error initializing Firebase listeners:", error);
}

// Check for QR code login parameters
checkQrCodeLogin();

// Prüfe ob ein Archiv-Link in der URL ist
const archiveHash = parseHash();
if (archiveHash) {
  // Warte kurz bis activeSeason vom Listener gesetzt wurde, dann Archiv starten
  const waitForSeason = setInterval(() => {
    if (state.liveActiveSeason !== null || state.activeSeason !== null) {
      clearInterval(waitForSeason);
      enterArchiveMode(archiveHash.archiveYear, archiveHash.page);
    }
  }, 50);
  // Fallback: Nach 3s trotzdem starten
  setTimeout(() => {
    clearInterval(waitForSeason);
    if (!state.archiveMode) {
      enterArchiveMode(archiveHash.archiveYear, archiveHash.page);
    }
  }, 3000);
} else {
  render();
}

// Load pyramid on startup
loadPyramid();
