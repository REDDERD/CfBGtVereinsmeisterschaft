// functions/src/config.ts
// Zentrale Konstanten: Region, Collection-/Dokumentnamen, Spielregeln

/** Region der Functions – entspricht dem Firestore-Standort (europe-west3). */
export const REGION = "europe-west3";

/** Maßgebliche Zeitzone für "heute" (Tageslimit, Challenge-Datum). */
export const TIME_ZONE = "Europe/Berlin";

export const COLLECTIONS = {
  users: "users",
  seasons: "seasons",
  settings: "settings",
  players: "players",
  singlesMatches: "singlesMatches",
  doublesMatches: "doublesMatches",
  challenges: "challenges",
  pyramid: "pyramid",
} as const;

/** Die Pyramide einer Saison liegt in seasons/{year}/pyramid/current. */
export const PYRAMID_DOC_ID = "current";

export const SETTINGS_DOCS = {
  activeSeason: "activeSeason",
  defaultMatchStatus: "defaultMatchStatus",
  singlesValidation: "singlesValidation",
  doublesValidation: "doublesValidation",
  knockout: "knockout",
  knockoutConfig: "knockoutConfig",
  doublesKnockout: "doublesKnockout",
  doublesKnockoutConfig: "doublesKnockoutConfig",
} as const;

/** Hin- und Rückrunde: mehr Spiele pro Einzel-Paarung lösen die Validierung aus. */
export const MAX_SINGLES_PAIRING_MATCHES = 2;

/** Mindestanzahl Spieler in der Pyramide für die Doppel-K.O.-Phase. */
export const DOUBLES_KNOCKOUT_MIN_PLAYERS = 8;
