import { type } from '@orpc/contract';
import { SelectionCatalogSchema, SelectionMatchesSchema } from './dto';
import type { SelectionCatalogResult, SelectionMatchesResult } from './dto';
import { base } from '@/contracts/rpc/base';

export const advanceSettingsContract = {
  selectionCatalog: base
    .input(SelectionCatalogSchema)
    .output(type<SelectionCatalogResult>()),
  selectionMatches: base
    .input(SelectionMatchesSchema)
    .output(type<SelectionMatchesResult>()),
};
