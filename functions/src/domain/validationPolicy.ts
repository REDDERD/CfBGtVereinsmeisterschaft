// functions/src/domain/validationPolicy.ts
// Auswertung der Admin-Validierungsmodi (allow | warn | block | admin_only)

import type {ValidationMode, Warning} from "./types.js";

export type PolicyOutcome =
  | {kind: "ok"}
  | {kind: "warn"; warning: Warning}
  | {kind: "block"; message: string};

/**
 * Entscheidet, wie mit einem Regelverstoß umgegangen wird:
 * - allow:      speichern
 * - warn:       Nutzer muss bestätigen
 * - block:      ablehnen
 * - admin_only: Admins müssen bestätigen, alle anderen werden abgelehnt
 */
export function applyValidationMode(
  mode: ValidationMode,
  isAdmin: boolean,
  violation: Warning | null,
  blockMessage: string,
): PolicyOutcome {
  if (!violation) return {kind: "ok"};

  switch (mode) {
  case "warn":
    return {kind: "warn", warning: violation};
  case "block":
    return {kind: "block", message: blockMessage};
  case "admin_only":
    return isAdmin ?
      {kind: "warn", warning: {...violation, title: `${violation.title} (Admin)`}} :
      {kind: "block", message: blockMessage};
  case "allow":
  default:
    return {kind: "ok"};
  }
}
