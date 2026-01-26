// js/services/export-service.js
// Excel Export Funktionen

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

    let p1Sets = 0,
      p2Sets = 0;
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

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Einzel-Ergebnisse");
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

    let t1Sets = 0,
      t2Sets = 0;
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

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Doppel-Ergebnisse");
  XLSX.writeFile(wb, "doppel-ergebnisse.xlsx");
}

function exportSinglesTables() {
  const group1 = calculateStandings(1);
  const group2 = calculateStandings(2);

  const data1 = group1.map((player, idx) => ({
    Platz: idx + 1,
    Spieler: player.name,
    Spiele: player.matches,
    Punkte: player.points,
    Sätze: `${player.setsWon}:${player.setsLost}`,
  }));

  const data2 = group2.map((player, idx) => ({
    Platz: idx + 1,
    Spieler: player.name,
    Spiele: player.matches,
    Punkte: player.points,
    Sätze: `${player.setsWon}:${player.setsLost}`,
  }));

  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.json_to_sheet(data1);
  const ws2 = XLSX.utils.json_to_sheet(data2);
  XLSX.utils.book_append_sheet(wb, ws1, "Gruppe 1");
  XLSX.utils.book_append_sheet(wb, ws2, "Gruppe 2");
  XLSX.writeFile(wb, "einzel-tabellen.xlsx");
}