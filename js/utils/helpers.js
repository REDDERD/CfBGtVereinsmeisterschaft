// js/utils/helpers.js
// Allgemeine Hilfsfunktionen

function getPlayerName(playerId) {
  const player = state.players.find((p) => p.id === playerId);
  return player ? player.name : "Unbekannt";
}

function getGroupPlayers(groupNum) {
  return state.players.filter((p) => p.singlesGroup === groupNum);
}

function updateMatchEntry(field, value) {
  state.matchEntry[field] = value;

  // Check if third set should be disabled
  const s1p1 = parseInt(state.matchEntry.set1P1);
  const s1p2 = parseInt(state.matchEntry.set1P2);
  const s2p1 = parseInt(state.matchEntry.set2P1);
  const s2p2 = parseInt(state.matchEntry.set2P2);

  if (!isNaN(s1p1) && !isNaN(s1p2) && !isNaN(s2p1) && !isNaN(s2p2)) {
    const set1Winner = s1p1 > s1p2 ? "p1" : "p2";
    const set2Winner = s2p1 > s2p2 ? "p1" : "p2";

    // Disable set 3 if someone won 2:0
    if (set1Winner === set2Winner) {
      state.matchEntry.set3Disabled = true;
    } else {
      state.matchEntry.set3Disabled = false;
    }
  }

  // Don't render, just update the disabled state
  const set3P1Input = document.getElementById("set3P1");
  const set3P2Input = document.getElementById("set3P2");
  if (set3P1Input && set3P2Input) {
    if (state.matchEntry.set3Disabled) {
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
    set1P1: "",
    set1P2: "",
    set2P1: "",
    set2P2: "",
    set3P1: "",
    set3P2: "",
    set3Disabled: false,
  };
}