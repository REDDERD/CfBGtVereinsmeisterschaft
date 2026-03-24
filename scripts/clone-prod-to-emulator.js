// scripts/clone-prod-to-emulator.js
// Klont die komplette Prod-Firestore-DB in den lokalen Emulator.
// Erstellt außerdem Test-Auth-Accounts (Admin + User) mit passenden users-Einträgen.
//
// Voraussetzungen:
//   1. Emulator läuft (firebase emulators:start)
//   2. FIREBASE_SERVICE_ACCOUNT Env-Variable gesetzt
//
// Aufruf: FIREBASE_SERVICE_ACCOUNT=$(cat pfad/zur/key.json) node scripts/clone-prod-to-emulator.js

// Emulator-Env MUSS vor dem Import von firebase-admin gesetzt werden
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

const admin = require('firebase-admin');
const http = require('http');

// ========== Config ==========

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// Prod-App (mit echten Credentials, OHNE Emulator)
// Wir müssen die Env-Variablen temporär entfernen, damit die Prod-App nicht den Emulator nutzt
delete process.env.FIRESTORE_EMULATOR_HOST;
delete process.env.FIREBASE_AUTH_EMULATOR_HOST;

const prodApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
}, 'prod');
const prodDb = prodApp.firestore();

// Env-Variablen wieder setzen für die lokale App
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

const localApp = admin.initializeApp({
  projectId: serviceAccount.project_id,
}, 'local');
const localDb = localApp.firestore();
const localAuth = localApp.auth();

// Test-Accounts (gleich wie im Seed-Skript)
const TEST_USERS = [
  { email: 'admin@test.de', password: 'adminpw', isAdmin: true },
  { email: 'simple@test.de', password: 'testpw', isAdmin: false },
];

const GLOBAL_COLLECTIONS = [
  'settings',
  'users',
  'announcements',
];

const SEASON_COLLECTIONS = [
  'players',
  'singlesMatches',
  'doublesMatches',
  'pyramid',
  'challenges',
];

// ========== Hilfsfunktionen ==========

async function copyCollection(sourceRef, targetRef, label) {
  const snapshot = await sourceRef.get();
  if (snapshot.empty) {
    console.log(`  ${label}: 0 Dokumente (leer)`);
    return 0;
  }

  let batch = localDb.batch();
  let count = 0;
  let batchCount = 0;

  for (const doc of snapshot.docs) {
    batch.set(targetRef.doc(doc.id), doc.data());
    count++;
    batchCount++;

    if (batchCount >= 450) {
      await batch.commit();
      batch = localDb.batch();
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  console.log(`  ${label}: ${count} Dokumente`);
  return count;
}

function clearEmulator() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: `/emulator/v1/projects/${serviceAccount.project_id}/databases/(default)/documents`,
      method: 'DELETE',
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        resolve();
      } else {
        reject(new Error(`Emulator clear failed: ${res.statusCode}`));
      }
    });

    req.on('error', (err) => {
      reject(new Error(`Emulator nicht erreichbar (läuft er?): ${err.message}`));
    });

    req.end();
  });
}

// Auth-Emulator leeren via REST API
function clearAuthEmulator() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ project_id: serviceAccount.project_id });
    const options = {
      hostname: 'localhost',
      port: 9099,
      path: `/emulator/v1/projects/${serviceAccount.project_id}/accounts`,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        resolve();
      } else {
        reject(new Error(`Auth Emulator clear failed: ${res.statusCode}`));
      }
    });

    req.on('error', (err) => {
      reject(new Error(`Auth Emulator nicht erreichbar: ${err.message}`));
    });

    req.write(postData);
    req.end();
  });
}

async function createTestAccounts() {
  console.log('\n--- Test-Accounts anlegen ---');

  for (const user of TEST_USERS) {
    let uid;
    try {
      const existing = await localAuth.getUserByEmail(user.email);
      uid = existing.uid;
      console.log(`  ${user.email}: bereits vorhanden (uid: ${uid})`);
    } catch {
      const newUser = await localAuth.createUser({
        email: user.email,
        password: user.password,
      });
      uid = newUser.uid;
      console.log(`  ${user.email}: angelegt (uid: ${uid})`);
    }

    // users-Dokument im Emulator anlegen/überschreiben
    await localDb.collection('users').doc(uid).set({ isAdmin: user.isAdmin });
    console.log(`  → users/${uid} { isAdmin: ${user.isAdmin} }`);
  }
}

// ========== Hauptlogik ==========

async function cloneProdToEmulator() {
  console.log('\n========================================');
  console.log('  Prod → Emulator Klon');
  console.log('========================================\n');

  // 1. Emulatoren leeren
  process.stdout.write('Firestore-Emulator leeren... ');
  try {
    await clearEmulator();
    console.log('OK');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  process.stdout.write('Auth-Emulator leeren... ');
  try {
    await clearAuthEmulator();
    console.log('OK');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  let totalDocs = 0;

  // 2. Globale Collections kopieren
  console.log('\n--- Globale Collections ---');
  for (const col of GLOBAL_COLLECTIONS) {
    const count = await copyCollection(
      prodDb.collection(col),
      localDb.collection(col),
      col
    );
    totalDocs += count;
  }

  // 3. Alle Saisons ermitteln und kopieren
  console.log('\n--- Saisons ---');
  const seasonsSnapshot = await prodDb.collection('seasons').get();

  if (seasonsSnapshot.empty) {
    console.log('  Keine Saisons gefunden.');
  }

  for (const seasonDoc of seasonsSnapshot.docs) {
    const year = seasonDoc.id;
    console.log(`\n  Saison ${year}:`);

    // Saison-Dokument selbst kopieren
    await localDb.collection('seasons').doc(year).set(seasonDoc.data());
    totalDocs++;

    // Subcollections der Saison kopieren
    for (const col of SEASON_COLLECTIONS) {
      const count = await copyCollection(
        prodDb.collection('seasons').doc(year).collection(col),
        localDb.collection('seasons').doc(year).collection(col),
        `  ${col}`
      );
      totalDocs += count;
    }
  }

  // 4. Test-Accounts anlegen und users-Dokumente erstellen
  await createTestAccounts();

  // 5. Zusammenfassung
  console.log('\n========================================');
  console.log(`  Klon abgeschlossen!`);
  console.log(`  ${totalDocs} Dokumente kopiert`);
  console.log(`  ${seasonsSnapshot.size} Saison(en)`);
  console.log('----------------------------------------');
  console.log('  Test-Logins:');
  for (const user of TEST_USERS) {
    console.log(`    ${user.email} / ${user.password} (${user.isAdmin ? 'Admin' : 'User'})`);
  }
  console.log('========================================\n');

  process.exit(0);
}

cloneProdToEmulator().catch(err => {
  console.error('Fehler beim Klonen:', err);
  process.exit(1);
});
