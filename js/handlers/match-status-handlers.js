// js/match-status-services.js
// Event Handler für Match-Status-Verwaltung

// Toggle Match Status Filter
function toggleMatchStatusFilter(status) {
  switch(status) {
    case 'unconfirmed':
      state.matchApprovalFilters.showUnconfirmed = !state.matchApprovalFilters.showUnconfirmed;
      break;
    case 'confirmed':
      state.matchApprovalFilters.showConfirmed = !state.matchApprovalFilters.showConfirmed;
      break;
    case 'rejected':
      state.matchApprovalFilters.showRejected = !state.matchApprovalFilters.showRejected;
      break;
  }
  render();
}

// Update Match Status Settings
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

  // Wenn wir Werte haben, speichere sie
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
// Update Match Status (Singles, Doubles und Knockout)
async function updateMatchStatus(matchId, matchType, newStatus) {
  try {
    let collection;
    if (matchType === 'singles') {
      collection = 'singlesMatches';
    } else if (matchType === 'doubles') {
      collection = 'doublesMatches';
    } else if (matchType === 'knockout') {
      collection = 'knockoutMatches';
    } else {
      Toast.error('Unbekannter Spieltyp');
      return;
    }
    
    await db.collection(collection).doc(matchId).update({
      status: newStatus,
      statusUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    const statusNames = {
      'confirmed': 'bestätigt',
      'rejected': 'abgelehnt',
      'unconfirmed': 'auf unbestätigt gesetzt'
    };
    
    Toast.success(`Spiel ${statusNames[newStatus]}`);
  } catch (error) {
    console.error('Error updating match status:', error);
    Toast.error('Fehler beim Aktualisieren des Status');
  }
}