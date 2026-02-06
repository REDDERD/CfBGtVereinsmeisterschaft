const admin = require("firebase-admin");
const { Resend } = require("resend");

// Firebase Service Account
const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const auth = admin.auth();

// Resend Setup
const resend = new Resend(process.env.RESEND_API_KEY);

async function getUnconfirmedMatches(collectionName) {
  const snapshot = await db
    .collection(collectionName)
    .where("status", "==", "unconfirmed")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

async function getNotifiableUserIds() {
  const snapshot = await db
    .collection("users")
    .where("notificationEnabled", "==", true)
    .get();

  return snapshot.docs.map((doc) => doc.id);
}

async function getEmailsFromAuth(uids) {
  const emails = [];

  for (const uid of uids) {
    try {
      const user = await auth.getUser(uid);
      if (user.email) emails.push(user.email);
    } catch (err) {
      console.error("Auth lookup failed:", uid, err.message);
    }
  }

  return emails;
}

async function sendEmail(recipients, singles, doubles) {
  if (!recipients.length) {
    console.log("No recipients found");
    return;
  }

  const subject = "Unbestätigte Matches vorhanden";

  const text = `
Es gibt unbestätigte Matches:

Singles: ${singles.length}
Doubles: ${doubles.length}

Bitte prüfen.
`;

  const html = `
    <h2>Unbestätigte Matches</h2>
    <p>Es gibt aktuell Matches, die noch bestätigt werden müssen.</p>
    <ul>
      <li><strong>Singles:</strong> ${singles.length}</li>
      <li><strong>Doubles:</strong> ${doubles.length}</li>
    </ul>
    <p>Bitte im System prüfen.</p>
  `;

  await resend.emails.send({
    from: process.env.MAIL_FROM,
    to: recipients,
    subject,
    text,
    html,
  });

  console.log("Emails sent to:", recipients.length);
}

async function run() {
  console.log("Checking for unconfirmed matches...");

  const [singles, doubles] = await Promise.all([
    getUnconfirmedMatches("singlesMatches"),
    getUnconfirmedMatches("doublesMatches"),
  ]);

  if (!singles.length && !doubles.length) {
    console.log("No unconfirmed matches 👍");
    return;
  }

  const uids = await getNotifiableUserIds();
  const emails = await getEmailsFromAuth(uids);

  await sendEmail(emails, singles, doubles);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
