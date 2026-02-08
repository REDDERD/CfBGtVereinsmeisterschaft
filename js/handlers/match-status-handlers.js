// js/handlers/match-status-handlers.js
// Status-Einstellungen verwalten
// (updateMatchStatus → match-service.js)
// (toggleMatchStatusFilter → events/search-filters.js)

async function updateMatchStatusSettings() {
  const singlesAdminStatus = document.getElementById('singlesAdminStatus')?.value;
  const singlesUserStatus = document.getElementById('singlesUserStatus')?.value;
  const doublesAdminStatus = document.getElementById('doublesAdminStatus')?.value;
  const doublesUserStatus = document.getElementById('doublesUserStatus')?.value;

  const newSettings = {};
  
  if (singlesAdminStatus) newSettings.singlesAdminDefault = singlesAdminStatus;
  if (singlesUserStatus) newSettings.singlesUserDefault = singlesUserStatus;
  if (doublesAdminStatus) newSettings.doublesAdminDefault = doublesAdminStatus;
  if (doublesUserStatus) newSettings.doublesUserDefault = doublesUserStatus;

  if (Object.keys(newSettings).length > 0) {
    try {
      await db.collection('settings').doc('defaultMatchStatus').set(newSettings, { merge: true });
      Toast.success('Einstellungen gespeichert');
    } catch (error) {
      console.error('Fehler beim Speichern der Einstellungen:', error);
      Toast.error('Fehler beim Speichern der Einstellungen');
    }
  }
}

/**
 * Aktualisiert die Einstellungen für die Anzeige unbestätigter Spiele im Matches-Tab
 */
async function updateMatchesDisplaySettings() {
  const showUnconfirmedSingles = document.getElementById('showUnconfirmedSingles')?.checked || false;
  const showUnconfirmedDoubles = document.getElementById('showUnconfirmedDoubles')?.checked || false;

  const newSettings = {
    showUnconfirmedSingles,
    showUnconfirmedDoubles,
  };

  try {
    await db.collection('settings').doc('matchesDisplay').set(newSettings);
    
    // State aktualisieren
    state.matchesDisplaySettings = newSettings;
    
    Toast.success('Anzeige-Einstellungen gespeichert');
    
    // Seite neu rendern, um die Änderungen sofort anzuzeigen
    render();
  } catch (error) {
    console.error('Fehler beim Speichern der Anzeige-Einstellungen:', error);
    Toast.error('Fehler beim Speichern der Einstellungen');
  }
}

/**
 * Lädt die Einstellungen für die Anzeige unbestätigter Spiele aus Firebase
 */
async function loadMatchesDisplaySettings() {
  try {
    const doc = await db.collection('settings').doc('matchesDisplay').get();
    
    if (doc.exists) {
      state.matchesDisplaySettings = doc.data();
    } else {
      // Standardwerte
      state.matchesDisplaySettings = {
        showUnconfirmedSingles: false,
        showUnconfirmedDoubles: false,
      };
    }
  } catch (error) {
    console.error('Fehler beim Laden der Anzeige-Einstellungen:', error);
    state.matchesDisplaySettings = {
      showUnconfirmedSingles: false,
      showUnconfirmedDoubles: false,
    };
  }
}

// Sicherstellen, dass die Funktionen global verfügbar sind
if (typeof window !== 'undefined') {
  window.updateMatchesDisplaySettings = updateMatchesDisplaySettings;
  window.loadMatchesDisplaySettings = loadMatchesDisplaySettings;
}