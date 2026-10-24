// functions/src/lib/time.ts
// Kalendertage in Europe/Berlin – Functions laufen in UTC

import {TIME_ZONE} from "../config.js";

const dayFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** "YYYY-MM-DD" des Kalendertags in Europe/Berlin. */
export function dayKey(date: Date = new Date()): string {
  return dayFormat.format(date);
}

/**
 * Untere Grenze für Abfragen "heute": Mitternacht UTC des Berliner Datums minus
 * 2 h (maximaler Berliner UTC-Offset). Exakt gefiltert wird danach per dayKey.
 */
export function startOfTodayLowerBound(now: Date = new Date()): Date {
  const [y, m, d] = dayKey(now).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d) - 2 * 60 * 60 * 1000);
}
