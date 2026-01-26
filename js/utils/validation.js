// js/utils/validation.js
// Validierungsfunktionen für Spielergebnisse

function validateSet(p1, p2) {
  const n1 = parseInt(p1);
  const n2 = parseInt(p2);

  if (isNaN(n1) || isNaN(n2)) return false;
  if (n1 < 0 || n2 < 0) return false;

  // Einer muss mindestens 21 haben
  if (n1 < 21 && n2 < 21) return false;

  // Gewinner muss 2 Punkte Vorsprung haben ab 20:20
  if (n1 >= 20 && n2 >= 20) {
    if (Math.abs(n1 - n2) < 2) return false;
  }

  // Maximal 30 Punkte
  if (n1 > 30 || n2 > 30) return false;

  return true;
}

function validateMatchSets(sets) {
  if (!sets || sets.length < 2) return false;
  
  for (let i = 0; i < sets.length; i++) {
    const set = sets[i];
    if (!validateSet(set.p1 || set.t1, set.p2 || set.t2)) {
      return false;
    }
  }
  
  return true;
}