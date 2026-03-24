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
 * 3. Mindestanzahl: Jeder Spieler kann mindestens 2 Spieler herausfordern
 *    (sofern mindestens 2 Spieler über ihm existieren).
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

  // 3. Mindestanzahl-Regel: Mindestens 2 Spieler herausforderbar
  if (targets.length < 2 && cLevel > 0) {
    const upperLevel = levels[cLevel - 1];
    const m = upperLevel.length;
    
    // Füge Spieler von der oberen Ebene hinzu (von links nach rechts),
    // bis mindestens 2 Ziele erreicht sind oder keine mehr verfügbar
    for (let j = 0; j < m && targets.length < 2; j++) {
      if (!targets.includes(upperLevel[j])) {
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
      reason: "Auf gleicher Ebene darf nur nach links herausgefordert werden (kleinerer Index)."
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
 * Hilfsfunktion: Prüft ob zwei Datumsobjekte denselben Kalendertag haben.
 */
function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

/**
 * Prüft, ob das Tageslimit für Herausforderungen eingehalten wird.
 * Jeder Spieler darf pro Tag 1x herausfordern und 1x herausgefordert werden.
 * @param {string} challengerId
 * @param {string} challengedId
 * @returns {{ valid: boolean, reason: string }}
 */
function checkDailyLimitValidation(challengerId, challengedId) {
  const today = new Date();
  const levels = state.pyramid.levels || [];

  const todaysMatches = state.doublesMatches.filter(match => {
    if (match.status === 'rejected') return false;
    if (!match.date) return false;
    const matchDate = match.date.toDate ? match.date.toDate() : new Date(match.date);
    return isSameDay(matchDate, today);
  });

  for (const match of todaysMatches) {
    const p1 = match.team1?.player1Id;
    const p2 = match.team2?.player1Id;
    if (!p1 || !p2) continue;

    // Rollen im gespeicherten Spiel anhand aktueller Pyramiden-Positionen bestimmen
    const pos1 = findPlayerInPyramid(p1, levels);
    const pos2 = findPlayerInPyramid(p2, levels);
    if (!pos1 || !pos2) continue;

    let matchChallengerId, matchChallengedId;
    if (pos1.level > pos2.level || (pos1.level === pos2.level && pos1.index > pos2.index)) {
      matchChallengerId = p1;
      matchChallengedId = p2;
    } else {
      matchChallengerId = p2;
      matchChallengedId = p1;
    }

    if (matchChallengerId === challengerId) {
      return {
        valid: false,
        reason: `${getPlayerName(challengerId)} hat heute bereits eine Herausforderung ausgesprochen.`
      };
    }
    if (matchChallengedId === challengedId) {
      return {
        valid: false,
        reason: `${getPlayerName(challengedId)} wurde heute bereits herausgefordert.`
      };
    }
  }

  return { valid: true, reason: '' };
}

/**
 * Prüft die Challenge-Validierung und zeigt ggf. Modal/warnt/blockiert
 * basierend auf den Admin-Einstellungen.
 * Berücksichtigt sowohl die Pyramiden-Positionsregeln als auch das Tageslimit.
 * @param {string} challengerId
 * @param {string} challengedId
 * @returns {Promise<boolean>} true = fortfahren, false = abbrechen
 */
async function checkChallengeValidation(challengerId, challengedId) {
  const validationMode = state.doublesValidationMode || 'allow';

  const pyramidValidation = validateDoublesChallenge(challengerId, challengedId);
  const dailyValidation = checkDailyLimitValidation(challengerId, challengedId);

  const isValid = pyramidValidation.valid && dailyValidation.valid;
  const reason = !pyramidValidation.valid ? pyramidValidation.reason : dailyValidation.reason;

  if (isValid) return true;

  switch (validationMode) {
    case 'allow':
      return true;

    case 'warn': {
      const challengerName = getPlayerName(challengerId);
      const challengedName = getPlayerName(challengedId);
      const confirmed = await Modal.warn({
        title: 'Regelverstoß möglich',
        message: `Die Herausforderung ${challengerName} vs ${challengedName} verstößt möglicherweise gegen die Herausforderungsregeln:\n\n${reason}\n\nMöchtest du die Herausforderung trotzdem eintragen?`,
        confirmText: 'Ja, eintragen',
        cancelText: 'Abbrechen'
      });
      return confirmed;
    }

    case 'block':
      Toast.error(`Herausforderung nicht erlaubt: ${reason}`);
      return false;

    case 'admin_only': {
      if (!state.isAdmin) {
        Toast.error(`Herausforderung nicht erlaubt: ${reason}`);
        return false;
      }
      const challengerNameAdmin = getPlayerName(challengerId);
      const challengedNameAdmin = getPlayerName(challengedId);
      const confirmedAdmin = await Modal.warn({
        title: 'Regelverstoß möglich (Admin)',
        message: `Die Herausforderung ${challengerNameAdmin} vs ${challengedNameAdmin} verstößt möglicherweise gegen die Herausforderungsregeln:\n\n${reason}\n\nAls Admin kannst du das Spiel trotzdem eintragen. Möchtest du fortfahren?`,
        confirmText: 'Ja, eintragen',
        cancelText: 'Abbrechen'
      });
      return confirmedAdmin;
    }

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
  const levels = state.pyramid.levels || [];
  
  if (levels.length === 0) {
    return true; // Keine Validierung wenn Pyramide nicht initialisiert
  }
  
  // Positionen beider Spieler ermitteln
  const pos1 = findPlayerInPyramid(t1p1, levels);
  const pos2 = findPlayerInPyramid(t2p1, levels);
  
  if (!pos1 || !pos2) {
    return true; // Keine Validierung wenn Spieler nicht in Pyramide
  }
  
  // Bestimme wer der untere Spieler ist (Herausforderer)
  let challengerId, challengedId;
  
  if (pos1.level > pos2.level) {
    // Spieler 1 ist tiefer (höheres Level = weiter unten)
    challengerId = t1p1;
    challengedId = t2p1;
  } else if (pos2.level > pos1.level) {
    // Spieler 2 ist tiefer
    challengerId = t2p1;
    challengedId = t1p1;
  } else {
    // Gleiche Ebene: der mit höherem Index ist der Herausforderer
    if (pos1.index > pos2.index) {
      challengerId = t1p1;
      challengedId = t2p1;
    } else {
      challengerId = t2p1;
      challengedId = t1p1;
    }
  }
  
  // Verwende die normale Challenge-Validierung mit dem unteren Spieler als Herausforderer
  return await checkChallengeValidation(challengerId, challengedId);
}