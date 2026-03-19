// js/services/export-service.js
// Excel Export Funktionen

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

// ========== Sheet Builder: Spielerstatistiken ==========

function buildPlayerStatsSheetData() {
  // --- Einzel ---
  const confirmedSingles = state.singlesMatches.filter(m => (m.status || 'confirmed') === 'confirmed');
  const singleStats = {};
  state.players.forEach(p => { singleStats[p.id] = { name: p.name, wins: 0, matches: 0 }; });

  confirmedSingles.forEach(match => {
    if (!match.sets || match.sets.length < 2) return;
    const p1 = match.player1Id, p2 = match.player2Id;
    if (!singleStats[p1] || !singleStats[p2]) return;
    let p1Sets = 0, p2Sets = 0;
    match.sets.forEach(s => { if (s.p1 > s.p2) p1Sets++; else p2Sets++; });
    singleStats[p1].matches++;
    singleStats[p2].matches++;
    if (p1Sets > p2Sets) singleStats[p1].wins++;
    else singleStats[p2].wins++;
  });

  const allSingle = Object.values(singleStats).filter(p => p.matches > 0);
  const topSingleWins = [...allSingle].sort((a, b) => b.wins - a.wins || b.matches - a.matches).slice(0, 3);
  const topSingleMatches = [...allSingle].sort((a, b) => b.matches - a.matches || b.wins - a.wins).slice(0, 3);
  const topSingleWinRate = [...allSingle]
    .map(p => ({ ...p, rate: p.wins / p.matches }))
    .sort((a, b) => b.rate - a.rate || b.matches - a.matches)
    .slice(0, 3);

  const einzel = [];
  const addSingleSection = (label, items, valueFn) => {
    einzel.push({ Kategorie: label, Platz: '', Spieler: '', Wert: '' });
    items.forEach((p, i) => einzel.push({ Kategorie: '', Platz: i + 1, Spieler: p.name, Wert: valueFn(p) }));
    einzel.push({ Kategorie: '', Platz: '', Spieler: '', Wert: '' });
  };
  addSingleSection('Meiste Siege', topSingleWins, p => `${p.wins} Siege`);
  addSingleSection('Meiste Spiele', topSingleMatches, p => `${p.matches} Spiele`);
  addSingleSection('Beste Siegquote', topSingleWinRate, p => `${Math.round(p.rate * 100)}% (${p.wins}/${p.matches})`);

  // --- Doppel ---
  const confirmedDoubles = state.doublesMatches.filter(m => (m.status || 'confirmed') === 'confirmed');
  const playerById = {};
  state.players.forEach(p => { playerById[p.id] = p; });

  const asMainPlayer = {}, asPartner = {}, totalStats = {}, partners = {}, duoStats = {};
  state.players.forEach(p => {
    asMainPlayer[p.id] = { name: p.name, wins: 0, matches: 0 };
    asPartner[p.id] = { name: p.name, wins: 0, matches: 0 };
    totalStats[p.id] = { name: p.name, matches: 0 };
    partners[p.id] = new Set();
  });

  confirmedDoubles.forEach(match => {
    if (!match.sets || match.sets.length < 2 || !match.team1 || !match.team2) return;
    let t1Sets = 0, t2Sets = 0;
    match.sets.forEach(s => { if (s.t1 > s.t2) t1Sets++; else t2Sets++; });
    const team1Won = t1Sets > t2Sets;

    [match.team1.player1Id, match.team1.player2Id, match.team2.player1Id, match.team2.player2Id].forEach(id => {
      if (totalStats[id]) totalStats[id].matches++;
    });
    if (asMainPlayer[match.team1.player1Id]) asMainPlayer[match.team1.player1Id].matches++;
    if (asPartner[match.team1.player2Id]) asPartner[match.team1.player2Id].matches++;
    if (asMainPlayer[match.team2.player1Id]) asMainPlayer[match.team2.player1Id].matches++;
    if (asPartner[match.team2.player2Id]) asPartner[match.team2.player2Id].matches++;

    const t1p1 = match.team1.player1Id, t1p2 = match.team1.player2Id;
    const t2p1 = match.team2.player1Id, t2p2 = match.team2.player2Id;
    if (partners[t1p1] && t1p2) partners[t1p1].add(t1p2);
    if (partners[t1p2] && t1p1) partners[t1p2].add(t1p1);
    if (partners[t2p1] && t2p2) partners[t2p1].add(t2p2);
    if (partners[t2p2] && t2p1) partners[t2p2].add(t2p1);

    [[t1p1, t1p2, team1Won], [t2p1, t2p2, !team1Won]].forEach(([pA, pB, won]) => {
      if (!pA || !pB) return;
      const key = [pA, pB].sort().join('|');
      if (!duoStats[key]) {
        duoStats[key] = { name: `${playerById[pA]?.name || pA} & ${playerById[pB]?.name || pB}`, wins: 0, matches: 0 };
      }
      duoStats[key].matches++;
      if (won) duoStats[key].wins++;
    });

    const winningTeam = team1Won ? match.team1 : match.team2;
    if (asMainPlayer[winningTeam.player1Id]) asMainPlayer[winningTeam.player1Id].wins++;
    if (asPartner[winningTeam.player2Id]) asPartner[winningTeam.player2Id].wins++;
  });

  const topMain = Object.values(asMainPlayer).filter(p => p.matches > 0).sort((a, b) => b.wins - a.wins || b.matches - a.matches).slice(0, 3);
  const topPartner = Object.values(asPartner).filter(p => p.matches > 0).sort((a, b) => b.wins - a.wins || b.matches - a.matches).slice(0, 3);
  const topWinRateMain = Object.values(asMainPlayer).filter(p => p.matches > 0).map(p => ({ ...p, rate: p.wins / p.matches })).sort((a, b) => b.rate - a.rate || b.matches - a.matches).slice(0, 3);
  const topWinRatePartner = Object.values(asPartner).filter(p => p.matches > 0).map(p => ({ ...p, rate: p.wins / p.matches })).sort((a, b) => b.rate - a.rate || b.matches - a.matches).slice(0, 3);
  const topTotalMatches = Object.values(totalStats).filter(p => p.matches > 0).sort((a, b) => b.matches - a.matches).slice(0, 3);
  const topDuo = Object.values(duoStats).sort((a, b) => b.wins - a.wins || b.matches - a.matches).slice(0, 3);
  const topDuoByMatches = Object.values(duoStats).sort((a, b) => b.matches - a.matches || b.wins - a.wins).slice(0, 3);
  const topVersatile = state.players
    .map(p => ({ name: p.name, partnerCount: partners[p.id]?.size || 0 }))
    .filter(p => p.partnerCount > 0)
    .sort((a, b) => b.partnerCount - a.partnerCount)
    .slice(0, 3);

  const doppel = [];
  const addDoubleSection = (label, items, valueFn) => {
    doppel.push({ Kategorie: label, Platz: '', Spieler: '', Wert: '' });
    items.forEach((p, i) => doppel.push({ Kategorie: '', Platz: i + 1, Spieler: p.name, Wert: valueFn(p) }));
    doppel.push({ Kategorie: '', Platz: '', Spieler: '', Wert: '' });
  };
  addDoubleSection('Meiste Siege als Spieler', topMain, p => `${p.wins} Siege`);
  addDoubleSection('Meiste Siege als Mitspieler', topPartner, p => `${p.wins} Siege`);
  addDoubleSection('Beste Siegquote als Spieler', topWinRateMain, p => `${Math.round(p.rate * 100)}% (${p.wins}/${p.matches})`);
  addDoubleSection('Beste Siegquote als Mitspieler', topWinRatePartner, p => `${Math.round(p.rate * 100)}% (${p.wins}/${p.matches})`);
  addDoubleSection('Meiste Doppel-Spiele gesamt', topTotalMatches, p => `${p.matches} Spiele`);
  addDoubleSection('Bestes Duo', topDuo, p => `${p.wins} Siege (${p.matches} Spiele)`);
  addDoubleSection('Häufigstes Duo', topDuoByMatches, p => `${p.matches} Spiele (${p.wins} Siege)`);
  addDoubleSection('Vielseitigster Spieler', topVersatile, p => `${p.partnerCount} verschiedene Partner`);

  return {
    'Statistiken Einzel': einzel,
    'Statistiken Doppel': doppel,
  };
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