// js/events/challenge-match-entry.js
// Einzel-Herausforderungs-Spieleintrag (Modal)

function openSinglesMatchEntryForChallenge(player1Id, player2Id) {
  const player1 = state.players.find(p => p.id === player1Id);
  const player2 = state.players.find(p => p.id === player2Id);
  
  if (!player1 || !player2) {
    Toast.error("Spieler nicht gefunden");
    return;
  }

  const modalContent = `
    <div class="space-y-4 p-6">
      <h3 class="text-xl font-bold text-gray-800">${player1.name} vs ${player2.name}</h3>
      
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Satz 1</label>
          <div class="grid grid-cols-2 gap-2">
            <input type="number" id="challengeSet1P1" min="0" max="21" 
              placeholder="${player1.name}" 
              onchange="updateChallengeMatchEntry('set1P1', this.value)"
              class="px-3 py-2 border rounded-lg">
            <input type="number" id="challengeSet1P2" min="0" max="21" 
              placeholder="${player2.name}" 
              onchange="updateChallengeMatchEntry('set1P2', this.value)"
              class="px-3 py-2 border rounded-lg">
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Satz 2</label>
          <div class="grid grid-cols-2 gap-2">
            <input type="number" id="challengeSet2P1" min="0" max="21" 
              placeholder="${player1.name}" 
              onchange="updateChallengeMatchEntry('set2P1', this.value)"
              class="px-3 py-2 border rounded-lg">
            <input type="number" id="challengeSet2P2" min="0" max="21" 
              placeholder="${player2.name}" 
              onchange="updateChallengeMatchEntry('set2P2', this.value)"
              class="px-3 py-2 border rounded-lg">
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Satz 3 (falls nötig)</label>
          <div class="grid grid-cols-2 gap-2">
            <input type="number" id="challengeSet3P1" min="0" max="21" 
              placeholder="${player1.name}" 
              onchange="updateChallengeMatchEntry('set3P1', this.value)"
              class="px-3 py-2 border rounded-lg">
            <input type="number" id="challengeSet3P2" min="0" max="21" 
              placeholder="${player2.name}" 
              onchange="updateChallengeMatchEntry('set3P2', this.value)"
              class="px-3 py-2 border rounded-lg">
          </div>
        </div>
      </div>
      
      <div class="flex justify-end space-x-3 pt-4">
        <button onclick="Modal.close()" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
          Abbrechen
        </button>
        <button onclick="submitChallengeMatch('${player1Id}', '${player2Id}')" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          Spiel eintragen
        </button>
      </div>
    </div>
  `;
  
  Modal.open(modalContent);
  
  // Initialize challenge match entry state
  state.challengeMatchEntry = {
    set1P1: "",
    set1P2: "",
    set2P1: "",
    set2P2: "",
    set3P1: "",
    set3P2: "",
    set3Disabled: false
  };
}

function updateChallengeMatchEntry(field, value) {
  if (!state.challengeMatchEntry) {
    state.challengeMatchEntry = {
      set1P1: "",
      set1P2: "",
      set2P1: "",
      set2P2: "",
      set3P1: "",
      set3P2: "",
      set3Disabled: false
    };
  }
  
  state.challengeMatchEntry[field] = value;

  const s1p1 = parseInt(state.challengeMatchEntry.set1P1);
  const s1p2 = parseInt(state.challengeMatchEntry.set1P2);
  const s2p1 = parseInt(state.challengeMatchEntry.set2P1);
  const s2p2 = parseInt(state.challengeMatchEntry.set2P2);

  if (!isNaN(s1p1) && !isNaN(s1p2) && !isNaN(s2p1) && !isNaN(s2p2)) {
    const set1Winner = s1p1 > s1p2 ? "p1" : "p2";
    const set2Winner = s2p1 > s2p2 ? "p1" : "p2";
    state.challengeMatchEntry.set3Disabled = (set1Winner === set2Winner);
  }

  const set3P1Input = document.getElementById("challengeSet3P1");
  const set3P2Input = document.getElementById("challengeSet3P2");
  if (set3P1Input && set3P2Input) {
    if (state.challengeMatchEntry.set3Disabled) {
      set3P1Input.disabled = true;
      set3P2Input.disabled = true;
      set3P1Input.value = "";
      set3P2Input.value = "";
      set3P1Input.classList.add("bg-gray-200");
      set3P2Input.classList.add("bg-gray-200");
    } else {
      set3P1Input.disabled = false;
      set3P2Input.disabled = false;
      set3P1Input.classList.remove("bg-gray-200");
      set3P2Input.classList.remove("bg-gray-200");
    }
  }
}

async function submitChallengeMatch(player1Id, player2Id) {
  const entry = state.challengeMatchEntry;
  
  const set1P1 = parseInt(entry.set1P1);
  const set1P2 = parseInt(entry.set1P2);
  const set2P1 = parseInt(entry.set2P1);
  const set2P2 = parseInt(entry.set2P2);
  const set3P1 = parseInt(entry.set3P1);
  const set3P2 = parseInt(entry.set3P2);

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
    await db.collection("singlesMatches").add({
      player1Id: player1Id,
      player2Id: player2Id,
      sets,
      date: firebase.firestore.FieldValue.serverTimestamp(),
    });

    state.challengeMatchEntry = null;
    
    Modal.close();
    Toast.success("Spiel erfolgreich eingetragen!");
    render();
  } catch (error) {
    console.error("Error submitting challenge match:", error);
    Toast.error("Fehler beim Eintragen des Spiels");
  }
}
