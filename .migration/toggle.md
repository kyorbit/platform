# toggle

2026-10-13. Golden pair via CLI fetch, replay local variants. Migrated.

## Changed

Parent review: typecheck and production build passed. The full suite passed with 72 suites and 428 tests before the additional rendered-link check, which also passed. The 17 focused checks and applicable table, navigation, overlay, and settings browser checks passed. Browser scripts and screenshots are kept outside the repository.

- `src/components/ui/toggle.tsx`: callable `@base-ui/react/toggle`. Kept local `toggleVariants`. Pressed styles use `aria-pressed` / `data-pressed` (golden mapping).
- No standalone production import of `@/components/ui/toggle`. `toggle-group.tsx` imports `toggleVariants` only.

Leftover scan on `toggle.tsx`: no `radix-ui`, `@radix-ui`, or `IconPlaceholder`.

## Left alone

- Theme toggle (`src/components/ui/theme-toggle.tsx`) is not this primitive.
- ToggleGroup consumers (see `toggle-group.md`).
- Overlay asChild (#288). cmdk/vaul/sonner/calendar/chart/sortable.

## Behavior changes

None in product (no direct Toggle usage). `data-[state=on]` is not the pressed selector anymore; group items were updated in `toggle-group` consumers.

## Verify by hand

Covered by toggle-group: tournaments view-mode and feature-flag filters.
