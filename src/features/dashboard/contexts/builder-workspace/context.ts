import { createContext } from 'react';
import type { DivisionListItem } from '@/contracts/divisions/dto';

export interface BuilderWorkspaceContextValue {
  tournamentId: string;
  divisions: Array<DivisionListItem>;
  readOnly: boolean;
  tournamentStatus: string;
}

export const BuilderWorkspaceContext = createContext<
  BuilderWorkspaceContextValue | undefined
>(undefined);
