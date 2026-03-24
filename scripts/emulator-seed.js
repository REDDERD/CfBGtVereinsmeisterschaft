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

const USERS = [
  { email: "admin@test.de", password: "adminpw", isAdmin: true },
  { email: "simple@test.de", password: "simplepw", isAdmin: false },
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

async function seed() {
  console.log("Seed-Script gestartet...\n");

  // 1. Nutzer anlegen
  const [adminUid] = await Promise.all(USERS.map(createUser));

  // 3. Settings-Dokumente anlegen
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

  // 4. Testdaten: Spieler
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
    const ref = await db.collection("players").add({
      ...p,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    playerIds.push(ref.id);
  }
  console.log(`${players.length} Spieler angelegt`);

  // 5. Beispiel-Matches
  const now = admin.firestore.Timestamp.now();
  await db.collection("singlesMatches").add({
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
  await db.collection("singlesMatches").add({
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
  console.log("2 Beispiel-Matches angelegt");

  console.log("\nSeed abgeschlossen!");
  console.log("--------------------------------------------------");
  console.log(`Admin-Login: ${USERS[0].email}  ${USERS[0].password}`);
  console.log(`Simple-Login: ${USERS[1].email}  ${USERS[1].password}`);
  console.log("--------------------------------------------------");
}

seed().catch((err) => {
  console.error("Fehler beim Seeden:", err);
  process.exit(1);
});
