import { createContext } from 'react';
import type { DivisionListItem } from '@/contracts/divisions/dto';
import type { Match } from '@/contracts/matches/dto';
import type { Dispatch, SetStateAction } from 'react';
import type { BracketsTabDndSnapshot } from '@/features/dashboard/hooks/use-brackets-tab-dnd';
import type { BracketsTabQueriesSnapshot } from '@/features/dashboard/hooks/use-brackets-tab-queries';

export type TournamentBracketContextValue = BracketsTabQueriesSnapshot &
  BracketsTabDndSnapshot & {
    tournamentId: string;
    divisions: Array<DivisionListItem>;
    readOnly: boolean;
    tournamentStatus: string;
    isDraft: boolean;
    selectedDivisionId: string | null;
    setSelectedDivisionId: Dispatch<SetStateAction<string | null>>;
    selectedMatch: Match | null;
    setSelectedMatch: Dispatch<SetStateAction<Match | null>>;
    panelOpen: boolean;
    setPanelOpen: Dispatch<SetStateAction<boolean>>;
    arenaOrderSheetOpen: boolean;
    setArenaOrderSheetOpen: Dispatch<SetStateAction<boolean>>;
    handleSlotClick: (match: Match) => void;
    matchDetail: Match | null;
    /** Pool drop target enabled (division has matches). */
    slotReturnEnabled: boolean;
    /** Hint under pool / empty states when athletes can be dragged back from bracket. */
    showArrangedHint: boolean;
  };

export const TournamentBracketContext = createContext<
  TournamentBracketContextValue | undefined
>(undefined);
