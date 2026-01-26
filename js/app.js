// js/app.js
// App Initialisierung

try {
  initFirebaseListeners();
} catch (error) {
  console.error("Error initializing Firebase listeners:", error);
}

render();

// Load pyramid on startup
loadPyramid();