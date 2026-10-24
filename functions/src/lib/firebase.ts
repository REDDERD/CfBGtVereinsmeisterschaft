// functions/src/lib/firebase.ts
// Admin-SDK-Initialisierung (umgeht die Firestore Security Rules)

import {getApps, initializeApp} from "firebase-admin/app";
import {FieldValue, getFirestore, Timestamp} from "firebase-admin/firestore";

if (getApps().length === 0) initializeApp();

export const db = getFirestore();
export {FieldValue, Timestamp};
