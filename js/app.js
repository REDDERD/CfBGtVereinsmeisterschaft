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

render();

// Load pyramid on startup
loadPyramid();