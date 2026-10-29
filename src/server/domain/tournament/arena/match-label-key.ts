import type { Match } from '@/contracts/matches/dto';

export function normalizeMatchLabelKey(label: string): string {
  return label.trim().toLowerCase();
}

export type MatchLabelContext = {
  arenaIndex: number;
  divisionIdsOnArena: Array<string>;
  allMatches: Array<Match>;
  numbers: Map<string, number | null>;
  assignedBracketTitleKeys: Set<string>;
};
