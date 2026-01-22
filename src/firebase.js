// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyArdTajlSvaUqWh4-LFrhJXOKukn9iecZs",
  authDomain: "cfbgtvereinsmeisterschaft.firebaseapp.com",
  projectId: "cfbgtvereinsmeisterschaft",
  storageBucket: "cfbgtvereinsmeisterschaft.firebasestorage.app",
  messagingSenderId: "527308111102",
  appId: "1:527308111102:web:ef1b52153dd75a6a0c79af",
  measurementId: "G-QKGNPLQN20"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);