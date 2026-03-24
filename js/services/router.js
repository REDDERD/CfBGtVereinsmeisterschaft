// js/services/router.js
// Hash-basiertes Routing für Archiv-Modus
// URLs: #/archive/{year} oder #/archive/{year}/{page}

/**
 * Prüft ob der aktuelle Hash ein Archiv-Link ist
 * @returns {{ archiveYear: number, page: string } | null}
 */
function parseHash() {
  const hash = window.location.hash;
  const match = hash.match(/^#\/archive\/(\d{4})(?:\/(\w+))?$/);
  if (match) {
    return { archiveYear: parseInt(match[1]), page: match[2] || 'home' };
  }
  return null;
}

/**
 * Read-Only Helper — true wenn App im Archiv-Modus ist
 */
function isReadOnly() {
  return state.archiveMode === true;
}

/**
 * Archiv-Modus betreten
 */
function enterArchiveMode(year, page) {
  state.archiveMode = true;
  state.archiveYear = year;
  state.activeSeason = year;
  state.currentPage = page || 'home';

  // Hash setzen (ohne erneutes hashchange-Event auszulösen)
  const targetHash = `#/archive/${year}${page && page !== 'home' ? '/' + page : ''}`;
  if (window.location.hash !== targetHash) {
    window.location.hash = targetHash;
  }

  initSeasonListeners();
  render();
}

/**
 * Archiv-Modus verlassen — zurück zur Live-Saison
 */
function exitArchiveMode() {
  state.archiveMode = false;
  state.archiveYear = null;
  state.activeSeason = state.liveActiveSeason;
  state.currentPage = 'home';

  // Hash leeren
  history.replaceState(null, '', window.location.pathname + window.location.search);

  initSeasonListeners();
  render();
}

/**
 * Hash im Archiv-Modus aktualisieren (bei Seitenwechsel)
 */
function updateArchiveHash(page) {
  if (!state.archiveMode) return;
  const targetHash = `#/archive/${state.archiveYear}${page && page !== 'home' ? '/' + page : ''}`;
  if (window.location.hash !== targetHash) {
    window.location.hash = targetHash;
  }
}

// Hash-Change Listener
window.addEventListener('hashchange', () => {
  const parsed = parseHash();
  if (parsed) {
    // Archiv-Link erkannt
    if (!state.archiveMode || state.archiveYear !== parsed.archiveYear) {
      // Neues Archiv-Jahr → komplett neu laden
      enterArchiveMode(parsed.archiveYear, parsed.page);
    } else if (state.currentPage !== parsed.page) {
      // Gleiches Jahr, andere Seite
      state.currentPage = parsed.page;
      render();
    }
  } else if (state.archiveMode) {
    // Hash geleert/geändert → Archiv verlassen
    exitArchiveMode();
  }
});
