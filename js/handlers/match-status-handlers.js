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