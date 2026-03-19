// scripts/backup.js
// Liest alle Firestore-Collections und speichert sie als JSON-Datei im /backup Ordner.
// Wird täglich per GitHub Action aufgerufen.

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const COLLECTIONS = [
  'players',
  'singlesMatches',
  'doublesMatches',
  'pyramid',
  'challenges',
  'settings',
  'announcements',
];

// Firestore Timestamp-Objekte in ein wiederherstellbares Format serialisieren
function serialize(data) {
  if (data === null || data === undefined) return data;
  if (data instanceof admin.firestore.Timestamp) {
    return { _type: 'Timestamp', seconds: data.seconds, nanoseconds: data.nanoseconds };
  }
  if (Array.isArray(data)) return data.map(serialize);
  if (typeof data === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = serialize(value);
    }
    return result;
  }
  return data;
}

async function runBackup() {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  const backupData = {
    timestamp: now.toISOString(),
    projectId: serviceAccount.project_id,
    collections: {},
  };

  console.log(`Starte Datensicherung (${dateStr})...`);

  for (const collectionName of COLLECTIONS) {
    process.stdout.write(`  ${collectionName} ... `);
    const snapshot = await db.collection(collectionName).get();
    backupData.collections[collectionName] = {};
    snapshot.forEach(doc => {
      backupData.collections[collectionName][doc.id] = serialize(doc.data());
    });
    console.log(`${snapshot.size} Dokumente`);
  }

  const backupDir = path.join(__dirname, '..', 'backup');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const filepath = path.join(backupDir, `backup_${dateStr}.json`);
  fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2), 'utf8');

  console.log(`\nDatensicherung gespeichert: backup/backup_${dateStr}.json`);
  process.exit(0);
}

runBackup().catch(err => {
  console.error('Fehler bei der Datensicherung:', err);
  process.exit(1);
});
