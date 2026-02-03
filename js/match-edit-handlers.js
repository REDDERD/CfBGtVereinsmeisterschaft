// js/match-edit-handlers.js
// Event-Handler für Match-Bearbeitung und -Löschung

// ========== Singles Match Edit & Delete ==========

async function editSinglesMatch(matchId) {
  const match = state.singlesMatches.find((m) => m.id === matchId);
  if (!match) {
    Toast.error("Spiel nicht gefunden");
    return;
  }

  const player1 = state.players.find((p) => p.id === match.player1Id);
  const player2 = state.players.find((p) => p.id === match.player2Id);

  if (!player1 || !player2) {
    Toast.error("Spieler nicht gefunden");
    return;
  }

  // Vorhandene Ergebnisse
  const set1 = match.sets[0] || { p1: "", p2: "" };
  const set2 = match.sets[1] || { p1: "", p2: "" };
  const set3 = match.sets[2] || { p1: "", p2: "" };

  const modalContent = `
    <div class="space-y-4 bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
      <h3 class="text-xl font-bold text-gray-800">Spiel bearbeiten</h3>
      <p class="text-gray-600">${player1.name} vs ${player2.name}</p>
      
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Satz 1</label>
          <div class="grid grid-cols-2 gap-2">
            <input type="number" id="editSet1P1" min="0" max="21" value="${set1.p1}"
              placeholder="${player1.name}" 
              class="px-3 py-2 border rounded-lg">
            <input type="number" id="editSet1P2" min="0" max="21" value="${set1.p2}"
              placeholder="${player2.name}" 
              class="px-3 py-2 border rounded-lg">
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Satz 2</label>
          <div class="grid grid-cols-2 gap-2">
            <input type="number" id="editSet2P1" min="0" max="21" value="${set2.p1}"
              placeholder="${player1.name}" 
              class="px-3 py-2 border rounded-lg">
            <input type="number" id="editSet2P2" min="0" max="21" value="${set2.p2}"
              placeholder="${player2.name}" 
              class="px-3 py-2 border rounded-lg">
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Satz 3 (falls nötig)</label>
          <div class="grid grid-cols-2 gap-2">
            <input type="number" id="editSet3P1" min="0" max="21" value="${set3.p1 || ""}"
              placeholder="${player1.name}" 
              class="px-3 py-2 border rounded-lg">
            <input type="number" id="editSet3P2" min="0" max="21" value="${set3.p2 || ""}"
              placeholder="${player2.name}" 
              class="px-3 py-2 border rounded-lg">
          </div>
        </div>
      </div>
      
      <div class="flex justify-end space-x-3 pt-4">
        <button onclick="Modal.close()" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
          Abbrechen
        </button>
        <button onclick="saveSinglesMatchEdit('${matchId}')" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          Speichern
        </button>
      </div>
    </div>
  `;

  Modal.open(modalContent);
}

async function saveSinglesMatchEdit(matchId) {
  const set1P1 = parseInt(document.getElementById("editSet1P1").value);
  const set1P2 = parseInt(document.getElementById("editSet1P2").value);
  const set2P1 = parseInt(document.getElementById("editSet2P1").value);
  const set2P2 = parseInt(document.getElementById("editSet2P2").value);
  const set3P1 = parseInt(document.getElementById("editSet3P1").value);
  const set3P2 = parseInt(document.getElementById("editSet3P2").value);

  if (isNaN(set1P1) || isNaN(set1P2) || isNaN(set2P1) || isNaN(set2P2)) {
    Toast.error("Bitte alle Sätze 1 und 2 ausfüllen");
    return;
  }

  if (!validateSet(set1P1, set1P2) || !validateSet(set2P1, set2P2)) {
    Toast.error("Ungültige Satz-Ergebnisse in Satz 1 oder 2");
    return;
  }

  const sets = [
    { p1: set1P1, p2: set1P2 },
    { p1: set2P1, p2: set2P2 },
  ];

  const set1Winner = set1P1 > set1P2 ? "p1" : "p2";
  const set2Winner = set2P1 > set2P2 ? "p1" : "p2";

  // Check if set 3 is needed
  if (set1Winner !== set2Winner) {
    if (!isNaN(set3P1) && !isNaN(set3P2)) {
      if (!validateSet(set3P1, set3P2)) {
        Toast.error("Ungültiges Satz-Ergebnis in Satz 3");
        return;
      }
      sets.push({ p1: set3P1, p2: set3P2 });
    } else {
      Toast.warning("Dritter Satz ist erforderlich (Spielstand 1:1)");
      return;
    }
  } else if (!isNaN(set3P1) || !isNaN(set3P2)) {
    Toast.warning("Dritter Satz nicht erlaubt (Spielstand bereits 2:0)");
    return;
  }

  try {
    await db.collection("singlesMatches").doc(matchId).update({
      sets: sets,
    });

    Modal.close();
    Toast.success("Spiel erfolgreich aktualisiert!");
    render();
  } catch (error) {
    console.error("Error updating match:", error);
    Toast.error("Fehler beim Aktualisieren des Spiels");
  }
}

async function deleteSinglesMatch(matchId) {
  const confirmed = await Modal.confirm({
    title: "Spiel löschen",
    message:
      "Möchtest du dieses Spiel wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
    confirmText: "Ja, löschen",
    cancelText: "Abbrechen",
    type: "danger",
  });

  if (!confirmed) return;

  try {
    await db.collection("singlesMatches").doc(matchId).delete();
    Toast.success("Spiel erfolgreich gelöscht!");
    render();
  } catch (error) {
    console.error("Error deleting match:", error);
    Toast.error("Fehler beim Löschen des Spiels");
  }
}

// ========== Doubles Match Edit & Delete ==========

async function editDoublesMatch(matchId) {
  const match = state.doublesMatches.find((m) => m.id === matchId);
  if (!match) {
    Toast.error("Spiel nicht gefunden");
    return;
  }

  const t1p1 = state.players.find((p) => p.id === match.team1.player1Id);
  const t1p2 = state.players.find((p) => p.id === match.team1.player2Id);
  const t2p1 = state.players.find((p) => p.id === match.team2.player1Id);
  const t2p2 = state.players.find((p) => p.id === match.team2.player2Id);

  if (!t1p1 || !t1p2 || !t2p1 || !t2p2) {
    Toast.error("Spieler nicht gefunden");
    return;
  }

  // Vorhandene Ergebnisse
  const set1 = match.sets[0] || { t1: "", t2: "" };
  const set2 = match.sets[1] || { t1: "", t2: "" };
  const set3 = match.sets[2] || { t1: "", t2: "" };

  const team1Name = `${t1p1.name} / ${t1p2.name}`;
  const team2Name = `${t2p1.name} / ${t2p2.name}`;

  const modalContent = `


  
    <div class="space-y-4 bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
      <h3 class="text-xl font-bold text-gray-800">Doppel-Spiel bearbeiten</h3>
      <div class="text-sm text-gray-600">
        <div><strong>Team 1:</strong> ${team1Name}</div>
        <div><strong>Team 2:</strong> ${team2Name}</div>
      </div>
      
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Satz 1</label>
          <div class="grid grid-cols-2 gap-2">
            <input type="number" id="editDoublesSet1T1" min="0" max="21" value="${set1.t1}"
              placeholder="Team 1" 
              class="px-3 py-2 border rounded-lg">
            <input type="number" id="editDoublesSet1T2" min="0" max="21" value="${set1.t2}"
              placeholder="Team 2" 
              class="px-3 py-2 border rounded-lg">
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Satz 2</label>
          <div class="grid grid-cols-2 gap-2">
            <input type="number" id="editDoublesSet2T1" min="0" max="21" value="${set2.t1}"
              placeholder="Team 1" 
              class="px-3 py-2 border rounded-lg">
            <input type="number" id="editDoublesSet2T2" min="0" max="21" value="${set2.t2}"
              placeholder="Team 2" 
              class="px-3 py-2 border rounded-lg">
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Satz 3 (falls nötig)</label>
          <div class="grid grid-cols-2 gap-2">
            <input type="number" id="editDoublesSet3T1" min="0" max="21" value="${set3.t1 || ""}"
              placeholder="Team 1" 
              class="px-3 py-2 border rounded-lg">
            <input type="number" id="editDoublesSet3T2" min="0" max="21" value="${set3.t2 || ""}"
              placeholder="Team 2" 
              class="px-3 py-2 border rounded-lg">
          </div>
        </div>
      </div>
      
      <div class="flex justify-end space-x-3 pt-4">
        <button onclick="Modal.close()" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
          Abbrechen
        </button>
        <button onclick="saveDoublesMatchEdit('${matchId}')" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          Speichern
        </button>
      </div>
    </div>
  `;

  Modal.open(modalContent);
}

async function saveDoublesMatchEdit(matchId) {
  const match = state.doublesMatches.find((m) => m.id === matchId);
  if (!match) {
    Toast.error("Spiel nicht gefunden");
    return;
  }

  const set1T1 = parseInt(document.getElementById("editDoublesSet1T1").value);
  const set1T2 = parseInt(document.getElementById("editDoublesSet1T2").value);
  const set2T1 = parseInt(document.getElementById("editDoublesSet2T1").value);
  const set2T2 = parseInt(document.getElementById("editDoublesSet2T2").value);
  const set3T1 = parseInt(document.getElementById("editDoublesSet3T1").value);
  const set3T2 = parseInt(document.getElementById("editDoublesSet3T2").value);

  if (isNaN(set1T1) || isNaN(set1T2) || isNaN(set2T1) || isNaN(set2T2)) {
    Toast.error("Bitte alle Sätze 1 und 2 ausfüllen");
    return;
  }

  if (!validateSet(set1T1, set1T2) || !validateSet(set2T1, set2T2)) {
    Toast.error("Ungültige Satz-Ergebnisse in Satz 1 oder 2");
    return;
  }

  const sets = [
    { t1: set1T1, t2: set1T2 },
    { t1: set2T1, t2: set2T2 },
  ];

  const set1Winner = set1T1 > set1T2 ? "t1" : "t2";
  const set2Winner = set2T1 > set2T2 ? "t1" : "t2";

  // Check if set 3 is needed
  if (set1Winner !== set2Winner) {
    if (!isNaN(set3T1) && !isNaN(set3T2)) {
      if (!validateSet(set3T1, set3T2)) {
        Toast.error("Ungültiges Satz-Ergebnis in Satz 3");
        return;
      }
      sets.push({ t1: set3T1, t2: set3T2 });
    } else {
      Toast.warning("Dritter Satz ist erforderlich (Spielstand 1:1)");
      return;
    }
  } else if (!isNaN(set3T1) || !isNaN(set3T2)) {
    Toast.warning("Dritter Satz nicht erlaubt (Spielstand bereits 2:0)");
    return;
  }

  // Prüfe ob sich der Gewinner geändert hat
  let oldT1Sets = 0,
    oldT2Sets = 0;
  if (match.sets) {
    match.sets.forEach((set) => {
      if (set.t1 > set.t2) oldT1Sets++;
      else oldT2Sets++;
    });
  }

  let newT1Sets = 0,
    newT2Sets = 0;
  sets.forEach((set) => {
    if (set.t1 > set.t2) newT1Sets++;
    else newT2Sets++;
  });

  const oldWinner = oldT1Sets > oldT2Sets ? "t1" : "t2";
  const newWinner = newT1Sets > newT2Sets ? "t1" : "t2";

  // Warnung bei Gewinnerwechsel
  if (oldWinner !== newWinner) {
    const confirmed = await Modal.warn({
      title: "Warnung: Gewinner hat sich geändert",
      message:
        "Der Gewinner dieses Spiels hat sich geändert. Bitte beachte, dass die Rangfolge in der Pyramide NICHT automatisch nachträglich geändert wird. Dies muss manuell durch einen Admin in der Pyramide vorgenommen werden.",
      confirmText: "Verstanden, trotzdem speichern",
      cancelText: "Abbrechen",
    });

    if (!confirmed) {
      return;
    }
  }

  try {
    await db.collection("doublesMatches").doc(matchId).update({
      sets: sets,
    });

    Modal.close();
    Toast.success("Doppel-Spiel erfolgreich aktualisiert!");
    render();
  } catch (error) {
    console.error("Error updating doubles match:", error);
    Toast.error("Fehler beim Aktualisieren des Spiels");
  }
}

async function deleteDoublesMatch(matchId) {
  const confirmed = await Modal.confirm({
    title: "Doppel-Spiel löschen",
    message:
      "Möchtest du dieses Doppel-Spiel wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden. WICHTIG: Die Pyramide wird NICHT automatisch angepasst!",
    confirmText: "Ja, löschen",
    cancelText: "Abbrechen",
    type: "danger",
  });

  if (!confirmed) return;

  try {
    await db.collection("doublesMatches").doc(matchId).delete();
    Toast.success("Doppel-Spiel erfolgreich gelöscht!");
    render();
  } catch (error) {
    console.error("Error deleting doubles match:", error);
    Toast.error("Fehler beim Löschen des Spiels");
  }
}
