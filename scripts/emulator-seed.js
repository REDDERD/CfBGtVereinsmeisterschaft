// scripts/seed.js
// Befüllt den lokalen Firebase Emulator mit Testdaten.
// Voraussetzung: Emulator läuft bereits (firebase emulators:start)
// Aufruf: npm run seed (im /scripts Ordner)

process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";

const admin = require("firebase-admin");

admin.initializeApp({
  projectId: "cfbgtvereinsmeisterschaft",
});

const db = admin.firestore();
const authAdmin = admin.auth();

const SEASON_YEAR = "2026";

const USERS = [
  { email: "admin@test.de", password: "adminpw", isAdmin: true },
  { email: "simple@test.de", password: "testpw",  isAdmin: false },
];

async function createUser({ email, password, isAdmin }) {
  let uid;
  try {
    const existing = await authAdmin.getUserByEmail(email);
    uid = existing.uid;
    console.log(`Auth-User bereits vorhanden: ${email} (uid: ${uid})`);
  } catch {
    const newUser = await authAdmin.createUser({ email, password });
    uid = newUser.uid;
    console.log(`Auth-User angelegt: ${email} (uid: ${uid})`);
  }
  await db.collection("users").doc(uid).set({ isAdmin });
  console.log(`users-Dokument angelegt: ${email} isAdmin=${isAdmin}`);
  return uid;
}

// Hilfsfunktion: Collection innerhalb einer Saison
function seasonCol(collectionName) {
  return db.collection("seasons").doc(SEASON_YEAR).collection(collectionName);
}

async function seed() {
  console.log("Seed-Script gestartet...\n");

  // 1. Nutzer anlegen (global)
  const [adminUid] = await Promise.all(USERS.map(createUser));

  // 2. Aktive Saison setzen (global)
  await db.collection("settings").doc("activeSeason").set({
    year: parseInt(SEASON_YEAR),
  });
  console.log(`Aktive Saison auf ${SEASON_YEAR} gesetzt`);

  // 3. Saison-Dokument anlegen
  await db.collection("seasons").doc(SEASON_YEAR).set({
    label: `Saison ${SEASON_YEAR}`,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log(`Saison-Dokument ${SEASON_YEAR} angelegt`);

  // 4. Settings-Dokumente anlegen (global)
  const settings = {
    defaultMatchStatus: {
      singlesAdminDefault: "confirmed",
      singlesUserDefault: "unconfirmed",
      doublesAdminDefault: "confirmed",
      doublesUserDefault: "unconfirmed",
    },
    matchesDisplay: {
      showUnconfirmedSingles: true,
      showUnconfirmedDoubles: true,
    },
    singlesValidation: { mode: "allow" },
    doublesValidation: { mode: "allow" },
    knockout: { active: false, frozenStandings: null },
    knockoutConfig: {},
  };

  for (const [docId, data] of Object.entries(settings)) {
    await db.collection("settings").doc(docId).set(data);
  }
  console.log("Settings angelegt");

  // 5. Testdaten: Spieler (in Saison)
  const players = [
    { name: "Anna Müller", singlesGroup: 1, doublesPool: "A" },
    { name: "Ben Schmidt", singlesGroup: 1, doublesPool: "A" },
    { name: "Clara Weber", singlesGroup: 1, doublesPool: "B" },
    { name: "David Koch", singlesGroup: 2, doublesPool: "B" },
    { name: "Eva Braun", singlesGroup: 2, doublesPool: "A" },
    { name: "Felix Wagner", singlesGroup: 2, doublesPool: "B" },
  ];

  const playerIds = [];
  for (const p of players) {
    const ref = await seasonCol("players").add({
      ...p,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    playerIds.push(ref.id);
  }
  console.log(`${players.length} Spieler angelegt (Saison ${SEASON_YEAR})`);

  // 6. Beispiel-Matches (in Saison)
  const now = admin.firestore.Timestamp.now();
  await seasonCol("singlesMatches").add({
    player1Id: playerIds[0],
    player2Id: playerIds[1],
    sets: [
      { p1: 21, p2: 18 },
      { p1: 19, p2: 21 },
      { p1: 21, p2: 15 },
    ],
    round: "group1",
    status: "confirmed",
    date: now,
  });
  await seasonCol("singlesMatches").add({
    player1Id: playerIds[2],
    player2Id: playerIds[3],
    sets: [
      { p1: 21, p2: 14 },
      { p1: 21, p2: 16 },
    ],
    round: "group2",
    status: "unconfirmed",
    date: now,
  });
  console.log(`2 Beispiel-Matches angelegt (Saison ${SEASON_YEAR})`);

  console.log("\nSeed abgeschlossen!");
  console.log("--------------------------------------------------");
  console.log(`Admin-Login: ${USERS[0].email}  ${USERS[0].password}`);
  console.log(`Simple-Login: ${USERS[1].email}  ${USERS[1].password}`);
  console.log(`Aktive Saison: ${SEASON_YEAR}`);
  console.log("--------------------------------------------------");
}

seed().catch((err) => {
  console.error("Fehler beim Seeden:", err);
  process.exit(1);
});
