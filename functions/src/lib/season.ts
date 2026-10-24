// functions/src/lib/season.ts
// Aktive Saison und saisonbezogene Referenzen
// Die Saison wird immer serverseitig ermittelt – Clients schreiben nie in archivierte Saisons.

import {COLLECTIONS, PYRAMID_DOC_ID, SETTINGS_DOCS} from "../config.js";
import {db} from "./firebase.js";

type SeasonCollection =
  | typeof COLLECTIONS.players
  | typeof COLLECTIONS.singlesMatches
  | typeof COLLECTIONS.doublesMatches
  | typeof COLLECTIONS.challenges
  | typeof COLLECTIONS.pyramid;

/** Wie im Client: ohne Einstellung gilt das aktuelle Jahr. */
export async function getActiveSeason(): Promise<number> {
  const doc = await db.collection(COLLECTIONS.settings).doc(SETTINGS_DOCS.activeSeason).get();
  const year = doc.get("year");
  return Number.isInteger(year) ? year : new Date().getFullYear();
}

export function seasonRef(year: number) {
  return db.collection(COLLECTIONS.seasons).doc(String(year));
}

export function seasonCol(year: number, name: SeasonCollection) {
  return seasonRef(year).collection(name);
}

export function pyramidRef(year: number) {
  return seasonCol(year, COLLECTIONS.pyramid).doc(PYRAMID_DOC_ID);
}

export function settingsRef(name: keyof typeof SETTINGS_DOCS) {
  return db.collection(COLLECTIONS.settings).doc(SETTINGS_DOCS[name]);
}
