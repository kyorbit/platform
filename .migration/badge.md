# badge

2026-10-13. Golden pair via CLI fetch, replay local variants (`warning`, `ghost`, `link`). Migrated. Slot via `useRender` + `mergeProps`.

## Changed

Parent review: typecheck and production build passed. The full suite passed with 72 suites and 428 tests before the additional rendered-link check, which also passed. The 17 focused checks and applicable table, navigation, overlay, and settings browser checks passed. Browser scripts and screenshots are kept outside the repository.

- `src/components/ui/badge.tsx`: `asChild`/`Slot` → `render`/`useRender`. Kept extra variants. `state.slot`/`state.variant` for data attributes.
- No production Badge `asChild` consumers. Display-only Badge sites unchanged: athlete columns, setup-checklist, status-pipeline, user-nav, roster columns, filter lists, faceted filter, auto-assign dialog, athlete pool, violation badge, faceted, action queue.

Leftover scan on `badge.tsx`: no `radix-ui`, `@radix-ui`, or `IconPlaceholder`.

## Left alone

- Overlay asChild still on #288 wrappers.
- cmdk/vaul/sonner/calendar/chart/sortable.

## Behavior changes

None. Interactive Badge-as-link was unused. Visual variants including `warning` are unchanged.

## Verify by hand

- Athlete table belt/status badges, division violation badge, setup-checklist step badges, status-pipeline chips: same colors and sizes.
- Faceted filter selected-count badge still appears next to the trigger.
