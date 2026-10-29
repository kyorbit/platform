import { activityContract } from './activity/contract';
import { advanceSettingsContract } from './advance-settings/contract';
import { arenaMatchClaimContract } from './arena-match-claim/contract';
import { athleteProfileContract } from './athlete-profiles/contract';
import { deviceLastSelectionContract } from './device-last-selection/contract';
import { divisionContract } from './divisions/contract';
import { bracketContract, matchContract } from './matches/contract';
import { tournamentAthleteContract } from './tournament-athletes/contract';
import { tournamentContract } from './tournaments/contract';
import type {
  InferRouterContractInputs,
  RouterContractClient,
} from '@orpc/contract';

/** Client ↔ server interface. `src/orpc` implements it; clients type off it. */
export const contract = {
  tournament: tournamentContract,
  division: divisionContract,
  match: matchContract,
  bracket: bracketContract,
  athleteProfile: athleteProfileContract,
  tournamentAthlete: tournamentAthleteContract,
  activity: activityContract,
  advanceSettings: advanceSettingsContract,
  arenaMatchClaim: arenaMatchClaimContract,
  device: {
    lastSelection: deviceLastSelectionContract,
  },
};

export type ContractClient = RouterContractClient<typeof contract>;
export type ContractInputs = InferRouterContractInputs<typeof contract>;
