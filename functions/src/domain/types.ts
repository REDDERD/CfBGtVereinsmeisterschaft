// functions/src/domain/types.ts
// Fachliche Datentypen – unabhängig von Firestore (Datumswerte als Date)

export type MatchStatus = "confirmed" | "unconfirmed" | "rejected";
export type ValidationMode = "allow" | "warn" | "block" | "admin_only";
export type MatchType = "singles" | "doubles";
export type SinglesGroup = 1 | 2;
export type DoublesPool = "A" | "B";

export interface Player {
  id: string;
  name: string;
  singlesGroup: SinglesGroup | null;
  doublesPool: DoublesPool | null;
  /** Ohne gesetztes Feld gilt der Spieler als zugelassen. */
  doublesKnockoutEligible?: boolean;
}

/** Ein Satz als [Punkte Seite 1, Punkte Seite 2] – Seite = Spieler bzw. Team. */
export type SetScore = [number, number];

export interface SinglesSet {
  p1: number;
  p2: number;
}

export interface DoublesSet {
  t1: number;
  t2: number;
}

export interface SinglesMatch {
  id: string;
  player1Id: string;
  player2Id: string;
  sets: SinglesSet[];
  /** Fehlt bei alten Spielen – gilt dann als "confirmed". */
  status?: MatchStatus;
  /** group1/group2 für Gruppenspiele, quarter/semi/thirdPlace/final für K.O.-Spiele */
  round?: string;
  matchNum?: number;
  walkover?: boolean;
  date: Date | null;
}

export interface Team {
  player1Id: string;
  /** Bei kampflosen Spielen ggf. unbekannt. */
  player2Id: string | null;
}

export interface DoublesMatch {
  id: string;
  team1: Team;
  team2: Team;
  sets: DoublesSet[];
  status?: MatchStatus;
  /** Nur K.O.-Spiele haben eine Runde – Pyramiden-Spiele nicht. */
  round?: string;
  matchNum?: number;
  walkover?: boolean;
  /** Ergebnis wurde bereits auf die Pyramide angewendet (Idempotenz). */
  pyramidApplied?: boolean;
  date: Date | null;
}

export interface Challenge {
  id: string;
  challengerId: string;
  challengedId: string;
  status: "pending" | "completed";
  date: Date | null;
}

/** Pyramide als Ebenen von oben (Index 0 = Spitze) nach unten. */
export type PyramidLevels = string[][];

export interface MatchStatusSettings {
  singlesAdminDefault?: MatchStatus;
  singlesUserDefault?: MatchStatus;
  doublesAdminDefault?: MatchStatus;
  doublesUserDefault?: MatchStatus;
}

/** Hinweis, den der Nutzer bestätigen muss, bevor gespeichert wird. */
export interface Warning {
  code: string;
  title: string;
  message: string;
}
