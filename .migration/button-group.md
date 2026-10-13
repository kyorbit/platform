# button-group

2026-10-13. Golden pair via CLI fetch, replay **local** orientation rounding (not the base-vega rounding rewrite). Migrated. `ButtonGroupText` uses `useRender` + `mergeProps`.

## Changed

Parent review: typecheck and production build passed. The full suite passed with 72 suites and 428 tests before the additional rendered-link check, which also passed. The 17 focused checks and applicable table, navigation, overlay, and settings browser checks passed. Browser scripts and screenshots are kept outside the repository.

- `src/components/ui/button-group.tsx`: Text `asChild` → `render`. Separator still wraps migrated Separator. Kept local `[&>*:not(:first-child)]:rounded-l-none` treatment.
- Consumers with no API change: `src/features/dashboard/components/tournament/builder/builder-shell/builder-header.tsx` (`ButtonGroupSeparator` between tabs), `src/features/app/components/scoreboard/timer/clock-section.tsx`, `src/components/input/number-input.tsx`.

Leftover scan on `button-group.tsx`: no `radix-ui`, `@radix-ui`, or `IconPlaceholder`.

## Left alone

- Number-input internals beyond composing ButtonGroup.
- Overlay asChild (#288).
- cmdk/vaul/sonner/calendar/chart/sortable.

## Behavior changes

None. Local rounding between grouped buttons is intentionally not the stock base-vega rounding.

## Verify by hand

- Scoreboard timer grouped buttons: shared border, no double-radius in the middle.
- Builder header Divisions/Brackets split by `ButtonGroupSeparator`.
- Number input stepper group in slider filters.
