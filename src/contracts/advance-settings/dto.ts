import { z } from 'zod';
import type { TournamentStatus } from '@/contracts/tournaments/dto';

/** Advance Settings list rows shared by client, oRPC, and server. */
export type SelectionDivisionRow = {
  id: string;
  name: string;
  tournamentId: string;
  status: TournamentStatus;
  arenaIndex: number;
  arenaLabel: string;
};

export type MatchClaimStatus = 'none' | 'held_by_me' | 'held_by_other';

export type SelectionMatchRow = {
  id: string;
  label: string;
  divisionId: string;
  status: string;
  redAthleteName: string | null;
  blueAthleteName: string | null;
  redAthleteImage: string | null;
  blueAthleteImage: string | null;
  disabled: boolean;
  claimStatus: MatchClaimStatus;
};

/** Tournaments list + divisions for one tournament (key excludes `divisionId`). */
export const SelectionCatalogSchema = z.object({
  deviceId: z.string().min(1),
  tournamentId: z.string().nullish(),
});

export type SelectionCatalogDTO = z.infer<typeof SelectionCatalogSchema>;

/** Pending matches for one division (key includes `divisionId`). */
export const SelectionMatchesSchema = z.object({
  deviceId: z.string().min(1),
  tournamentId: z.string().min(1),
  divisionId: z.string().min(1),
});

export type SelectionMatchesDTO = z.infer<typeof SelectionMatchesSchema>;

export type SelectionCatalogResult = {
  tournaments: Array<{ id: string; name: string; status: string }>;
  divisions: Array<SelectionDivisionRow>;
};

export type SelectionMatchesResult = {
  matches: Array<SelectionMatchRow>;
};
