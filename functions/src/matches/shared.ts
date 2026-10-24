// functions/src/matches/shared.ts
// Gemeinsame Regelprüfungen für Spiel-Eintragungen (Einzel, Doppel, kampflos)

import {MAX_SINGLES_PAIRING_MATCHES} from "../config.js";
import {findChallengeViolation, orderChallengerChallenged} from "../domain/challengeRules.js";
import {applyValidationMode} from "../domain/validationPolicy.js";
import type {DoublesMatch, Player, PyramidLevels, ValidationMode, Warning} from "../domain/types.js";
import {loadSinglesPairing} from "../lib/data.js";
import {collectOutcome} from "../lib/errors.js";

export const MATCH_TYPES = ["singles", "doubles"] as const;

/**
 * Einzel: Hinweis bei unterschiedlichen Gruppen, Paarungslimit (Hin- und Rückrunde)
 * gemäß singlesValidation.mode. Verstöße landen in warnings oder werfen (block).
 */
export async function checkSinglesRules(
  year: number,
  player1: Player,
  player2: Player,
  mode: ValidationMode,
  isAdmin: boolean,
  warnings: Warning[],
): Promise<void> {
  if (player1.singlesGroup !== player2.singlesGroup) {
    warnings.push({
      code: "GROUP_MISMATCH",
      title: "Spieler in unterschiedlichen Gruppen",
      message: `${player1.name} ist in Gruppe ${player1.singlesGroup ?? "–"} und ${player2.name} ist in ` +
        `Gruppe ${player2.singlesGroup ?? "–"}. Gruppenspiele sollten nur innerhalb derselben Gruppe ` +
        "stattfinden. Möchtest du das Spiel trotzdem eintragen?",
    });
  }

  const played = (await loadSinglesPairing(year, player1.id, player2.id))
    .filter((m) => m.status !== "rejected").length;

  const violation: Warning | null = played >= MAX_SINGLES_PAIRING_MATCHES ? {
    code: "PAIRING_LIMIT",
    title: "Paarung bereits 2x gespielt",
    message: `${player1.name} und ${player2.name} haben bereits ${played} Spiele gegeneinander ` +
      "absolviert. Da es nur Hin- und Rückrunde gibt, macht es wenig Sinn, mehr als 2 Spiele pro " +
      "Paarung einzutragen. Möchtest du das Spiel trotzdem eintragen?",
  } : null;

  collectOutcome(
    applyValidationMode(mode, isAdmin, violation, "Bereits Hin- und Rückrunde gespielt."),
    warnings,
  );
}

/** Jedes Doppel-Team braucht einen Spieler aus Pool A und einen aus Pool B. */
export function teamPoolViolation(player1: Player, player2: Player, teamName: string): string | null {
  if (!player1.doublesPool || !player2.doublesPool) {
    return `Beide Spieler in ${teamName} müssen einem Doppel-Pool zugeordnet sein.`;
  }
  if (player1.doublesPool === player2.doublesPool) {
    return `${teamName}: ${player1.name} und ${player2.name} sind beide in Pool ${player1.doublesPool}. ` +
      "Jedes Team muss einen Spieler aus Pool A und einen aus Pool B haben.";
  }
  return null;
}

/**
 * Doppel: Pyramiden-Regeln + Tageslimit gemäß doublesValidation.mode.
 * Der untere der beiden Spieler 1 gilt als Herausforderer. Ohne Pyramide oder
 * wenn ein Spieler nicht in der Pyramide steht, wird nicht geprüft (wie im Client).
 */
export function checkDoublesChallengeRules(
  playerA: string,
  playerB: string,
  levels: PyramidLevels,
  todaysMatches: DoublesMatch[],
  mode: ValidationMode,
  isAdmin: boolean,
  nameOf: (id: string) => string,
  warnings: Warning[],
): void {
  if (levels.length === 0) return;
  const roles = orderChallengerChallenged(playerA, playerB, levels);
  if (!roles) return;

  checkChallengeRules(roles.challengerId, roles.challengedId, levels, todaysMatches, mode, isAdmin, nameOf, warnings);
}

/** Herausforderung challengerId → challengedId gegen Pyramide + Tageslimit prüfen. */
export function checkChallengeRules(
  challengerId: string,
  challengedId: string,
  levels: PyramidLevels,
  todaysMatches: DoublesMatch[],
  mode: ValidationMode,
  isAdmin: boolean,
  nameOf: (id: string) => string,
  warnings: Warning[],
): void {
  const reason = findChallengeViolation(challengerId, challengedId, levels, todaysMatches, nameOf);
  const violation: Warning | null = reason ? {
    code: "CHALLENGE_RULES",
    title: "Regelverstoß möglich",
    message: `Die Herausforderung ${nameOf(challengerId)} vs ${nameOf(challengedId)} verstößt ` +
      `möglicherweise gegen die Herausforderungsregeln:\n\n${reason}\n\n` +
      "Möchtest du trotzdem eintragen?",
  } : null;

  collectOutcome(
    applyValidationMode(mode, isAdmin, violation, `Herausforderung nicht erlaubt: ${reason}`),
    warnings,
  );
}
