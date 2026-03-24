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

// Saison-abhängige Collections (liegen unter seasons/{year}/...)
const SEASON_COLLECTIONS = [
  'players',
  'singlesMatches',
  'doublesMatches',
  'pyramid',
  'challenges',
];

// Globale Collections
const GLOBAL_COLLECTIONS = [
  'settings',
  'users',
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
    global: {},
    seasons: {},
  };

  console.log(`Starte Datensicherung (${dateStr})...`);

  // 1. Globale Collections sichern
  console.log('\n--- Globale Collections ---');
  for (const collectionName of GLOBAL_COLLECTIONS) {
    process.stdout.write(`  ${collectionName} ... `);
    const snapshot = await db.collection(collectionName).get();
    backupData.global[collectionName] = {};
    snapshot.forEach(doc => {
      backupData.global[collectionName][doc.id] = serialize(doc.data());
    });
    console.log(`${snapshot.size} Dokumente`);
  }

  // 2. Alle Saisons ermitteln
  const seasonsSnapshot = await db.collection('seasons').get();
  const seasonYears = seasonsSnapshot.docs.map(doc => doc.id);

  if (seasonYears.length === 0) {
    console.log('\nKeine Saisons gefunden.');
  }

  // 3. Saison-Collections sichern
  for (const year of seasonYears) {
    console.log(`\n--- Saison ${year} ---`);
    backupData.seasons[year] = {};

    for (const collectionName of SEASON_COLLECTIONS) {
      process.stdout.write(`  ${collectionName} ... `);
      const snapshot = await db.collection('seasons').doc(year).collection(collectionName).get();
      backupData.seasons[year][collectionName] = {};
      snapshot.forEach(doc => {
        backupData.seasons[year][collectionName][doc.id] = serialize(doc.data());
      });
      console.log(`${snapshot.size} Dokumente`);
    }
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
