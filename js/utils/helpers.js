// js/utils/helpers.js
// Allgemeine Hilfsfunktionen

function getPlayerName(playerId) {
  const player = state.players.find((p) => p.id === playerId);
  return player ? player.name : "Gelöschter Spieler";
}

function getGroupPlayers(groupNum) {
  return state.players.filter((p) => p.singlesGroup === groupNum);
}

function updateSinglesPlayerSelection(field, value) {
  // Initialize matchEntry if needed
  if (!state.matchEntry) {
    state.matchEntry = {
      set1P1: "",
      set1P2: "",
      set2P1: "",
      set2P2: "",
      set3P1: "",
      set3P2: "",
      set3Disabled: true, // Start disabled
    };
  }
  
  // Store the selected player
  state.matchEntry[field] = value;
  
  // Re-render to update the available options in the other dropdown
  render();
}

function updateMatchEntry(field, value) {
  // Initialize matchEntry if needed
  if (!state.matchEntry) {
    state.matchEntry = {
      set1P1: "",
      set1P2: "",
      set2P1: "",
      set2P2: "",
      set3P1: "",
      set3P2: "",
      set3Disabled: true,
      doublesSet1T1: "",
      doublesSet1T2: "",
      doublesSet2T1: "",
      doublesSet2T2: "",
      doublesSet3T1: "",
      doublesSet3T2: "",
    };
  }

  state.matchEntry[field] = value;

  // Detect if we're on Singles or Doubles page based on field names
  const isDoubles = field.startsWith("doubles");
  
  let set1Input1, set1Input2, set2Input1, set2Input2, set3Input1, set3Input2;
  let set1Field1, set1Field2, set2Field1, set2Field2;

  if (isDoubles) {
    // Doubles field names
    set1Field1 = "doublesSet1T1";
    set1Field2 = "doublesSet1T2";
    set2Field1 = "doublesSet2T1";
    set2Field2 = "doublesSet2T2";
    
    set1Input1 = document.getElementById("doublesSet1T1");
    set1Input2 = document.getElementById("doublesSet1T2");
    set2Input1 = document.getElementById("doublesSet2T1");
    set2Input2 = document.getElementById("doublesSet2T2");
    set3Input1 = document.getElementById("doublesSet3T1");
    set3Input2 = document.getElementById("doublesSet3T2");
  } else {
    // Singles field names
    set1Field1 = "set1P1";
    set1Field2 = "set1P2";
    set2Field1 = "set2P1";
    set2Field2 = "set2P2";
    
    set1Input1 = document.getElementById("set1P1");
    set1Input2 = document.getElementById("set1P2");
    set2Input1 = document.getElementById("set2P1");
    set2Input2 = document.getElementById("set2P2");
    set3Input1 = document.getElementById("set3P1");
    set3Input2 = document.getElementById("set3P2");
  }

  // Check if third set should be enabled/disabled
  const s1v1 = parseInt(state.matchEntry[set1Field1]);
  const s1v2 = parseInt(state.matchEntry[set1Field2]);
  const s2v1 = parseInt(state.matchEntry[set2Field1]);
  const s2v2 = parseInt(state.matchEntry[set2Field2]);

  if (!isNaN(s1v1) && !isNaN(s1v2) && !isNaN(s2v1) && !isNaN(s2v2)) {
    const set1Winner = s1v1 > s1v2 ? 1 : 2;
    const set2Winner = s2v1 > s2v2 ? 1 : 2;

    // Enable set 3 if different winners (1:1), disable if same winner (2:0)
    if (set1Winner !== set2Winner) {
      state.matchEntry.set3Disabled = false;
    } else {
      state.matchEntry.set3Disabled = true;
    }
  } else {
    // Not all fields filled - keep disabled
    state.matchEntry.set3Disabled = true;
  }

  // Update the disabled state of the inputs
  if (set3Input1 && set3Input2) {
    if (state.matchEntry.set3Disabled) {
      set3Input1.disabled = true;
      set3Input2.disabled = true;
      set3Input1.value = "";
      set3Input2.value = "";
      set3Input1.classList.add("bg-gray-200");
      set3Input2.classList.add("bg-gray-200");
    } else {
      set3Input1.disabled = false;
      set3Input2.disabled = false;
      set3Input1.classList.remove("bg-gray-200");
      set3Input2.classList.remove("bg-gray-200");
    }
  }
}

function updateKnockoutMatchEntry(field, value) {
  // Initialize knockoutEntry state if it doesn't exist
  if (!state.knockoutEntry) {
    state.knockoutEntry = {};
  }
  
  state.knockoutEntry[field] = value;

  // Check if third set should be disabled
  const s1p1 = parseInt(state.knockoutEntry.koSet1P1);
  const s1p2 = parseInt(state.knockoutEntry.koSet1P2);
  const s2p1 = parseInt(state.knockoutEntry.koSet2P1);
  const s2p2 = parseInt(state.knockoutEntry.koSet2P2);

  if (!isNaN(s1p1) && !isNaN(s1p2) && !isNaN(s2p1) && !isNaN(s2p2)) {
    const set1Winner = s1p1 > s1p2 ? "p1" : "p2";
    const set2Winner = s2p1 > s2p2 ? "p1" : "p2";

    // Disable set 3 if someone won 2:0
    if (set1Winner === set2Winner) {
      state.knockoutEntry.set3Disabled = true;
    } else {
      state.knockoutEntry.set3Disabled = false;
    }
  }

  // Don't render, just update the disabled state
  const set3P1Input = document.getElementById("koSet3P1");
  const set3P2Input = document.getElementById("koSet3P2");
  if (set3P1Input && set3P2Input) {
    if (state.knockoutEntry.set3Disabled) {
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

function resetMatchEntry() {
  state.matchEntry = {
    singlesP1: "",
    singlesP2: "",
    set1P1: "",
    set1P2: "",
    set2P1: "",
    set2P2: "",
    set3P1: "",
    set3P2: "",
    set3Disabled: true, // Start disabled
    doublesSet1T1: "",
    doublesSet1T2: "",
    doublesSet2T1: "",
    doublesSet2T2: "",
    doublesSet3T1: "",
    doublesSet3T2: "",
  };
}