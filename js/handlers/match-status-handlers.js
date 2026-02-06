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
