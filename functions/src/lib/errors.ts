// functions/src/lib/errors.ts
// Einheitliche Fehler und Antworten der Callable Functions
//
// Bestätigungs-Flow: Liegen Hinweise vor und hat der Client sie noch nicht
// bestätigt (acknowledgeWarnings), wird nichts gespeichert und
// { status: "needs-confirmation", warnings } zurückgegeben. Der Client zeigt
// die Hinweise (Modal.warn) und ruft die Function mit acknowledgeWarnings: true erneut auf.

import {HttpsError, type FunctionsErrorCode} from "firebase-functions/https";
import type {PolicyOutcome} from "../domain/validationPolicy.js";
import type {Warning} from "../domain/types.js";

export function fail(code: FunctionsErrorCode, message: string): never {
  throw new HttpsError(code, message);
}

/** Platzhalter für Functions, deren Logik noch im Client liegt (Roadmap P2/P3). */
export function notImplemented(functionName: string): never {
  fail("unimplemented", `${functionName} ist noch nicht serverseitig umgesetzt.`);
}

export interface NeedsConfirmation {
  status: "needs-confirmation";
  warnings: Warning[];
}

export type Ok<T extends object = object> = {status: "ok"} & T;

export function ok<T extends object>(data: T): Ok<T> {
  return {status: "ok", ...data};
}

/** Rückgabe für den Bestätigungs-Flow, oder null wenn gespeichert werden darf. */
export function needsConfirmation(warnings: Warning[], acknowledged: boolean): NeedsConfirmation | null {
  if (warnings.length === 0 || acknowledged) return null;
  return {status: "needs-confirmation", warnings};
}

/** Übernimmt das Ergebnis eines Validierungsmodus: block → Fehler, warn → Hinweis. */
export function collectOutcome(outcome: PolicyOutcome, warnings: Warning[]): void {
  if (outcome.kind === "block") fail("failed-precondition", outcome.message);
  if (outcome.kind === "warn") warnings.push(outcome.warning);
}
