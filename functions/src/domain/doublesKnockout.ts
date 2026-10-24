// functions/src/domain/doublesKnockout.ts
// Doppel-K.O.-Bracket, Setzliste und Auslosungsregeln
// (Portierung der reinen Logik aus js/services/doubles-knockout-service.js;
// statt des globalen state wird ein DoublesKnockoutContext übergeben)
//
// Die Top 8 der Pyramide spielen nach fester Setzliste:
//   VF A: 1 vs 8, VF B: 2 vs 7, VF C: 3 vs 6, VF D: 4 vs 5
//   HF 1: Gew. A vs Gew. D, HF 2: Gew. B vs Gew. C
//   Finale: Gew. HF 1 vs Gew. HF 2, Spiel um Platz 3: Verl. HF 1 vs Verl. HF 2
// Zu jedem gesetzten Spieler wird je Spiel ein Partner zugelost.

import type {DoublesMatch, Player, Team} from "./types.js";

export type DoublesKnockoutRound = "quarter" | "semi" | "thirdPlace" | "final";
export type TeamSlot = "t1" | "t2";

export const DOUBLES_KNOCKOUT_ROUNDS: readonly DoublesKnockoutRound[] =
  ["quarter", "semi", "thirdPlace", "final"];

export const DOUBLES_KNOCKOUT_ROUND_NAMES: Record<DoublesKnockoutRound, string> = {
  quarter: "Viertelfinale",
  semi: "Halbfinale",
  thirdPlace: "Spiel um Platz 3",
  final: "Finale",
};

/** Spiele, die parallel stattfinden – ein Partner wird je Gruppe nur einmal gezogen. */
const STAGES: Record<DoublesKnockoutRound, Array<[DoublesKnockoutRound, number]>> = {
  quarter: [["quarter", 1], ["quarter", 2], ["quarter", 3], ["quarter", 4]],
  semi: [["semi", 1], ["semi", 2]],
  final: [["final", 1], ["thirdPlace", 1]],
  thirdPlace: [["final", 1], ["thirdPlace", 1]],
};

/** Viertelfinale → Pyramiden-Plätze */
const QUARTER_SEEDS: Record<number, [number, number]> = {1: [1, 8], 2: [2, 7], 3: [3, 6], 4: [4, 5]};
const QUARTER_LETTERS: Record<number, string> = {1: "A", 2: "B", 3: "C", 4: "D"};
/** Halbfinale → Viertelfinals, deren Gewinner aufeinandertreffen */
const SEMI_QUARTERS: Record<number, [number, number]> = {1: [1, 4], 2: [2, 3]};

export interface DrawRules {
  /** Partner muss aus dem anderen Pool kommen. */
  poolRule: boolean;
  /** Spieler der K.O.-Phase sind erst nach ihrem Ausscheiden auslosbar. */
  blockActivePlayers: boolean;
}

export type Draws = Record<string, Partial<Record<TeamSlot, string>>>;

export interface DoublesKnockoutContext {
  /** Eingefrorene (oder aktuelle) Pyramiden-Rangliste, Platz 1 zuerst. */
  ranking: string[];
  /** Nur K.O.-Spiele (mit round). */
  matches: DoublesMatch[];
  draws: Draws;
  rules: DrawRules;
  players: Player[];
}

export interface BracketTeams {
  team1: Team | null;
  team2: Team | null;
  team1Fallback: string;
  team2Fallback: string;
}

export function drawRulesFromConfig(config: {drawPoolRule?: boolean; drawBlockActivePlayers?: boolean}): DrawRules {
  return {
    poolRule: config.drawPoolRule !== false,
    blockActivePlayers: config.drawBlockActivePlayers !== false,
  };
}

export function isPlayerDoublesKnockoutEligible(player: Player | undefined): boolean {
  return player?.doublesKnockoutEligible !== false;
}

export function getMatchLabel(round: DoublesKnockoutRound, matchNum: number): string {
  if (round === "quarter") return `Viertelfinale ${QUARTER_LETTERS[matchNum]}`;
  if (round === "semi") return `Halbfinale ${matchNum}`;
  return DOUBLES_KNOCKOUT_ROUND_NAMES[round];
}

export function drawKey(round: DoublesKnockoutRound, matchNum: number): string {
  return `${round}_${matchNum}`;
}

function nameOf(ctx: DoublesKnockoutContext, playerId: string): string {
  return ctx.players.find((p) => p.id === playerId)?.name ?? "Gelöschter Spieler";
}

function getSeedPlayerId(ctx: DoublesKnockoutContext, place: number): string | null {
  return ctx.ranking[place - 1] ?? null;
}

export function getDrawnPartner(
  ctx: DoublesKnockoutContext,
  round: DoublesKnockoutRound,
  matchNum: number,
  slot: TeamSlot,
): string | null {
  return ctx.draws[drawKey(round, matchNum)]?.[slot] ?? null;
}

function buildTeam(
  ctx: DoublesKnockoutContext,
  player1Id: string | null | undefined,
  round: DoublesKnockoutRound,
  matchNum: number,
  slot: TeamSlot,
): Team | null {
  if (!player1Id) return null;
  return {player1Id, player2Id: getDrawnPartner(ctx, round, matchNum, slot)};
}

// ========== Spiele & Bracket ==========

export function getMatch(
  ctx: DoublesKnockoutContext,
  round: DoublesKnockoutRound,
  matchNum: number,
): DoublesMatch | undefined {
  return ctx.matches.find((m) => m.round === round && m.matchNum === matchNum);
}

function team1Won(match: DoublesMatch): boolean {
  let t1 = 0;
  let t2 = 0;
  for (const set of match.sets ?? []) {
    if (set.t1 > set.t2) t1++;
    else t2++;
  }
  return t1 > t2;
}

export function getWinnerTeam(ctx: DoublesKnockoutContext, round: DoublesKnockoutRound, matchNum: number): Team | null {
  const match = getMatch(ctx, round, matchNum);
  if (!match?.sets) return null;
  return team1Won(match) ? match.team1 : match.team2;
}

export function getLoserTeam(ctx: DoublesKnockoutContext, round: DoublesKnockoutRound, matchNum: number): Team | null {
  const match = getMatch(ctx, round, matchNum);
  if (!match?.sets) return null;
  return team1Won(match) ? match.team2 : match.team1;
}

/**
 * Die beiden Teams eines Bracket-Spiels. team1/team2 sind null, solange der
 * gesetzte Spieler noch nicht feststeht; player2Id ist der ausgeloste Partner.
 */
export function getTeams(ctx: DoublesKnockoutContext, round: DoublesKnockoutRound, matchNum: number): BracketTeams {
  if (round === "quarter") {
    const [place1, place2] = QUARTER_SEEDS[matchNum] ?? [0, 0];
    return {
      team1: buildTeam(ctx, getSeedPlayerId(ctx, place1), round, matchNum, "t1"),
      team2: buildTeam(ctx, getSeedPlayerId(ctx, place2), round, matchNum, "t2"),
      team1Fallback: `Rang ${place1}`,
      team2Fallback: `Rang ${place2}`,
    };
  }

  if (round === "semi" || round === "final") {
    const [prev1, prev2] = round === "semi" ? SEMI_QUARTERS[matchNum] ?? [0, 0] : [1, 2];
    const prevRound: DoublesKnockoutRound = round === "semi" ? "quarter" : "semi";
    return {
      team1: buildTeam(ctx, getWinnerTeam(ctx, prevRound, prev1)?.player1Id, round, matchNum, "t1"),
      team2: buildTeam(ctx, getWinnerTeam(ctx, prevRound, prev2)?.player1Id, round, matchNum, "t2"),
      team1Fallback: `Gewinner ${getMatchLabel(prevRound, prev1)}`,
      team2Fallback: `Gewinner ${getMatchLabel(prevRound, prev2)}`,
    };
  }

  return {
    team1: buildTeam(ctx, getLoserTeam(ctx, "semi", 1)?.player1Id, round, matchNum, "t1"),
    team2: buildTeam(ctx, getLoserTeam(ctx, "semi", 2)?.player1Id, round, matchNum, "t2"),
    team1Fallback: `Verlierer ${getMatchLabel("semi", 1)}`,
    team2Fallback: `Verlierer ${getMatchLabel("semi", 2)}`,
  };
}

// ========== Auslosung ==========

/**
 * Spieler der Top 8, die noch nicht ausgeschieden sind. Ausgeschieden:
 * Verlierer eines Viertelfinals sowie beide Spieler 1 eines gespielten
 * Finales bzw. Spiels um Platz 3. Halbfinal-Verlierer bleiben aktiv.
 */
export function getActivePlayerIds(ctx: DoublesKnockoutContext): string[] {
  const eliminated = new Set<string>();
  for (const m of ctx.matches) {
    if (!m.sets) continue;
    if (m.round === "quarter" && m.matchNum !== undefined) {
      const loser = getLoserTeam(ctx, "quarter", m.matchNum)?.player1Id;
      if (loser) eliminated.add(loser);
    }
    if (m.round === "final" || m.round === "thirdPlace") {
      if (m.team1?.player1Id) eliminated.add(m.team1.player1Id);
      if (m.team2?.player1Id) eliminated.add(m.team2.player1Id);
    }
  }
  return ctx.ranking.slice(0, 8).filter((id) => !eliminated.has(id));
}

/**
 * Darf partnerId Partner von seedId sein? Rückgabe: Begründung bei Verstoß, sonst null.
 * Die Zulassung aus den Spieler-Stammdaten gilt immer (nicht abschaltbar).
 */
export function getPartnerViolation(
  ctx: DoublesKnockoutContext,
  seedId: string | null,
  partnerId: string | null,
): string | null {
  if (!seedId || !partnerId) return null;
  const seed = ctx.players.find((p) => p.id === seedId);
  const partner = ctx.players.find((p) => p.id === partnerId);

  if (partner && !isPlayerDoublesKnockoutEligible(partner)) {
    return `${partner.name} ist für die Finalrunde nicht zugelassen (Spieler-Stammdaten).`;
  }

  if (ctx.rules.poolRule && seed?.doublesPool && partner?.doublesPool === seed.doublesPool) {
    return `${partner.name} ist wie ${seed.name} in Pool ${seed.doublesPool}. ` +
      "Jedes Team muss einen Spieler aus Pool A und einen aus Pool B haben.";
  }

  if (ctx.rules.blockActivePlayers && getActivePlayerIds(ctx).includes(partnerId)) {
    return `${nameOf(ctx, partnerId)} ist noch in der K.O.-Phase und darf erst nach dem ` +
      "Ausscheiden als Partner zugelost werden.";
  }

  return null;
}

/**
 * Partner, die in den anderen Spielen derselben Runde bereits gespielt haben
 * oder zugeordnet wurden. Finale und Spiel um Platz 3 zählen als eine Runde.
 */
function getRoundPartnerIds(ctx: DoublesKnockoutContext, round: DoublesKnockoutRound, matchNum: number): string[] {
  const ids: Array<string | null | undefined> = [];
  for (const [r, n] of STAGES[round]) {
    if (r === round && n === matchNum) continue;
    const match = getMatch(ctx, r, n);
    if (match?.sets) {
      ids.push(match.team1?.player2Id, match.team2?.player2Id);
    } else {
      ids.push(getDrawnPartner(ctx, r, n, "t1"), getDrawnPartner(ctx, r, n, "t2"));
    }
  }
  return ids.filter((id): id is string => !!id);
}

/**
 * Mögliche Partner für den gesetzten Spieler in (round, matchNum, slot):
 * Doppel-Spieler außer den beiden gesetzten, regelkonform, nicht der Partner des
 * anderen Teams; bei der Auslosung (forDraw) zusätzlich ohne Partner aus anderen
 * Spielen derselben Runde.
 */
export function getPartnerCandidates(
  ctx: DoublesKnockoutContext,
  round: DoublesKnockoutRound,
  matchNum: number,
  slot: TeamSlot,
  {forDraw = false}: {forDraw?: boolean} = {},
): Player[] {
  const {team1, team2} = getTeams(ctx, round, matchNum);
  const seedId = (slot === "t1" ? team1 : team2)?.player1Id ?? null;
  const seeds = [team1?.player1Id, team2?.player1Id].filter(Boolean);
  const excluded = [
    getDrawnPartner(ctx, round, matchNum, slot === "t1" ? "t2" : "t1"),
    ...(forDraw ? getRoundPartnerIds(ctx, round, matchNum) : []),
  ].filter(Boolean);

  return ctx.players.filter((p) =>
    p.doublesPool &&
    !seeds.includes(p.id) &&
    !excluded.includes(p.id) &&
    !getPartnerViolation(ctx, seedId, p.id),
  );
}
