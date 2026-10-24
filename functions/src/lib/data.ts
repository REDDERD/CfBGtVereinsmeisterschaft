// functions/src/lib/data.ts
// Firestore-Dokumente → Domain-Objekte (Timestamps → Date) und Lesehilfen je Saison

import type {DocumentSnapshot, Transaction} from "firebase-admin/firestore";
import {COLLECTIONS} from "../config.js";
import type {Challenge, DoublesMatch, Player, SinglesMatch} from "../domain/types.js";
import {fail} from "./errors.js";
import {Timestamp} from "./firebase.js";
import {seasonCol} from "./season.js";
import {dayKey, startOfTodayLowerBound} from "./time.js";

function toDate(value: unknown): Date | null {
  return value instanceof Timestamp ? value.toDate() : null;
}

export function toPlayer(doc: DocumentSnapshot): Player {
  const data = doc.data() ?? {};
  return {
    id: doc.id,
    name: String(data.name ?? ""),
    singlesGroup: data.singlesGroup === 1 || data.singlesGroup === 2 ? data.singlesGroup : null,
    doublesPool: data.doublesPool === "A" || data.doublesPool === "B" ? data.doublesPool : null,
    doublesKnockoutEligible: data.doublesKnockoutEligible,
  };
}

export function toSinglesMatch(doc: DocumentSnapshot): SinglesMatch {
  const data = doc.data() ?? {};
  return {...data, id: doc.id, date: toDate(data.date)} as SinglesMatch;
}

export function toDoublesMatch(doc: DocumentSnapshot): DoublesMatch {
  const data = doc.data() ?? {};
  return {...data, id: doc.id, date: toDate(data.date)} as DoublesMatch;
}

export function toChallenge(doc: DocumentSnapshot): Challenge {
  const data = doc.data() ?? {};
  return {...data, id: doc.id, date: toDate(data.date)} as Challenge;
}

// ========== Spieler ==========

/** Lädt die angegebenen Spieler der Saison; Fehler, wenn einer fehlt. */
export async function loadPlayers(year: number, ids: string[]): Promise<Map<string, Player>> {
  const col = seasonCol(year, COLLECTIONS.players);
  const docs = await col.firestore.getAll(...ids.map((id) => col.doc(id)));
  const players = new Map<string, Player>();
  for (const doc of docs) {
    if (!doc.exists) fail("not-found", "Spieler nicht gefunden.");
    players.set(doc.id, toPlayer(doc));
  }
  return players;
}

export async function loadAllPlayers(year: number): Promise<Player[]> {
  const snapshot = await seasonCol(year, COLLECTIONS.players).get();
  return snapshot.docs.map(toPlayer);
}

/** Namensauflösung für Fehlermeldungen. */
export function nameLookup(players: Map<string, Player>): (id: string) => string {
  return (id) => players.get(id)?.name ?? "Gelöschter Spieler";
}

// ========== Spiele ==========

/** Alle Einzel zwischen zwei Spielern (beide Richtungen). */
export async function loadSinglesPairing(year: number, a: string, b: string): Promise<SinglesMatch[]> {
  const col = seasonCol(year, COLLECTIONS.singlesMatches);
  const [ab, ba] = await Promise.all([
    col.where("player1Id", "==", a).where("player2Id", "==", b).get(),
    col.where("player1Id", "==", b).where("player2Id", "==", a).get(),
  ]);
  return [...ab.docs, ...ba.docs].map(toSinglesMatch);
}

/** Heutige (Europe/Berlin), nicht abgelehnte Doppel – Grundlage für das Tageslimit. */
export async function loadTodaysDoublesMatches(tx: Transaction, year: number): Promise<DoublesMatch[]> {
  const today = dayKey();
  const snapshot = await tx.get(
    seasonCol(year, COLLECTIONS.doublesMatches)
      .where("date", ">=", Timestamp.fromDate(startOfTodayLowerBound())),
  );
  return snapshot.docs
    .map(toDoublesMatch)
    .filter((m) => m.status !== "rejected" && !m.round && m.date && dayKey(m.date) === today);
}
