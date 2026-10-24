// functions/src/domain/matchStatus.ts
// Standard-Status neuer Spiele (Portierung von _getDefaultMatchStatus aus match-service.js)

import type {MatchStatus, MatchStatusSettings, MatchType} from "./types.js";

export function defaultMatchStatus(
  type: MatchType,
  isAdmin: boolean,
  settings: MatchStatusSettings | null,
): MatchStatus {
  if (!settings) return isAdmin ? "confirmed" : "unconfirmed";

  if (isAdmin) {
    return (type === "singles" ? settings.singlesAdminDefault : settings.doublesAdminDefault) ??
      "confirmed";
  }
  return (type === "singles" ? settings.singlesUserDefault : settings.doublesUserDefault) ??
    "unconfirmed";
}

/** Alte Spiele ohne Status gelten als bestätigt. */
export function effectiveStatus(status: MatchStatus | undefined): MatchStatus {
  return status ?? "confirmed";
}
