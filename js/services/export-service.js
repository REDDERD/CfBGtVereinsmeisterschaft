// js/services/export-service.js
// Excel Export Funktionen
// Modulare Builder: Jeder Builder gibt { headers, rows } zurück
// für zukünftigen Export-Tab mit Checkboxen

// ========== Sheet Builder: Einzel Gruppenphase ==========

function buildSinglesGroupSheetData() {
  const group1 = calculateStandings(1);
  const group2 = calculateStandings(2);

  const mapStandings = (standings) => standings.map((player, idx) => ({
    Platz: idx + 1,
    Spieler: player.name,
    Spiele: player.matches,
    Punkte: player.points,
    Sätze: `${player.setsWon}:${player.setsLost}`,
  }));

  return {
    'Gruppe 1': mapStandings(group1),
    'Gruppe 2': mapStandings(group2),
  };
}

// ========== Sheet Builder: Einzel K.O.-Phase ==========

function buildKnockoutSheetData() {
  const knockoutMatches = state.knockoutMatches.map(match => {
    const p1Name = getPlayerName(match.player1Id);
    const p2Name = getPlayerName(match.player2Id);
    const scoreText = match.sets ? match.sets.map(s => `${s.p1}:${s.p2}`).join(', ') : 'Ausstehend';
    let p1Sets = 0, p2Sets = 0;
    if (match.sets) {
      match.sets.forEach(set => {
        if (set.p1 > set.p2) p1Sets++;
        else p2Sets++;
      });
    }
    const dateStr = match.date ? new Date(match.date.seconds * 1000).toLocaleDateString('de-DE') : '';
    
    const roundNames = {
      'final': 'Finale',
      'semifinal': 'Halbfinale',
      'semi': 'Halbfinale',
      'quarterfinal': 'Viertelfinale',
      'quarter': 'Viertelfinale',
      'round16': 'Achtelfinale',
      'thirdPlace': 'Platz 3'
    };

    return {
      Runde: roundNames[match.round] || match.round || '',
      'Spieler 1': p1Name,
      'Spieler 2': p2Name,
      'Sätze Spieler 1': p1Sets,
      'Sätze Spieler 2': p2Sets,
      Ergebnis: scoreText,
      Datum: dateStr,
    };
  });

  return { 'KO-Phase': knockoutMatches };
}

// ========== Sheet Builder: Doppel-Pyramide ==========

function buildDoublesPyramidSheetData() {
  const levels = state.pyramid.levels || [];
  const flatPositions = flattenPyramidLevels(levels);

  const data = flatPositions.map((playerId, idx) => ({
    Rang: idx + 1,
    Spieler: getPlayerName(playerId),
  }));

  return { 'Doppel-Pyramide': data };
}

// ========== Sheet Builder: Einzel-Spiele (inkl. KO) ==========

function buildSinglesMatchesSheetData() {
  const matches = state.singlesMatches.map(match => {
    const p1Name = getPlayerName(match.player1Id);
    const p2Name = getPlayerName(match.player2Id);
    const scoreText = match.sets ? match.sets.map(s => `${s.p1}:${s.p2}`).join(', ') : 'Ausstehend';
    let p1Sets = 0, p2Sets = 0;
    if (match.sets) {
      match.sets.forEach(set => {
        if (set.p1 > set.p2) p1Sets++;
        else p2Sets++;
      });
    }
    const dateStr = match.date ? new Date(match.date.seconds * 1000).toLocaleDateString('de-DE') : '';
    
    const isKnockout = match.round && match.round !== 'group1' && match.round !== 'group2';
    const roundNames = {
      'final': 'Finale', 'semi': 'Halbfinale', 'quarter': 'Viertelfinale',
      'round16': 'Achtelfinale', 'thirdPlace': 'Platz 3',
      'group1': 'Gruppe 1', 'group2': 'Gruppe 2'
    };

    return {
      Typ: isKnockout ? 'KO' : 'Gruppe',
      Runde: roundNames[match.round] || match.round || '',
      'Spieler 1': p1Name,
      'Spieler 2': p2Name,
      'Sätze Spieler 1': p1Sets,
      'Sätze Spieler 2': p2Sets,
      Ergebnis: scoreText,
      Datum: dateStr,
    };
  });

  return { 'Einzel-Spiele': matches };
}

// ========== Sheet Builder: Doppel-Spiele ==========

function buildDoublesMatchesSheetData() {
  const matches = state.doublesMatches.map(match => {
    const t1 = `${getPlayerName(match.team1.player1Id)} / ${getPlayerName(match.team1.player2Id)}`;
    const t2 = `${getPlayerName(match.team2.player1Id)} / ${getPlayerName(match.team2.player2Id)}`;
    const scoreText = match.sets ? match.sets.map(s => `${s.t1}:${s.t2}`).join(', ') : 'Ausstehend';
    let t1Sets = 0, t2Sets = 0;
    if (match.sets) {
      match.sets.forEach(set => {
        if (set.t1 > set.t2) t1Sets++;
        else t2Sets++;
      });
    }
    const dateStr = match.date ? new Date(match.date.seconds * 1000).toLocaleDateString('de-DE') : '';

    return {
      'Team 1': t1,
      'Team 2': t2,
      'Sätze Team 1': t1Sets,
      'Sätze Team 2': t2Sets,
      Ergebnis: scoreText,
      Datum: dateStr,
    };
  });

  return { 'Doppel-Spiele': matches };
}

// ========== Sheet Builder: Einstellungen ==========

function buildSettingsSheetData() {
  const settings = state.matchStatusSettings || {};
  const data = [
    { Einstellung: 'Einzel Admin-Standard', Wert: settings.singlesAdminDefault || 'confirmed' },
    { Einstellung: 'Einzel User-Standard', Wert: settings.singlesUserDefault || 'unconfirmed' },
    { Einstellung: 'Doppel Admin-Standard', Wert: settings.doublesAdminDefault || 'confirmed' },
    { Einstellung: 'Doppel User-Standard', Wert: settings.doublesUserDefault || 'unconfirmed' },
    { Einstellung: 'K.O.-Phase aktiv', Wert: state.knockoutPhaseActive ? 'Ja' : 'Nein' },
    { Einstellung: 'Anzahl Spieler', Wert: state.players.length },
  ];

  return { 'Einstellungen': data };
}

// ========== Hilfsfunktion: Sheet aus Daten hinzufügen ==========

function addSheetFromData(workbook, data, sheetName) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
}

// ========== Export-Funktionen (bestehende API beibehalten) ==========

function exportSinglesTables() {
  const sheetsData = buildSinglesGroupSheetData();
  
  const wb = XLSX.utils.book_new();
  Object.entries(sheetsData).forEach(([name, data]) => {
    addSheetFromData(wb, data, name);
  });
  XLSX.writeFile(wb, "einzel-tabellen.xlsx");
}

function exportSinglesMatches() {
  const searchQuery = state.singlesSearchQuery || "";

  const filteredMatches = state.singlesMatches.filter((match) => {
    if (!searchQuery) return true;
    const p1Name = getPlayerName(match.player1Id).toLowerCase();
    const p2Name = getPlayerName(match.player2Id).toLowerCase();
    const query = searchQuery.toLowerCase();
    return p1Name.includes(query) || p2Name.includes(query);
  });

  if (filteredMatches.length === 0) {
    alert("Keine Spiele zum Exportieren gefunden");
    return;
  }

  const data = filteredMatches.map((match) => {
    const p1Name = getPlayerName(match.player1Id);
    const p2Name = getPlayerName(match.player2Id);

    let p1Sets = 0, p2Sets = 0;
    if (match.sets) {
      match.sets.forEach((set) => {
        if (set.p1 > set.p2) p1Sets++;
        else p2Sets++;
      });
    }

    const dateStr = match.date
      ? new Date(match.date.toDate()).toLocaleDateString("de-DE")
      : "";
    const sets = match.sets
      ? match.sets.map((s) => `${s.p1}:${s.p2}`).join(", ")
      : "";

    return {
      Datum: dateStr,
      "Spieler 1": p1Name,
      "Spieler 2": p2Name,
      Ergebnis: `${p1Sets}:${p2Sets}`,
      Sätze: sets,
    };
  });

  const wb = XLSX.utils.book_new();
  addSheetFromData(wb, data, "Einzel-Ergebnisse");
  XLSX.writeFile(wb, "einzel-ergebnisse.xlsx");
}

function exportDoublesMatches() {
  const searchQuery = state.doublesSearchQuery || "";

  const filteredMatches = state.doublesMatches.filter((match) => {
    if (!searchQuery) return true;
    const t1p1Name = getPlayerName(match.team1.player1Id).toLowerCase();
    const t1p2Name = getPlayerName(match.team1.player2Id).toLowerCase();
    const t2p1Name = getPlayerName(match.team2.player1Id).toLowerCase();
    const t2p2Name = getPlayerName(match.team2.player2Id).toLowerCase();
    const query = searchQuery.toLowerCase();
    return (
      t1p1Name.includes(query) ||
      t1p2Name.includes(query) ||
      t2p1Name.includes(query) ||
      t2p2Name.includes(query)
    );
  });

  if (filteredMatches.length === 0) {
    alert("Keine Spiele zum Exportieren gefunden");
    return;
  }

  const data = filteredMatches.map((match) => {
    const t1p1Name = getPlayerName(match.team1.player1Id);
    const t1p2Name = getPlayerName(match.team1.player2Id);
    const t2p1Name = getPlayerName(match.team2.player1Id);
    const t2p2Name = getPlayerName(match.team2.player2Id);

    let t1Sets = 0, t2Sets = 0;
    if (match.sets) {
      match.sets.forEach((set) => {
        if (set.t1 > set.t2) t1Sets++;
        else t2Sets++;
      });
    }

    const dateStr = match.date
      ? new Date(match.date.toDate()).toLocaleDateString("de-DE")
      : "";
    const sets = match.sets
      ? match.sets.map((s) => `${s.t1}:${s.t2}`).join(", ")
      : "";

    return {
      Datum: dateStr,
      "Team 1 Spieler 1": t1p1Name,
      "Team 1 Spieler 2": t1p2Name,
      "Team 2 Spieler 1": t2p1Name,
      "Team 2 Spieler 2": t2p2Name,
      Ergebnis: `${t1Sets}:${t2Sets}`,
      Sätze: sets,
    };
  });

  const wb = XLSX.utils.book_new();
  addSheetFromData(wb, data, "Doppel-Ergebnisse");
  XLSX.writeFile(wb, "doppel-ergebnisse.xlsx");
}

async function exportAllMatches() {
  try {
    const workbook = XLSX.utils.book_new();
    
    // Einzel-Spiele (inkl. KO)
    const singlesData = buildSinglesMatchesSheetData();
    Object.entries(singlesData).forEach(([name, data]) => {
      addSheetFromData(workbook, data, name);
    });
    
    // Doppel-Spiele
    const doublesData = buildDoublesMatchesSheetData();
    Object.entries(doublesData).forEach(([name, data]) => {
      addSheetFromData(workbook, data, name);
    });
    
    XLSX.writeFile(workbook, `Vereinsmeisterschaft_Alle_Spiele_${new Date().toISOString().split('T')[0]}.xlsx`);
    Toast.success("Export erfolgreich!");
  } catch (error) {
    console.error("Export error:", error);
    Toast.error("Fehler beim Export");
  }
}
