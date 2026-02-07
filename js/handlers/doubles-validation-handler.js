// js/handlers/doubles-validation-handler.js
// Handler für Challenge-Validierungs-Einstellungen

/**
 * Aktualisiert den Validierungsmodus für Doubles Challenges
 * @param {string} mode - 'allow' | 'warn' | 'block'
 */
async function updateValidationMode(mode) {
  if (!['allow', 'warn', 'block'].includes(mode)) {
    Toast.error('Ungültiger Validierungsmodus');
    return;
  }
  
  try {
    // In Firebase speichern
    await db.collection('settings').doc('doublesValidation').set({
      mode: mode,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedBy: state.user?.uid || 'unknown'
    });
    
    // State aktualisieren
    state.doublesValidationMode = mode;
    
    // Erfolgsbenachrichtigung
    const modeText = {
      'allow': 'Erlauben',
      'warn': 'Warnen',
      'block': 'Blockieren'
    }[mode];
    
    Toast.success(`Validierungsmodus auf "${modeText}" gesetzt`);
    
    render();
  } catch (error) {
    console.error('Fehler beim Speichern des Validierungsmodus:', error);
    Toast.error('Fehler beim Speichern: ' + error.message);
  }
}

/**
 * Lädt den Validierungsmodus aus Firebase
 * Sollte beim App-Start aufgerufen werden
 */
async function loadValidationMode() {
  try {
    const doc = await db.collection('settings').doc('doublesValidation').get();
    
    if (doc.exists) {
      const data = doc.data();
      state.doublesValidationMode = data.mode || 'allow';
    } else {
      // Wenn noch keine Einstellung existiert, Standardwert setzen
      state.doublesValidationMode = 'allow';
    }
  } catch (error) {
    console.error('Fehler beim Laden des Validierungsmodus:', error);
    state.doublesValidationMode = 'allow'; // Fallback
  }
}

// Sicherstellen, dass die Funktion global verfügbar ist
if (typeof window !== 'undefined') {
  window.updateValidationMode = updateValidationMode;
  window.loadValidationMode = loadValidationMode;
}