// js/services/doubles-knockout-service.js
// Doppel-K.O.-Phase Verwaltung (Aktivierung, Spiele, Auslosung)
// Analog zu knockout-service.js (Einzel), nur mit Teams statt Einzelspielern.
//
// Die Top 8 der Pyramide spielen nach fester Setzliste:
//   VF A: 1 vs 8, VF B: 2 vs 7, VF C: 3 vs 6, VF D: 4 vs 5
//   HF 1: Gew. A vs Gew. D, HF 2: Gew. B vs Gew. C → Finale
//
// Zu jedem gesetzten Spieler wird je Spiel ein Partner zugelost, weiter kommt
// nur der gesetzte Spieler (Spieler 1). Regeln (beide im Admin abschaltbar):
//   - Pool-Regel: Partner muss aus dem anderen Pool kommen (A + B)
//   - Spieler der K.O.-Phase sind erst nach ihrem Ausscheiden auslosbar

const DOUBLES_KNOCKOUT_ROUND_NAMES = {
  quarter: "Viertelfinale",
  semi: "Halbfinale",
  final: "Finale",
};

// Setzliste: Viertelfinale → Pyramiden-Plätze
const DOUBLES_KNOCKOUT_QUARTER_SEEDS = {
  1: [1, 8],
  2: [2, 7],
  3: [3, 6],
  4: [4, 5],
};

const DOUBLES_KNOCKOUT_QUARTER_LETTERS = { 1: "A", 2: "B", 3: "C", 4: "D" };

// Halbfinale → Viertelfinals, deren Gewinner aufeinandertreffen
const DOUBLES_KNOCKOUT_SEMI_QUARTERS = {
  1: [1, 4],
  2: [2, 3],
};

// ========== View-Steuerung ==========

function setDoublesView(view) {
  state.doublesView = view;
  render();
}

function showFrozenPyramidPhase() {
  state.doublesView = "pyramid";
  render();
}

// ========== Rangfolge & Konfiguration ==========

/**
 * Rangfolge, aus der die Setzliste aufgelöst wird.
 * Nach Start der K.O.-Phase die eingefrorene, davor die aktuelle Pyramide.
 */
function getDoublesRankingList() {
  if (state.doublesKnockoutPhaseActive && state.frozenPyramid) {
    return state.frozenPyramid;
  }
  return flattenPyramidLevels(state.pyramid.levels || []);
}

function getDoublesSeedPlayerId(place) {
  return getDoublesRankingList()[place - 1] || null;
}

/**
 * Kurzbezeichnung eines Spiels, z. B. "Viertelfinale A", "HF 2", "Finale".
 */
function getDoublesKnockoutMatchLabel(round, matchNum) {
  if (round === "quarter") return `Viertelfinale ${DOUBLES_KNOCKOUT_QUARTER_LETTERS[matchNum]}`;
  if (round === "semi") return `Halbfinale ${matchNum}`;
  return DOUBLES_KNOCKOUT_ROUND_NAMES[round] || round;
}

/**
 * Auslosungsregeln. Standard: beide aktiv.
 */
function getDoublesKnockoutDrawRules() {
  const config = state.doublesKnockoutConfig || {};
  return {
    poolRule: config.drawPoolRule !== false,
    blockActivePlayers: config.drawBlockActivePlayers !== false,
  };
}

function getDoublesKnockoutDrawnPartner(round, matchNum, slot) {
  return state.doublesKnockoutConfig?.draws?.[`${round}_${matchNum}`]?.[slot] || null;
}

/**
 * Team aus gesetztem Spieler und dem für dieses Spiel ausgelosten Partner.
 */
function _buildDoublesKnockoutTeam(player1Id, round, matchNum, slot) {
  if (!player1Id) return null;
  return {
    player1Id,
    player2Id: getDoublesKnockoutDrawnPartner(round, matchNum, slot),
  };
}

// ========== Spiele & Bracket-Logik ==========

function getDoublesKnockoutMatch(round, matchNum) {
  return state.doublesKnockoutMatches.find(
    (m) => m.round === round && m.matchNum === matchNum,
  );
}

function getDoublesKnockoutSetsWon(match) {
  let t1 = 0,
    t2 = 0;
  (match.sets || []).forEach((set) => {
    if (set.t1 > set.t2) t1++;
    else t2++;
  });
  return { t1, t2 };
}

function getDoublesKnockoutWinnerTeam(round, matchNum) {
  const match = getDoublesKnockoutMatch(round, matchNum);
  if (!match || !match.sets) return null;
  const { t1, t2 } = getDoublesKnockoutSetsWon(match);
  return t1 > t2 ? match.team1 : match.team2;
}

/**
 * Ermittelt die beiden Teams eines Bracket-Spiels.
 * Rückgabe: { team1, team2, team1Fallback, team2Fallback }
 * team1/team2 sind null, solange der gesetzte Spieler noch nicht feststeht.
 * player2Id ist der ausgeloste Partner (oder null, solange nicht ausgelost).
 */
function getDoublesKnockoutTeams(round, matchNum) {
  if (round === "quarter") {
    const [place1, place2] = DOUBLES_KNOCKOUT_QUARTER_SEEDS[matchNum] || [];
    return {
      team1: _buildDoublesKnockoutTeam(getDoublesSeedPlayerId(place1), round, matchNum, "t1"),
      team2: _buildDoublesKnockoutTeam(getDoublesSeedPlayerId(place2), round, matchNum, "t2"),
      team1Fallback: `Rang ${place1}`,
      team2Fallback: `Rang ${place2}`,
    };
  }

  const [prev1, prev2] =
    round === "semi" ? DOUBLES_KNOCKOUT_SEMI_QUARTERS[matchNum] || [] : [1, 2];
  const prevRound = round === "semi" ? "quarter" : "semi";

  if (round === "semi" || round === "final") {
    return {
      team1: _buildDoublesKnockoutTeam(
        getDoublesKnockoutWinnerTeam(prevRound, prev1)?.player1Id,
        round,
        matchNum,
        "t1",
      ),
      team2: _buildDoublesKnockoutTeam(
        getDoublesKnockoutWinnerTeam(prevRound, prev2)?.player1Id,
        round,
        matchNum,
        "t2",
      ),
      team1Fallback: `Gewinner ${getDoublesKnockoutMatchLabel(prevRound, prev1)}`,
      team2Fallback: `Gewinner ${getDoublesKnockoutMatchLabel(prevRound, prev2)}`,
    };
  }

  return {
    team1: null,
    team2: null,
    team1Fallback: "TBD",
    team2Fallback: "TBD",
  };
}

function getDoublesTeamLabel(team, fallback) {
  if (!team) return fallback;
  const name1 = team.player1Id ? getPlayerName(team.player1Id) : "?";
  const name2 = team.player2Id ? getPlayerName(team.player2Id) : "Partner offen";
  return `${name1} / ${name2}`;
}

/**
 * Label für ein bereits gespieltes Spiel: zeigt genau die eingetragenen Spieler.
 * Bei kampflosen Spielen kann der Partner fehlen.
 */
function getDoublesPlayedTeamLabel(team) {
  if (!team || !team.player1Id) return "—";
  const name1 = getPlayerName(team.player1Id);
  return team.player2Id ? `${name1} / ${getPlayerName(team.player2Id)}` : name1;
}

/**
 * Kann für dieses Team ein Ergebnis eingetragen werden?
 * Es genügt der gesetzte Spieler – der Partner wird im Eingabe-Fenster bestätigt.
 */
function isDoublesKnockoutTeamReady(team) {
  return !!(team && team.player1Id);
}

// ========== Auslosung ==========

/**
 * Spieler der K.O.-Phase (Top 8), die noch nicht ausgeschieden sind.
 * Ausgeschieden ist, wer als Spieler 1 ein K.O.-Spiel verloren hat.
 */
function getActiveDoublesKnockoutPlayerIds() {
  const eliminated = state.doublesKnockoutMatches
    .filter((m) => m.sets)
    .map((m) => {
      const { t1, t2 } = getDoublesKnockoutSetsWon(m);
      return (t1 > t2 ? m.team2 : m.team1)?.player1Id;
    })
    .filter(Boolean);
  return getDoublesRankingList()
    .slice(0, 8)
    .filter((id) => !eliminated.includes(id));
}

/**
 * Prüft, ob partnerId nach den aktiven Auslosungsregeln Partner von seedId
 * sein darf. Rückgabe: Begründung bei Verstoß, sonst null.
 */
function getDoublesKnockoutPartnerViolation(seedId, partnerId) {
  if (!seedId || !partnerId) return null;
  const rules = getDoublesKnockoutDrawRules();
  const seed = state.players.find((p) => p.id === seedId);
  const partner = state.players.find((p) => p.id === partnerId);

  if (
    rules.poolRule &&
    seed?.doublesPool &&
    partner?.doublesPool === seed.doublesPool
  ) {
    return `${partner.name} ist wie ${seed.name} in Pool ${seed.doublesPool}. Jedes Team muss einen Spieler aus Pool A und einen aus Pool B haben.`;
  }

  if (
    rules.blockActivePlayers &&
    getActiveDoublesKnockoutPlayerIds().includes(partnerId)
  ) {
    return `${getPlayerName(partnerId)} ist noch in der K.O.-Phase und darf erst nach dem Ausscheiden als Partner zugelost werden.`;
  }

  return null;
}

/**
 * Spieler, die als Partner von seedId in einem K.O.-Spiel auswählbar sind:
 * alle Doppel-Spieler außer den beiden gesetzten Spielern, die nach den
 * aktiven Auslosungsregeln erlaubt sind.
 */
function getDoublesKnockoutPartnerOptions(team1, team2, seedId) {
  const seeds = [team1?.player1Id, team2?.player1Id].filter(Boolean);
  return state.players.filter(
    (p) =>
      p.doublesPool &&
      !seeds.includes(p.id) &&
      !getDoublesKnockoutPartnerViolation(seedId, p.id),
  );
}

/**
 * Partner, die in den anderen Spielen derselben Runde bereits gespielt haben
 * oder ausgelost wurden – sie werden bei der Auslosung nicht erneut gezogen.
 */
function _getDoublesKnockoutRoundPartnerIds(round, matchNum) {
  const ids = [];
  const matchCount = { quarter: 4, semi: 2 }[round] || 1;
  for (let n = 1; n <= matchCount; n++) {
    if (n === matchNum) continue;
    const match = getDoublesKnockoutMatch(round, n);
    if (match?.sets) {
      ids.push(match.team1?.player2Id, match.team2?.player2Id);
    } else {
      ids.push(
        getDoublesKnockoutDrawnPartner(round, n, "t1"),
        getDoublesKnockoutDrawnPartner(round, n, "t2"),
      );
    }
  }
  return ids.filter(Boolean);
}

async function drawDoublesKnockoutPartners(round, matchNum) {
  const { team1, team2 } = getDoublesKnockoutTeams(round, matchNum);
  if (!team1?.player1Id || !team2?.player1Id) {
    Toast.error("Die Teams stehen noch nicht fest");
    return;
  }
  if (getDoublesKnockoutMatch(round, matchNum)?.sets) {
    Toast.error("Für dieses Spiel ist bereits ein Ergebnis eingetragen");
    return;
  }

  const key = `${round}_${matchNum}`;
  if (state.doublesKnockoutConfig?.draws?.[key]) {
    const confirmed = await Modal.confirm({
      title: "Neu auslosen?",
      message: `Für ${getDoublesKnockoutMatchLabel(round, matchNum)} wurden bereits Partner ausgelost. Soll neu ausgelost werden?`,
      confirmText: "Neu auslosen",
      cancelText: "Abbrechen",
      type: "warning",
    });
    if (!confirmed) return;
  }

  const excluded = [
    team1.player1Id,
    team2.player1Id,
    ..._getDoublesKnockoutRoundPartnerIds(round, matchNum),
  ];
  const candidates = (seedId) =>
    getDoublesKnockoutPartnerOptions(team1, team2, seedId)
      .map((p) => p.id)
      .filter((id) => !excluded.includes(id));

  // Alle gültigen Kombinationen bilden, damit Team 1 nicht den einzigen
  // möglichen Partner von Team 2 "wegzieht"
  const pairs = [];
  const candidates2 = candidates(team2.player1Id);
  candidates(team1.player1Id).forEach((a) =>
    candidates2.forEach((b) => {
      if (a !== b) pairs.push([a, b]);
    }),
  );

  if (pairs.length === 0) {
    Toast.error(
      "Es gibt nicht genug auslosbare Partner. Die Auslosungsregeln können unter Admin → Doppel verwalten gelockert werden.",
      5000,
    );
    return;
  }

  const [partner1, partner2] = pairs[Math.floor(Math.random() * pairs.length)];

  try {
    await db
      .collection("settings")
      .doc("doublesKnockoutConfig")
      .set(
        {
          draws: { [key]: { t1: partner1, t2: partner2 } },
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

    Toast.success(
      `Ausgelost: ${getPlayerName(team1.player1Id)} / ${getPlayerName(partner1)} und ${getPlayerName(team2.player1Id)} / ${getPlayerName(partner2)}`,
      5000,
    );
  } catch (error) {
    console.error("Fehler beim Auslosen:", error);
    Toast.error("Fehler beim Auslosen: " + error.message);
  }
}

/**
 * Schaltet eine Auslosungsregel an/aus (sofort gespeichert).
 * @param {'drawPoolRule'|'drawBlockActivePlayers'} rule
 */
async function setDoublesKnockoutDrawRule(rule, enabled) {
  if (!["drawPoolRule", "drawBlockActivePlayers"].includes(rule)) return;

  try {
    await db
      .collection("settings")
      .doc("doublesKnockoutConfig")
      .set(
        {
          [rule]: !!enabled,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    Toast.success(enabled ? "Regel aktiviert" : "Regel deaktiviert");
  } catch (error) {
    console.error("Fehler beim Speichern:", error);
    Toast.error("Fehler beim Speichern: " + error.message);
    render();
  }
}

// ========== Ergebnis-Eintragung ==========

function openDoublesKnockoutMatchEntry(round, matchNum) {
  state.doublesKnockoutEntryMatch = { round, matchNum };
  state.doublesKnockoutEntry = { set3Disabled: true };
  render();
}

function closeDoublesKnockoutMatchEntry() {
  state.doublesKnockoutEntryMatch = null;
  state.doublesKnockoutEntry = {};
  render();
}

/**
 * Liest die vier Spieler aus dem Eingabe-Modal.
 * Spieler 1 steckt in einem Hidden-Input, der Partner in einem Select.
 */
function _readDoublesKnockoutTeams() {
  const read = (id) => document.getElementById(id)?.value || null;
  return {
    team1: { player1Id: read("dkoT1P1Id"), player2Id: read("dkoT1P2Id") },
    team2: { player1Id: read("dkoT2P1Id"), player2Id: read("dkoT2P2Id") },
  };
}

function _validateDoublesKnockoutTeams(team1, team2, { requirePartners }) {
  if (!team1.player1Id || !team2.player1Id) {
    Toast.error("Teams sind noch nicht vollständig");
    return false;
  }

  if (requirePartners && (!team1.player2Id || !team2.player2Id)) {
    Toast.error("Bitte für beide Teams einen Partner auswählen");
    return false;
  }

  const players = [
    team1.player1Id,
    team1.player2Id,
    team2.player1Id,
    team2.player2Id,
  ].filter(Boolean);
  if (new Set(players).size !== players.length) {
    Toast.error("Ein Spieler kann nicht in beiden Teams spielen");
    return false;
  }

  for (const team of [team1, team2]) {
    const violation = getDoublesKnockoutPartnerViolation(
      team.player1Id,
      team.player2Id,
    );
    if (violation) {
      Toast.error(violation, 5000);
      return false;
    }
  }

  return true;
}

async function saveDoublesKnockoutMatch() {
  const round = document.getElementById("dkoRound").value;
  const matchNum = parseInt(document.getElementById("dkoMatchNum").value);

  const { team1, team2 } = _readDoublesKnockoutTeams();

  if (!_validateDoublesKnockoutTeams(team1, team2, { requirePartners: true })) {
    return;
  }

  const set1T1 = parseInt(document.getElementById("dkoSet1T1").value);
  const set1T2 = parseInt(document.getElementById("dkoSet1T2").value);
  const set2T1 = parseInt(document.getElementById("dkoSet2T1").value);
  const set2T2 = parseInt(document.getElementById("dkoSet2T2").value);
  const set3T1 = parseInt(document.getElementById("dkoSet3T1").value);
  const set3T2 = parseInt(document.getElementById("dkoSet3T2").value);

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
  }

  try {
    const existingMatch = getDoublesKnockoutMatch(round, matchNum);

    if (existingMatch) {
      await seasonCollection("doublesMatches").doc(existingMatch.id).update({
        team1,
        team2,
        sets,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      await seasonCollection("doublesMatches").add({
        round,
        matchNum,
        team1,
        team2,
        sets,
        status: _getDefaultMatchStatus("doubles"),
        date: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }

    state.doublesKnockoutEntryMatch = null;
    state.doublesKnockoutEntry = {};
    Toast.success("K.O.-Spiel erfolgreich eingetragen!");
    render();
  } catch (error) {
    console.error("Fehler beim Speichern:", error);
    Toast.error("Fehler beim Speichern: " + error.message);
  }
}

/**
 * Trägt ein K.O.-Spiel kampflos ein (21:0, 21:0 für das gewinnende Team).
 * Partner sind hier optional – wenn nicht angetreten wurde, ist er oft unbekannt.
 */
async function saveDoublesKnockoutWalkover(winnerSlot) {
  const round = document.getElementById("dkoRound").value;
  const matchNum = parseInt(document.getElementById("dkoMatchNum").value);

  const { team1, team2 } = _readDoublesKnockoutTeams();

  if (!_validateDoublesKnockoutTeams(team1, team2, { requirePartners: false })) {
    return;
  }

  const winnerTeam = winnerSlot === "t2" ? team2 : team1;

  const confirmed = await Modal.confirm({
    title: "Kampflos eintragen?",
    message: `Das Spiel wird kampflos für ${getDoublesPlayedTeamLabel(winnerTeam)} gewertet (21:0, 21:0).`,
    confirmText: "Kampflos eintragen",
    cancelText: "Abbrechen",
    type: "warning",
  });

  if (!confirmed) return;

  const sets =
    winnerSlot === "t2"
      ? [
          { t1: 0, t2: 21 },
          { t1: 0, t2: 21 },
        ]
      : [
          { t1: 21, t2: 0 },
          { t1: 21, t2: 0 },
        ];

  try {
    const existingMatch = getDoublesKnockoutMatch(round, matchNum);

    if (existingMatch) {
      await seasonCollection("doublesMatches").doc(existingMatch.id).update({
        team1,
        team2,
        sets,
        walkover: true,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      await seasonCollection("doublesMatches").add({
        round,
        matchNum,
        team1,
        team2,
        sets,
        status: "confirmed",
        walkover: true,
        date: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }

    state.doublesKnockoutEntryMatch = null;
    state.doublesKnockoutEntry = {};
    Toast.success("Kampfloses K.O.-Spiel eingetragen!");
    render();
  } catch (error) {
    console.error("Fehler beim Speichern:", error);
    Toast.error("Fehler beim Speichern: " + error.message);
  }
}

// ========== Aktivierung / Deaktivierung ==========

async function activateDoublesKnockoutPhase() {
  const ranking = flattenPyramidLevels(state.pyramid.levels || []);

  if (ranking.length < 8) {
    Toast.error(
      `Die Pyramide enthält nur ${ranking.length} Spieler, für die K.O.-Phase werden mindestens 8 benötigt.`,
    );
    return;
  }

  const confirmed = await Modal.confirm({
    title: "Doppel-K.O.-Phase starten?",
    message:
      "Möchtest du die K.O.-Phase im Doppel jetzt starten? Die aktuelle Pyramiden-Rangfolge wird eingefroren und ist die Grundlage für die Setzliste. Neue Pyramiden-Spiele sind danach nicht mehr möglich.",
    confirmText: "K.O.-Phase starten",
    cancelText: "Abbrechen",
    type: "warning",
  });

  if (!confirmed) return;

  try {
    state.doublesKnockoutPhaseActive = true;
    state.frozenPyramid = ranking;

    await db.collection("settings").doc("doublesKnockout").set({
      active: true,
      frozenPyramid: ranking,
      activatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    Toast.success(
      "Doppel-K.O.-Phase aktiviert! Die Pyramiden-Rangfolge wurde eingefroren.",
      4000,
    );
    render();
  } catch (error) {
    console.error("Fehler beim Aktivieren:", error);
    Toast.error("Fehler beim Aktivieren: " + error.message);
  }
}

async function deactivateDoublesKnockoutPhase() {
  const confirmed = await Modal.confirm({
    title: "Doppel-K.O.-Phase deaktivieren?",
    message:
      "Möchtest du die K.O.-Phase im Doppel wirklich deaktivieren? Die Pyramide bleibt erhalten, aber alle Spiele und Auslosungen der K.O.-Phase werden gelöscht.",
    confirmText: "Deaktivieren",
    cancelText: "Abbrechen",
    type: "danger",
  });

  if (!confirmed) return;

  try {
    state.doublesKnockoutPhaseActive = false;
    state.frozenPyramid = null;
    state.doublesView = "pyramid";

    await db.collection("settings").doc("doublesKnockout").set({
      active: false,
      frozenPyramid: null,
      deactivatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    for (const match of state.doublesMatches.filter((m) => m.round)) {
      await seasonCollection("doublesMatches").doc(match.id).delete();
    }

    // Auslosungen gehören zur K.O.-Phase und werden mit ihr verworfen
    if (state.doublesKnockoutConfig?.draws) {
      await db.collection("settings").doc("doublesKnockoutConfig").update({
        draws: firebase.firestore.FieldValue.delete(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }

    Toast.success("Doppel-K.O.-Phase deaktiviert.");
    render();
  } catch (error) {
    console.error("Fehler beim Deaktivieren:", error);
    Toast.error("Fehler beim Deaktivieren: " + error.message);
  }
}
