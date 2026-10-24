// functions/src/lib/auth.ts
// Rollenprüfung – der Admin-Status kommt immer aus users/{uid}, nie aus dem Payload

import type {CallableRequest} from "firebase-functions/https";
import {COLLECTIONS} from "../config.js";
import {fail} from "./errors.js";
import {db} from "./firebase.js";

export interface Caller {
  uid: string;
  isAdmin: boolean;
}

/** Eingeloggt (Admin oder QR-Login-Nutzer). */
export async function requireAuth(request: CallableRequest): Promise<Caller> {
  const uid = request.auth?.uid;
  if (!uid) fail("unauthenticated", "Bitte zuerst anmelden.");

  const userDoc = await db.collection(COLLECTIONS.users).doc(uid).get();
  return {uid, isAdmin: userDoc.get("isAdmin") === true};
}

export async function requireAdmin(request: CallableRequest): Promise<Caller> {
  const caller = await requireAuth(request);
  if (!caller.isAdmin) fail("permission-denied", "Diese Aktion ist nur für Admins erlaubt.");
  return caller;
}
