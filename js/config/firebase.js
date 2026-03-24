// js/config/firebase.js
// Firebase Konfiguration und Initialisierung

const firebaseConfig = {
  apiKey: "AIzaSyArdTajlSvaUqWh4-LFrhJXOKukn9iecZs",
  authDomain: "cfbgtvereinsmeisterschaft.firebaseapp.com",
  projectId: "cfbgtvereinsmeisterschaft",
  storageBucket: "cfbgtvereinsmeisterschaft.firebasestorage.app",
  messagingSenderId: "527308111102",
  appId: "1:527308111102:web:ef1b52153dd75a6a0c79af",
  measurementId: "G-QKGNPLQN20",
};

// Firebase initialisieren
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Emulator-Modus: wird automatisch aktiviert wenn die App lokal läuft
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
  db.useEmulator("localhost", 8080);
  auth.useEmulator("http://localhost:9099");
  console.log("🔧 Firebase Emulator aktiv (lokale Testumgebung)");
}