// functions/src/index.ts
// Einstiegspunkt: globale Optionen + Export aller deployten Functions.
// Konzept und Roadmap: functions/KONZEPT.md
//
// Die Functions werden mit flachen Namen exportiert, damit der Client sie direkt
// aufrufen kann: firebase.app().functions("europe-west3").httpsCallable("submitDoublesMatch")

import {setGlobalOptions} from "firebase-functions";
import {REGION} from "./config.js";

setGlobalOptions({region: REGION, maxInstances: 10});

// P1 – Spielbetrieb (umgesetzt)
export * from "./matches/index.js";
export * from "./challenges/index.js";
export * from "./pyramid/index.js";

// P2/P3 – Stubs (antworten mit "unimplemented")
export * from "./knockout/index.js";
export * from "./seasons/index.js";
