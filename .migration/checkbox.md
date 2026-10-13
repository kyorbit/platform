# checkbox

2026-10-13. Golden pair via CLI fetch, replay local classes and Tabler `IconCheck`. Migrated. `checked` is boolean; indeterminate is a separate prop.

## Changed

Parent review: typecheck and production build passed. The full suite passed with 72 suites and 428 tests before the additional rendered-link check, which also passed. The 17 focused checks and applicable table, navigation, overlay, and settings browser checks passed. Browser scripts and screenshots are kept outside the repository.

- `src/components/ui/checkbox.tsx`: `@base-ui/react/checkbox`. Root.Props (`checked?: boolean`, `indeterminate?: boolean`). Indicator shows `IconCheck` only (same as local origin; no extra dash icon).
- `src/features/dashboard/components/athlete/athlete-table/athletes-table-columns.tsx:27-32`: header `checked={all}` + `indeterminate={some && !all}` instead of `checked={all || (some && 'indeterminate')}`.
- Parent updated `src/components/data-table/__tests__/table-fixture.tsx` to the same checked/indeterminate contract. Selection, mixed state, page selection, and stable-ID action-scope checks pass.
- Other production checkboxes already passed boolean `checked` (faceted filter, bulk-add auto-assign, activity sheet, form-checkbox `e === true`, add-athletes select-all/auto-assign, profile rows, match slot locks). No further edits.

Leftover scan on `checkbox.tsx`: no `radix-ui`, `@radix-ui`, or `IconPlaceholder`.

## Left alone

- Parent-owned test expectations stayed intact; the fixture's prop contract was updated by the parent after review.
- Overlay asChild (#288). cmdk/vaul/sonner/calendar/chart/sortable.

## Behavior changes

Mixed header selection now uses `indeterminate` rather than the `'indeterminate'` checked union. Visual mixed state still comes from the primitive. `onCheckedChange` now receives `boolean` only (form-checkbox already narrowed with `e === true`).

## Verify by hand

- Athletes table: select some rows → header mixed; select all on page → checked; none → empty.
- Add-athletes sheet select-all and auto-assign.
- Bulk-add auto-assign, activity event-type checks, match lock checkboxes.
- Faceted filter option checks.
