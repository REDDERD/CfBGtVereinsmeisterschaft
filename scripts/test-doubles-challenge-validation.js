// scripts/test-doubles-challenge-validation.js
//
// Test für die Doppel-Herausforderungs-Validierung.
// Zum Ausführen: im Browser-Konsole oder als Node.js-Script.
// Prüft alle Positionen einer Pyramide gegen erwartete Ergebnisse.
//
// Verwendung: Datei in den scripts/-Ordner kopieren und mit Node.js ausführen:
//   node scripts/test-doubles-challenge-validation.js

// ============================================================
// Funktionen aus doubles-challenge-validation.js (Kopie für Tests)
// ============================================================

function findPlayerInPyramid(playerId, levels) {
  for (let l = 0; l < levels.length; l++) {
    const idx = levels[l].indexOf(playerId);
    if (idx !== -1) {
      return { level: l, index: idx };
    }
  }
  return null;
}

function getValidChallengeTargets(challengerId, levels) {
  const pos = findPlayerInPyramid(challengerId, levels);
  if (!pos) return [];

  const { level: cLevel, index: cIndex } = pos;
  const n = levels[cLevel].length;
  const targets = [];

  // 1. Gleiche Ebene, links
  for (let j = 0; j < cIndex; j++) {
    targets.push(levels[cLevel][j]);
  }

  // 2. Eine Ebene höher, rechts (Zentrum-Formel)
  if (cLevel > 0) {
    const upperLevel = levels[cLevel - 1];
    const m = upperLevel.length;
    for (let j = 0; j < m; j++) {
      if ((2 * j + 1) * n >= (2 * cIndex + 1) * m) {
        targets.push(upperLevel[j]);
      }
    }
  }

  return targets;
}

function validateDoublesChallenge(challengerId, challengedId, levels) {
  if (levels.length === 0) {
    return { valid: false, reason: "Pyramide ist nicht initialisiert." };
  }
  const challengerPos = findPlayerInPyramid(challengerId, levels);
  const challengedPos = findPlayerInPyramid(challengedId, levels);
  if (!challengerPos) return { valid: false, reason: "Herausforderer nicht in Pyramide." };
  if (!challengedPos) return { valid: false, reason: "Herausgeforderter nicht in Pyramide." };

  if (challengerPos.level < challengedPos.level) {
    return { valid: false, reason: "Herausforderer steht über dem Herausgeforderten." };
  }
  if (challengerPos.level === challengedPos.level && challengerPos.index <= challengedPos.index) {
    return { valid: false, reason: "Herausforderer steht nicht unterhalb." };
  }

  const validTargets = getValidChallengeTargets(challengerId, levels);
  if (validTargets.includes(challengedId)) {
    return { valid: true, reason: "" };
  }

  if (challengerPos.level === challengedPos.level) {
    return { valid: false, reason: "Gleiche Ebene: nur nach links." };
  }
  if (challengerPos.level - challengedPos.level === 1) {
    return { valid: false, reason: "Obere Ebene: nur nach rechts." };
  }
  return { valid: false, reason: "Nur gleiche Ebene (links) oder eine höher (rechts)." };
}

// ============================================================
// Test-Framework
// ============================================================

let testsPassed = 0;
let testsFailed = 0;
let testsWarned = 0;

function assert(condition, message) {
  if (condition) {
    testsPassed++;
    console.log(`  ✅ ${message}`);
  } else {
    testsFailed++;
    console.log(`  ❌ ${message}`);
  }
}

function warn(message) {
  testsWarned++;
  console.log(`  ⚠️  ${message}`);
}

function arraysEqual(a, b) {
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return JSON.stringify(sortedA) === JSON.stringify(sortedB);
}

// ============================================================
// Test 1: Standard-Pyramide 1-2-3-4-5 (aus dem PDF-Beispiel)
// ============================================================

console.log("\n═══════════════════════════════════════════════════");
console.log("TEST 1: Standard-Pyramide 1-2-3-4-5 (PDF-Beispiel)");
console.log("═══════════════════════════════════════════════════\n");

console.log("Pyramide:");
console.log("           P1");
console.log("         P2  P3");
console.log("       P4  P5  P6");
console.log("     P7  P8  P9  P10");
console.log("  P11 P12  P13  P14  P15\n");

const standardLevels = [
  ["P1"],
  ["P2", "P3"],
  ["P4", "P5", "P6"],
  ["P7", "P8", "P9", "P10"],
  ["P11", "P12", "P13", "P14", "P15"]
];

// Erwartete Ziele aus dem PDF (Seite 5):
// Platz 1: niemand (kann nicht herausfordern, steht ganz oben)
// Platz 2: [1]
// Platz 3: [1, 2]          ← PDF sagt 1 ist Ziel, Formel sagt nein (s.u.)
// Platz 4: [2, 3]
// Platz 5: [3, 4]
// Platz 6: [4, 5]
// Platz 7: [4, 5, 6]
// Platz 8: [5, 6, 7]
// Platz 9: [6, 7, 8]
// Platz 10: [7, 8, 9]
// Platz 11: [7, 8, 9, 10]
// Platz 12: [7, 8, 9, 10, 11]  ← PDF sagt 7 ist Ziel, Formel sagt nein (s.u.)
// Platz 13: [9, 10, 11, 12]
// Platz 14: [10, 11, 12, 13]

const expectedTargets = {
  "P1":  [],                               // Spitze, kann niemanden herausfordern
  "P2":  ["P1"],                            // L2[0] → oben: P1
  "P3":  ["P2"],                            // L2[1] → links: P2  (s. Hinweis unten)
  "P4":  ["P2", "P3"],                      // L3[0] → oben: P2, P3
  "P5":  ["P4", "P3"],                      // L3[1] → links: P4, oben: P3
  "P6":  ["P4", "P5"],                      // L3[2] → links: P4, P5
  "P7":  ["P4", "P5", "P6"],               // L4[0] → oben: alle L3
  "P8":  ["P7", "P5", "P6"],               // L4[1] → links: P7, oben: P5, P6
  "P9":  ["P7", "P8", "P6"],               // L4[2] → links: P7, P8, oben: P6
  "P10": ["P7", "P8", "P9"],               // L4[3] → links: P7, P8, P9
  "P11": ["P7", "P8", "P9", "P10"],        // L5[0] → oben: alle L4
  "P12": ["P11", "P8", "P9", "P10"],       // L5[1] → links: P11, oben: P8-P10 (s. Hinweis)
  "P13": ["P11", "P12", "P9", "P10"],      // L5[2] → links: P11, P12, oben: P9, P10
  "P14": ["P11", "P12", "P13", "P10"],     // L5[3] → links: P11-P13, oben: P10
  "P15": ["P11", "P12", "P13", "P14"],     // L5[4] → links: alle L5-Vorgänger
};

// Die PDF-Tabelle weicht an zwei Stellen ab (markiert mit ⚠️):
// - Platz 3: PDF sagt [1, 2], Formel sagt [2] (P1 liegt geometrisch links von P3)
// - Platz 12: PDF sagt [7..10, 11], Formel sagt [8..10, 11] (P7 liegt geometrisch links von P12)

console.log("--- Ziel-Überprüfung für alle Positionen ---\n");

for (const [player, expected] of Object.entries(expectedTargets)) {
  const got = getValidChallengeTargets(player, standardLevels);
  const match = arraysEqual(got, expected);
  assert(match, `${player}: Ziele = [${got.sort().join(", ")}]`);
  if (!match) {
    console.log(`       Erwartet: [${expected.sort().join(", ")}]`);
  }
}

// Hinweis zu den PDF-Abweichungen
console.log("\n--- Hinweis zu PDF-Abweichungen ---");
console.log("Die Zentrum-Formel weicht an 2 von 14 Positionen vom PDF ab:");

const pdfDiffTargets3 = ["P1", "P2"];
const formulaTargets3 = getValidChallengeTargets("P3", standardLevels);
warn(`Platz 3: PDF=[${pdfDiffTargets3.sort().join(",")}] vs Formel=[${formulaTargets3.sort().join(",")}] – P1 liegt geometrisch links von P3`);

const pdfDiffTargets12 = ["P7", "P8", "P9", "P10", "P11"];
const formulaTargets12 = getValidChallengeTargets("P12", standardLevels);
warn(`Platz 12: PDF=[${pdfDiffTargets12.sort().join(",")}] vs Formel=[${formulaTargets12.sort().join(",")}] – P7 liegt geometrisch links von P12`);


// ============================================================
// Test 2: Euer echtes Pyramiden-Layout (1-2-3-4-5-5)
// ============================================================

console.log("\n═══════════════════════════════════════════════════");
console.log("TEST 2: CfB-Pyramide mit 6 Ebenen (1-2-3-4-5-5)");
console.log("═══════════════════════════════════════════════════\n");

console.log("Pyramide:");
console.log("              A");
console.log("            B   C");
console.log("          D   E   F");
console.log("        G   H   I   J");
console.log("      K   L   M   N   O");
console.log("      P   Q   R   S   T\n");

const cfbLevels = [
  ["A"],
  ["B", "C"],
  ["D", "E", "F"],
  ["G", "H", "I", "J"],
  ["K", "L", "M", "N", "O"],
  ["P", "Q", "R", "S", "T"]     // gleiche Größe wie Level 5!
];

// Level 6 → Level 5 (5→5, gleiche Größe)
console.log("--- Level 6 → Level 5 (gleiche Größe 5→5) ---\n");

// Bei gleicher Ebenengröße: (2j+1)*5 >= (2i+1)*5 → j >= i
// Also: Spieler auf Ebene 6 können auf Ebene 5 alle mit Index >= eigenem Index herausfordern
const expectedL6 = {
  "P": ["K", "L", "M", "N", "O"],  // i=0: alles rechts (= alle auf L5) + keine links
  "Q": ["P", "L", "M", "N", "O"],  // i=1: links: P, oben: L-O
  "R": ["P", "Q", "M", "N", "O"],  // i=2: links: P,Q, oben: M-O
  "S": ["P", "Q", "R", "N", "O"],  // i=3: links: P,Q,R, oben: N,O
  "T": ["P", "Q", "R", "S", "O"],  // i=4: links: P-S, oben: O
};

for (const [player, expected] of Object.entries(expectedL6)) {
  const got = getValidChallengeTargets(player, cfbLevels);
  assert(arraysEqual(got, expected), `${player}: Ziele = [${got.sort().join(", ")}]`);
  if (!arraysEqual(got, expected)) {
    console.log(`       Erwartet: [${expected.sort().join(", ")}]`);
  }
}

// Level 5 → Level 4 (5→4, wie im PDF-Beispiel)
console.log("\n--- Level 5 → Level 4 (5→4) ---\n");

const expectedL5 = {
  "K": ["G", "H", "I", "J"],       // i=0: oben: alle L4
  "L": ["K", "H", "I", "J"],       // i=1: links: K, oben: H,I,J
  "M": ["K", "L", "I", "J"],       // i=2: links: K,L, oben: I,J
  "N": ["K", "L", "M", "J"],       // i=3: links: K,L,M, oben: J
  "O": ["K", "L", "M", "N"],       // i=4: links: alle, oben: niemand
};

for (const [player, expected] of Object.entries(expectedL5)) {
  const got = getValidChallengeTargets(player, cfbLevels);
  assert(arraysEqual(got, expected), `${player}: Ziele = [${got.sort().join(", ")}]`);
  if (!arraysEqual(got, expected)) {
    console.log(`       Erwartet: [${expected.sort().join(", ")}]`);
  }
}


// ============================================================
// Test 3: validateDoublesChallenge – Gültige Herausforderungen
// ============================================================

console.log("\n═══════════════════════════════════════════════════");
console.log("TEST 3: validateDoublesChallenge – gültig/ungültig");
console.log("═══════════════════════════════════════════════════\n");

console.log("--- Gültige Herausforderungen ---\n");

const validCases = [
  // Gleiche Ebene, links
  ["Q", "P", "L6 → L6 links"],
  ["T", "P", "L6 → L6 links (weit)"],
  ["O", "K", "L5 → L5 links (weit)"],
  // Eine Ebene höher, rechts
  ["P", "K", "L6[0] → L5[0] (oben rechts)"],
  ["R", "M", "L6[2] → L5[2] (oben rechts)"],
  ["M", "I", "L5[2] → L4[2] (oben rechts)"],
  ["K", "G", "L5[0] → L4[0] (oben rechts)"],
  ["G", "D", "L4[0] → L3[0] (oben rechts)"],
  ["D", "B", "L3[0] → L2[0] (oben rechts)"],
  ["B", "A", "L2[0] → L1[0] (oben rechts)"],
];

for (const [challenger, challenged, desc] of validCases) {
  const result = validateDoublesChallenge(challenger, challenged, cfbLevels);
  assert(result.valid === true, `${challenger} → ${challenged}: ${desc}`);
  if (!result.valid) {
    console.log(`       Grund: ${result.reason}`);
  }
}

console.log("\n--- Ungültige Herausforderungen ---\n");

const invalidCases = [
  // Gleiche Ebene, rechts (falsche Richtung)
  ["P", "Q", "L6[0] → L6[1] rechts = ungültig"],
  ["K", "L", "L5[0] → L5[1] rechts = ungültig"],
  // Sich selbst herausfordern
  ["P", "P", "Sich selbst = ungültig"],
  // Höhergestellter fordert heraus
  ["A", "P", "L1 → L6 = ungültig (Höherer fordert Niedrigeren)"],
  ["K", "P", "L5 → L6 = ungültig (Höherer fordert Niedrigeren)"],
  // Zwei Ebenen übersprungen
  ["P", "G", "L6 → L4 = ungültig (2 Ebenen übersprungen)"],
  ["P", "A", "L6 → L1 = ungültig (5 Ebenen übersprungen)"],
  // Obere Ebene, aber links (nicht rechts)
  ["T", "K", "L6[4] → L5[0] = ungültig (oben links, nicht rechts)"],
  ["O", "G", "L5[4] → L4[0] = ungültig (oben links)"],
];

for (const [challenger, challenged, desc] of invalidCases) {
  const result = validateDoublesChallenge(challenger, challenged, cfbLevels);
  assert(result.valid === false, `${challenger} → ${challenged}: ${desc}`);
  if (result.valid) {
    console.log(`       FEHLER: Sollte ungültig sein!`);
  }
}


// ============================================================
// Test 4: Spieler-13-Beispiel aus der Aufgabenstellung
// ============================================================

console.log("\n═══════════════════════════════════════════════════");
console.log("TEST 4: Explizites Beispiel – Spieler 13 (PDF + User)");
console.log("═══════════════════════════════════════════════════\n");

// "Spieler 13 darf bei 11 und 12 herausfordern (gleiche Ebene links)"
// "Er darf ebenfalls 9 und 10 herausfordern (Ebene darüber, rechts)"
const targets13 = getValidChallengeTargets("P13", standardLevels);
assert(targets13.includes("P11"), "P13 darf P11 herausfordern (gleiche Ebene, links)");
assert(targets13.includes("P12"), "P13 darf P12 herausfordern (gleiche Ebene, links)");
assert(targets13.includes("P9"), "P13 darf P9 herausfordern (Ebene höher, rechts)");
assert(targets13.includes("P10"), "P13 darf P10 herausfordern (Ebene höher, rechts)");
assert(!targets13.includes("P7"), "P13 darf P7 NICHT herausfordern (zu weit links oben)");
assert(!targets13.includes("P8"), "P13 darf P8 NICHT herausfordern (zu weit links oben)");
assert(!targets13.includes("P14"), "P13 darf P14 NICHT herausfordern (rechts = tiefer)");
assert(!targets13.includes("P15"), "P13 darf P15 NICHT herausfordern (rechts = tiefer)");
assert(!targets13.includes("P4"), "P13 darf P4 NICHT herausfordern (zwei Ebenen höher)");


// ============================================================
// Test 5: Randfälle
// ============================================================

console.log("\n═══════════════════════════════════════════════════");
console.log("TEST 5: Randfälle");
console.log("═══════════════════════════════════════════════════\n");

// Spieler nicht in Pyramide
const result1 = validateDoublesChallenge("UNKNOWN", "P1", cfbLevels);
assert(result1.valid === false, "Unbekannter Herausforderer → ungültig");

const result2 = validateDoublesChallenge("P", "UNKNOWN", cfbLevels);
assert(result2.valid === false, "Unbekannter Herausgeforderter → ungültig");

// Leere Pyramide
const result3 = validateDoublesChallenge("P", "A", []);
assert(result3.valid === false, "Leere Pyramide → ungültig");

// Spitze kann niemanden herausfordern
const targets1 = getValidChallengeTargets("A", cfbLevels);
assert(targets1.length === 0, "A (Spitze) hat keine Herausforderungsziele");

// Mini-Pyramide (nur 2 Ebenen)
const miniLevels = [["X"], ["Y", "Z"]];
const miniTargetsY = getValidChallengeTargets("Y", miniLevels);
assert(arraysEqual(miniTargetsY, ["X"]), "Mini: Y kann X herausfordern (oben rechts)");
const miniTargetsZ = getValidChallengeTargets("Z", miniLevels);
assert(arraysEqual(miniTargetsZ, ["Y"]), "Mini: Z kann Y herausfordern (gleiche Ebene links)");

// Einzel-Ebene (nur 1 Spieler)
const singleLevel = [["SOLO"]];
const soloTargets = getValidChallengeTargets("SOLO", singleLevel);
assert(soloTargets.length === 0, "Einzelspieler hat keine Ziele");


// ============================================================
// Test 6: Vollständige Matrix – alle gegen alle prüfen
// ============================================================

console.log("\n═══════════════════════════════════════════════════");
console.log("TEST 6: Vollständige Matrix – CfB-Pyramide (20 Spieler)");
console.log("═══════════════════════════════════════════════════\n");

const allPlayers = cfbLevels.flat();
let invalidUp = 0;
let validChallenges = 0;
let invalidDown = 0;
let invalidTooFar = 0;
let invalidSameOrRight = 0;

for (const challenger of allPlayers) {
  for (const challenged of allPlayers) {
    if (challenger === challenged) continue;
    const result = validateDoublesChallenge(challenger, challenged, cfbLevels);
    if (result.valid) {
      validChallenges++;
    } else {
      const cPos = findPlayerInPyramid(challenger, cfbLevels);
      const dPos = findPlayerInPyramid(challenged, cfbLevels);
      if (cPos.level < dPos.level || (cPos.level === dPos.level && cPos.index < dPos.index)) {
        invalidDown++;
      } else if (cPos.level - dPos.level > 1) {
        invalidTooFar++;
      } else {
        invalidSameOrRight++;
      }
    }
  }
}

console.log(`  Gesamtkombinationen (ohne Selbst): ${allPlayers.length * (allPlayers.length - 1)}`);
console.log(`  Gültige Herausforderungen:         ${validChallenges}`);
console.log(`  Ungültig (nach unten/gleich):       ${invalidDown}`);
console.log(`  Ungültig (>1 Ebene Abstand):        ${invalidTooFar}`);
console.log(`  Ungültig (gleiche/obere Ebene, falsche Richtung): ${invalidSameOrRight}`);

const totalChecked = validChallenges + invalidDown + invalidTooFar + invalidSameOrRight;
assert(totalChecked === allPlayers.length * (allPlayers.length - 1),
  `Alle ${totalChecked} Kombinationen geprüft`);

// Symmetrie-Check: Wenn A→B gültig, dann B→A ungültig
let symmetryOk = true;
for (const challenger of allPlayers) {
  for (const challenged of allPlayers) {
    if (challenger === challenged) continue;
    const r1 = validateDoublesChallenge(challenger, challenged, cfbLevels);
    const r2 = validateDoublesChallenge(challenged, challenger, cfbLevels);
    if (r1.valid && r2.valid) {
      symmetryOk = false;
      console.log(`  FEHLER: Beide gültig: ${challenger}→${challenged} und ${challenged}→${challenger}`);
    }
  }
}
assert(symmetryOk, "Symmetrie: Wenn A→B gültig, dann B→A ungültig");


// ============================================================
// Zusammenfassung
// ============================================================

console.log("\n═══════════════════════════════════════════════════");
console.log("ZUSAMMENFASSUNG");
console.log("═══════════════════════════════════════════════════\n");
console.log(`  ✅ Bestanden: ${testsPassed}`);
console.log(`  ❌ Fehlgeschlagen: ${testsFailed}`);
console.log(`  ⚠️  Hinweise (PDF-Abweichungen): ${testsWarned}`);
console.log(`  Gesamt: ${testsPassed + testsFailed}\n`);

if (testsFailed === 0) {
  console.log("  🎉 Alle Tests bestanden!\n");
} else {
  console.log(`  ⚠️  ${testsFailed} Tests fehlgeschlagen.\n`);
}

process.exit(testsFailed > 0 ? 1 : 0);