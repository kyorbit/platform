# toggle-group

2026-10-13. Golden pair via CLI fetch, replay local `spacing=0` and rounding. Migrated. Drop `type="single"|"multiple"`. `value` is always an array. Items are `Toggle`.

## Changed

Parent review: typecheck and production build passed. The full suite passed with 72 suites and 428 tests before the additional rendered-link check, which also passed. The 17 focused checks and applicable table, navigation, overlay, and settings browser checks passed. Browser scripts and screenshots are kept outside the repository.

- `src/components/ui/toggle-group.tsx`: `@base-ui/react/toggle-group` + `Toggle` items. `data-pressed:bg-muted`. `spacing` default `0` kept.
- `src/features/dashboard/components/tournament/overview/tournaments-toolbar/view-mode-toggle.tsx:89-96`: dropped `type="single"`; `value={[value]}`; `onValueChange` reads `next[0]` (`'grid' | 'list'`). Empty array does **not** change the view (cannot unset).
- `src/contexts/feature-flags/provider.tsx`: dropped `type="single"`; `value={filterFlag ? [filterFlag] : []}`; empty array clears (`setFilterFlag(null)`). Parent review matched the selected value against the configured flags to remove an introduced unchecked cast. `ToggleGroupItem asChild` → `render={<TooltipTrigger />}` (Tooltip itself remains Radix, #288). `data-[state=on]` → `data-pressed`.

Leftover scan on `toggle-group.tsx`: no `radix-ui`, `@radix-ui`, or `IconPlaceholder`.

## Left alone

- Tooltip wrappers around flag items (#288).
- cmdk/vaul/sonner/calendar/chart/sortable.

## Behavior changes

Base ToggleGroup always uses array values. View-mode ignores deselect (empty array) so a view is always chosen, matching the old single-type "cannot fully unselect" feel. Feature-flags **does** treat empty as "no filter", matching the old nullable single value.

## Verify by hand

- Tournaments toolbar: Grid/List persists in URL/`localStorage`; clicking the active item does not clear the mode.
- Feature-flag strip: selecting a flag filters; clicking it again clears; tooltips still open; pressed styles match the old on-state.
