import { initializeApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getAuth, connectAuthEmulator } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyArdTajlSvaUqWh4-LFrhJXOKukn9iecZs',
  authDomain: 'cfbgtvereinsmeisterschaft.firebaseapp.com',
  projectId: 'cfbgtvereinsmeisterschaft',
  storageBucket: 'cfbgtvereinsmeisterschaft.firebasestorage.app',
  messagingSenderId: '527308111102',
  appId: '1:527308111102:web:ef1b52153dd75a6a0c79af',
  measurementId: 'G-QKGNPLQN20',
}

export const firebaseApp = initializeApp(firebaseConfig)
export const db = getFirestore(firebaseApp)
export const auth = getAuth(firebaseApp)

if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
  connectFirestoreEmulator(db, 'localhost', 8080)
  connectAuthEmulator(auth, 'http://localhost:9099')
  console.log('🔧 Firebase Emulator aktiv (lokale Testumgebung)')
}
