// functions/src/lib/input.ts
// Payload-Prüfung der Callable Functions – Client-Daten sind nie vertrauenswürdig

import type {SetScore} from "../domain/types.js";
import {fail} from "./errors.js";

export type Payload = Record<string, unknown>;

export function asPayload(data: unknown): Payload {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    fail("invalid-argument", "Ungültige Anfrage.");
  }
  return data as Payload;
}

export function requireId(data: Payload, key: string): string {
  const value = data[key];
  if (typeof value !== "string" || value.length === 0 || value.length > 200 || value.includes("/")) {
    fail("invalid-argument", `Feld "${key}" fehlt oder ist ungültig.`);
  }
  return value;
}

export function optionalId(data: Payload, key: string): string | null {
  return data[key] === undefined || data[key] === null || data[key] === "" ? null : requireId(data, key);
}

export function optionalBoolean(data: Payload, key: string): boolean {
  return data[key] === true;
}

export function requireEnum<T extends string>(data: Payload, key: string, values: readonly T[]): T {
  const value = data[key];
  if (!values.includes(value as T)) {
    fail("invalid-argument", `Feld "${key}" muss einer von ${values.join(", ")} sein.`);
  }
  return value as T;
}

export function requireObject(data: Payload, key: string): Payload {
  const value = data[key];
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail("invalid-argument", `Feld "${key}" fehlt oder ist ungültig.`);
  }
  return value as Payload;
}

/** "YYYY-MM-DD" → Datum (UTC-Mitternacht, wie bisher new Date(dateStr) im Client). */
export function requireDateString(data: Payload, key: string): {dayKey: string; date: Date} {
  const value = data[key];
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    fail("invalid-argument", `Feld "${key}" muss ein Datum (JJJJ-MM-TT) sein.`);
  }
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    fail("invalid-argument", `Feld "${key}" ist kein gültiges Datum.`);
  }
  return {dayKey: value, date};
}

function parseSets(data: Payload, side1: string, side2: string): SetScore[] {
  const sets = data.sets;
  if (!Array.isArray(sets) || sets.length < 2 || sets.length > 3) {
    fail("invalid-argument", "Bitte 2 oder 3 Sätze angeben.");
  }
  return sets.map((set, i): SetScore => {
    const a = (set as Payload | null)?.[side1];
    const b = (set as Payload | null)?.[side2];
    if (!Number.isInteger(a) || !Number.isInteger(b)) {
      fail("invalid-argument", `Satz ${i + 1} ist unvollständig.`);
    }
    return [a as number, b as number];
  });
}

/** Einzel-Sätze im Firestore-Format [{ p1, p2 }, ...] */
export function parseSinglesSets(data: Payload): SetScore[] {
  return parseSets(data, "p1", "p2");
}

/** Doppel-Sätze im Firestore-Format [{ t1, t2 }, ...] */
export function parseDoublesSets(data: Payload): SetScore[] {
  return parseSets(data, "t1", "t2");
}
