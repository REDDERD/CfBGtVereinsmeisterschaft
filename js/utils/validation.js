// js/utils/validation.js
// Validierungsfunktionen für Spielergebnisse

function validateSet(p1, p2) {
  const n1 = parseInt(p1);
  const n2 = parseInt(p2);
  
  // Mindestens ein Spieler muss gewonnen haben
  const winner = n1 > n2 ? 1 : (n2 > n1 ? 2 : null);
  if (winner === null) {
    return { valid: false, reason: "Unentschieden gibt es nicht" };
  }
  
  const higherScore = Math.max(n1, n2);
  const lowerScore = Math.min(n1, n2);
  
  // Standard-Gewinn: Erster auf 21 mit mindestens 2 Punkten Vorsprung
  if (higherScore === 21 && lowerScore <= 19) return true;
  
  // Knapper Gewinn: Bei 20:20 muss man 2 Punkte Vorsprung haben
  if (higherScore >= 21 && (higherScore - lowerScore) === 2) {
    // Aber maximal bis 30, danach gewinnt der erste bei 30
    if (higherScore <= 30) return true;
    
  }
  
  // Maximalpunkt-Regel: Bei 30 gewinnt man auch mit nur 1 Punkt Vorsprung
  if (higherScore === 30 && lowerScore === 29) return true;
  
  // Alle anderen Ergebnisse sind ungültig
  return false;
}

function validateMatchSets(sets) {
  if (!sets || sets.length < 2) return false;

  for (let i = 0; i < sets.length; i++) {
    const set = sets[i];
    if (!validateSet(set.n1 || set.t1, set.n2 || set.t2)) {
      return false;
    }
  }

  return true;
}
