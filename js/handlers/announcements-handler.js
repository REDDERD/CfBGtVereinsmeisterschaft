// js/handlers/announcements-handler.js
// Handler für Ankündigungen

async function addAnnouncement() {
  const textarea = document.getElementById('announcementText');
  const text = textarea?.value?.trim();
  if (!text) {
    Toast.error('Bitte einen Text eingeben.');
    return;
  }

  try {
    await db.collection('announcements').add({
      text,
      active: true,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    textarea.value = '';
    Toast.success('Ankündigung gespeichert.');
  } catch (e) {
    Toast.error('Fehler beim Speichern: ' + e.message);
  }
}

async function toggleAnnouncement(id, currentActive) {
  try {
    await db.collection('announcements').doc(id).update({
      active: !currentActive,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    Toast.success(currentActive ? 'Ankündigung deaktiviert.' : 'Ankündigung aktiviert.');
  } catch (e) {
    Toast.error('Fehler: ' + e.message);
  }
}

async function deleteAnnouncement(id) {
  const confirmed = await Modal.confirm({
    title: 'Ankündigung löschen',
    message: 'Soll diese Ankündigung wirklich gelöscht werden?',
    confirmText: 'Löschen',
    cancelText: 'Abbrechen',
    type: 'danger',
  });
  if (!confirmed) return;

  try {
    await db.collection('announcements').doc(id).delete();
    Toast.success('Ankündigung gelöscht.');
  } catch (e) {
    Toast.error('Fehler beim Löschen: ' + e.message);
  }
}

// Parst [Linktext](page) im Text und ersetzt mit klickbaren Inline-Buttons
function renderAnnouncementText(text, linkClass = 'font-bold underline hover:no-underline cursor-pointer') {
  const validPages = ['home', 'singles', 'doubles', 'challenges', 'statistics', 'matches', 'players'];
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, page) => {
    if (validPages.includes(page)) {
      return `<button onclick="navigateTo('${page}')" class="${linkClass}">${linkText}</button>`;
    }
    return linkText;
  });
}
