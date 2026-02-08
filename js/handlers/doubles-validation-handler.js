// js/handlers/doubles-validation-handler.js
// Handler für Challenge-Validierungs-Einstellungen

/**
 * Aktualisiert den Validierungsmodus für Challenges
 * @param {string} mode - 'allow' | 'warn' | 'block'
 * @param {string} type - 'singles' | 'doubles'
 */
async function updateValidationMode(mode, type = 'doubles') {
  if (!['allow', 'warn', 'block'].includes(mode)) {
    Toast.error('Ungültiger Validierungsmodus');
    return;
  }
  
  if (!['singles', 'doubles'].includes(type)) {
    Toast.error('Ungültiger Spieltyp');
    return;
  }
  
  try {
    const docName = type === 'singles' ? 'singlesValidation' : 'doublesValidation';
    
    // In Firebase speichern
    await db.collection('settings').doc(docName).set({
      mode: mode,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedBy: state.user?.uid || 'unknown'
    });
    
    // State aktualisieren
    if (type === 'singles') {
      state.singlesValidationMode = mode;
    } else {
      state.doublesValidationMode = mode;
    }
    
    // Erfolgsbenachrichtigung
    const modeText = {
      'allow': 'Erlauben',
      'warn': 'Warnen',
      'block': 'Blockieren'
    }[mode];
    
    const typeText = type === 'singles' ? 'Einzel' : 'Doppel';
    
    Toast.success(`${typeText}-Validierungsmodus auf "${modeText}" gesetzt`);
    
    render();
  } catch (error) {
    console.error('Fehler beim Speichern des Validierungsmodus:', error);
    Toast.error('Fehler beim Speichern: ' + error.message);
  }
}

/**
 * Lädt die Validierungsmodi aus Firebase
 * Sollte beim App-Start aufgerufen werden
 */
async function loadValidationMode() {
  try {
    // Lade Doubles Validierung
    const doublesDoc = await db.collection('settings').doc('doublesValidation').get();
    if (doublesDoc.exists) {
      const data = doublesDoc.data();
      state.doublesValidationMode = data.mode || 'allow';
    } else {
      state.doublesValidationMode = 'allow';
    }
    
    // Lade Singles Validierung
    const singlesDoc = await db.collection('settings').doc('singlesValidation').get();
    if (singlesDoc.exists) {
      const data = singlesDoc.data();
      state.singlesValidationMode = data.mode || 'allow';
    } else {
      state.singlesValidationMode = 'allow';
    }
  } catch (error) {
    console.error('Fehler beim Laden der Validierungsmodi:', error);
    state.doublesValidationMode = 'allow'; // Fallback
    state.singlesValidationMode = 'allow'; // Fallback
  }
}

// Sicherstellen, dass die Funktion global verfügbar ist
if (typeof window !== 'undefined') {
  window.updateValidationMode = updateValidationMode;
  window.loadValidationMode = loadValidationMode;
}