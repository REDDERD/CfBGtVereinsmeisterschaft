// functions/src/lib/settings.ts
// Globale Einstellungen aus settings/* in einem Lesevorgang

import type {MatchStatusSettings, ValidationMode} from "../domain/types.js";
import {db} from "./firebase.js";
import {settingsRef} from "./season.js";

export interface AppSettings {
  /** null, wenn settings/defaultMatchStatus fehlt. */
  matchStatus: MatchStatusSettings | null;
  singlesValidationMode: ValidationMode;
  doublesValidationMode: ValidationMode;
  knockoutActive: boolean;
  doublesKnockoutActive: boolean;
}

const VALIDATION_MODES: readonly ValidationMode[] = ["allow", "warn", "block", "admin_only"];

function toMode(value: unknown): ValidationMode {
  return VALIDATION_MODES.includes(value as ValidationMode) ? value as ValidationMode : "allow";
}

export async function loadSettings(): Promise<AppSettings> {
  const [matchStatus, singlesValidation, doublesValidation, knockout, doublesKnockout] =
    await db.getAll(
      settingsRef("defaultMatchStatus"),
      settingsRef("singlesValidation"),
      settingsRef("doublesValidation"),
      settingsRef("knockout"),
      settingsRef("doublesKnockout"),
    );

  return {
    matchStatus: matchStatus.exists ? matchStatus.data() as MatchStatusSettings : null,
    singlesValidationMode: toMode(singlesValidation.get("mode")),
    doublesValidationMode: toMode(doublesValidation.get("mode")),
    knockoutActive: knockout.get("active") === true,
    doublesKnockoutActive: doublesKnockout.get("active") === true,
  };
}
