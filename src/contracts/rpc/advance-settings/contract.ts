import { type } from '@orpc/contract';
import { SelectionCatalogSchema, SelectionMatchesSchema } from './dto';
import type { SelectionCatalogResult, SelectionMatchesResult } from './dto';
import { access, base } from '@/contracts/rpc/base';

export const advanceSettingsContract = {
  selectionCatalog: base
    .meta(access('member'))
    .input(SelectionCatalogSchema)
    .output(type<SelectionCatalogResult>()),
  selectionMatches: base
    .meta(access('member'))
    .input(SelectionMatchesSchema)
    .output(type<SelectionMatchesResult>()),
};
