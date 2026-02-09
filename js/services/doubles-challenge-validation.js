// js/services/doubles-challenge-validation.js
// Validierung für Doppel-Herausforderungen

/**
 * Findet Level und Index eines Spielers in der Pyramide.
 * @param {string} playerId - Die Spieler-ID
 * @param {Array<Array<string>>} levels - Die Pyramiden-Levels (Array von Arrays)
 * @returns {{ level: number, index: number } | null} Level (0-basiert) und Index, oder null
 */
function findPlayerInPyramid(playerId, levels) {
  for (let l = 0; l < levels.length; l++) {
    const idx = levels[l].indexOf(playerId);
    if (idx !== -1) {
      return { level: l, index: idx };
    }
  }
  return null;
}

/**
 * Ermittelt alle gültigen Herausforderungsziele für einen Spieler in der Pyramide.
 * 
 * Regeln:
 * 1. Gleiche Ebene, links: Alle Spieler mit kleinerem Index auf derselben Ebene
 * 2. Eine Ebene höher, rechts: Spieler auf der darüberliegenden Ebene, deren
 *    geometrisches Zentrum >= dem Zentrum des Herausforderers liegt.
 *    Formel: (2*j + 1) * n >= (2*i + 1) * m
 *    wobei i = Index des Herausforderers, n = Größe seiner Ebene,
 *          j = Index auf der oberen Ebene, m = Größe der oberen Ebene.
 * 
 * @param {string} challengerId - Die ID des Herausforderers
 * @param {Array<Array<string>>} levels - Die Pyramiden-Levels
 * @returns {string[]} Array der herausforderbaren Spieler-IDs
 */
function getValidChallengeTargets(challengerId, levels) {
  const pos = findPlayerInPyramid(challengerId, levels);
  if (!pos) return [];

  const { level: cLevel, index: cIndex } = pos;
  const n = levels[cLevel].length; // Größe der eigenen Ebene
  const targets = [];

  // 1. Gleiche Ebene, links: alle Spieler mit kleinerem Index
  for (let j = 0; j < cIndex; j++) {
    targets.push(levels[cLevel][j]);
  }

  // 2. Eine Ebene höher, rechts (geometrisches Zentrum)
  if (cLevel > 0) {
    const upperLevel = levels[cLevel - 1];
    const m = upperLevel.length; // Größe der oberen Ebene

    for (let j = 0; j < m; j++) {
      // Zentrum von j auf oberer Ebene: (2*j + 1) / (2*m)
      // Zentrum von i auf eigener Ebene:  (2*i + 1) / (2*n)
      // Bedingung "rechts": (2*j + 1) / (2*m) >= (2*i + 1) / (2*n)
      // Äquivalent (ohne Division): (2*j + 1) * n >= (2*i + 1) * m
      if ((2 * j + 1) * n >= (2 * cIndex + 1) * m) {
        targets.push(upperLevel[j]);
      }
    }
  }

  return targets;
}

/**
 * Prüft, ob eine Doubles Challenge regelkonform ist.
 * @param {string} challengerId - ID des Herausforderers
 * @param {string} challengedId - ID des Herausgeforderten
 * @returns {Object} { valid: boolean, reason: string }
 */
function validateDoublesChallenge(challengerId, challengedId) {
  const levels = state.pyramid.levels || [];

  if (levels.length === 0) {
    return { valid: false, reason: "Pyramide ist nicht initialisiert." };
  }

  // Spieler in der Pyramide finden
  const challengerPos = findPlayerInPyramid(challengerId, levels);
  const challengedPos = findPlayerInPyramid(challengedId, levels);

  if (!challengerPos) {
    return { valid: false, reason: "Herausforderer ist nicht in der Pyramide." };
  }
  if (!challengedPos) {
    return { valid: false, reason: "Herausgeforderter ist nicht in der Pyramide." };
  }

  // Herausforderer muss unterhalb stehen (höheres Level = weiter unten)
  if (challengerPos.level < challengedPos.level) {
    return {
      valid: false,
      reason: "Der Herausforderer steht über dem Herausgeforderten in der Pyramide."
    };
  }
  if (challengerPos.level === challengedPos.level && challengerPos.index <= challengedPos.index) {
    return {
      valid: false,
      reason: "Der Herausforderer steht nicht unterhalb des Herausgeforderten."
    };
  }

  // Prüfen ob der Herausgeforderte ein gültiges Ziel ist
  const validTargets = getValidChallengeTargets(challengerId, levels);

  if (validTargets.includes(challengedId)) {
    return { valid: true, reason: "" };
  }

  // Spezifischen Grund für die Ablehnung ermitteln
  if (challengerPos.level === challengedPos.level) {
    return {
      valid: false,
      reason: "Auf gleicher Ebene darf nur nach links herausgefordert werden."
    };
  }

  if (challengerPos.level - challengedPos.level === 1) {
    return {
      valid: false,
      reason: "Auf der übergeordneten Ebene darf nur nach rechts herausgefordert werden."
    };
  }

  return {
    valid: false,
    reason: "Herausforderung ist nur auf gleicher Ebene (links) oder eine Ebene höher (rechts) erlaubt."
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