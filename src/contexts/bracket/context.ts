import { createContext } from 'react';
import type { Match } from '@/contracts/matches/dto';
import type { TournamentAthlete } from '@/contracts/tournament-athletes/dto';

export interface BracketContextValue {
  matches: Array<Match>;
  athleteMap: Map<string, TournamentAthlete>;
  matchLabel: ReadonlyMap<string, number | null>;
  readOnly: boolean;
  thirdPlaceId: string | undefined;
  onSlotClick: (match: Match) => void;
  onToggleLock: (
    matchId: string,
    side: 'red' | 'blue',
    locked: boolean
  ) => void;
}

export const BracketContext = createContext<BracketContextValue | null>(null);
