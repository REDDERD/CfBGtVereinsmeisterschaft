// js/handlers/doubles-pool-visualization-handler.js
// Handler für Pool-Visualisierung auf der DoublesPage

/**
 * Toggle für Pool-Visualisierung
 */
function togglePoolVisualization() {
  state.doublesPoolVisualization = !state.doublesPoolVisualization;
  
  // Optional: In localStorage speichern, damit Einstellung erhalten bleibt
  try {
    localStorage.setItem('doublesPoolVisualization', state.doublesPoolVisualization);
  } catch (e) {
    console.warn('Konnte Pool-Visualisierung nicht in localStorage speichern:', e);
  }
  
  render();
}

/**
 * Lädt die gespeicherte Pool-Visualisierungs-Einstellung
 * Sollte beim App-Start aufgerufen werden
 */
function loadPoolVisualizationPreference() {
  try {
    const saved = localStorage.getItem('doublesPoolVisualization');
    if (saved !== null) {
      state.doublesPoolVisualization = saved === 'true';
    }
  } catch (e) {
    console.warn('Konnte Pool-Visualisierung nicht aus localStorage laden:', e);
  }
}