// js/services/doubles-challenge-validation.js
// Validierung für Doppel-Herausforderungen

/**
 * Prüft, ob eine Doubles Challenge regelkonform ist
 * @param {string} challengerId - ID des Herausforderers
 * @param {string} challengedId - ID des Herausgeforderten
 * @returns {Object} { valid: boolean, reason: string }
 */
function validateDoublesChallenge(challengerId, challengedId) {
  // TODO: Hier wird die eigentliche Validierungslogik implementiert
  // wenn die Regeln feststehen
  
  // Derzeit immer erlaubt
  return {
    valid: false,
    reason: "Testgrund hier einpflegen!"
  };
}

/**
 * Prüft die Challenge-Validierung und zeigt ggf. Modal/warnt/blockiert
 * basierend auf den Admin-Einstellungen
 * @param {string} challengerId 
 * @param {string} challengedId 
 * @returns {Promise<boolean>} true = fortfahren, false = abbrechen
 */
async function checkChallengeValidation(challengerId, challengedId) {
  // Validierungsmodus aus State holen
  const validationMode = state.doublesValidationMode || 'allow';
  
  // Validierung durchführen
  const validation = validateDoublesChallenge(challengerId, challengedId);
  
  // Wenn gültig, immer erlauben
  if (validation.valid) {
    return true;
  }
  
  // Wenn ungültig, je nach Modus reagieren
  switch (validationMode) {
    case 'allow':
      // Nichts tun, trotzdem erlauben
      return true;
      
    case 'warn':
      // Warnung mit Modal anzeigen
      const challengerName = getPlayerName(challengerId);
      const challengedName = getPlayerName(challengedId);
      
      const confirmed = await Modal.warn({
        title: 'Regelverstoß möglich',
        message: `Die Herausforderung ${challengerName} vs ${challengedName} verstößt möglicherweise gegen die Herausforderungsregeln:\n\n${validation.reason}\n\nMöchtest du die Herausforderung trotzdem eintragen?`,
        confirmText: 'Ja, eintragen',
        cancelText: 'Abbrechen'
      });
      
      return confirmed;
      
    case 'block':
      // Komplett blockieren
      Toast.error(`Herausforderung nicht erlaubt: ${validation.reason}`);
      return false;
      
    default:
      return true;
  }
}

/**
 * Prüft die Match-Validierung beim Eintragen von Doppelspielen
 * @param {string} t1p1 - Team 1 Spieler 1 ID
 * @param {string} t2p1 - Team 2 Spieler 1 ID
 * @returns {Promise<boolean>} true = fortfahren, false = abbrechen
 */
async function checkDoublesMatchValidation(t1p1, t2p1) {
  // Verwende die gleiche Logik wie bei Challenges
  return await checkChallengeValidation(t1p1, t2p1);
}