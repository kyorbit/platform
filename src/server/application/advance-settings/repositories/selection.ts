import type {
  SelectionCatalogResult,
  SelectionMatchesResult,
} from '@/contracts/rpc/advance-settings/dto';
import type {
  SelectionCatalogQuery,
  SelectionMatchesQuery,
} from '../use-cases/selection-commands';

export type AdvanceSelectionStore = {
  selectionCatalog: (
    query: SelectionCatalogQuery
  ) => Promise<SelectionCatalogResult>;
  selectionMatches: (
    query: SelectionMatchesQuery
  ) => Promise<SelectionMatchesResult>;
};
