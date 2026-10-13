# progress

2026-10-13. Golden pair via CLI fetch, replay local track/indicator colors. Migrated. Primitive computes fill; no `translateX`.

## Changed

Parent review: typecheck and production build passed. The full suite passed with 72 suites and 428 tests before the additional rendered-link check, which also passed. The 17 focused checks and applicable table, navigation, overlay, and settings browser checks passed. Browser scripts and screenshots are kept outside the repository.

- `src/components/ui/progress.tsx`: `@base-ui/react/progress` Root + Track + Indicator. Public API remains a single `Progress`. `className` is applied on **Track** so `className="h-2"` from setup-checklist still sizes the bar (Root is not the visual track).
- Consumer `src/features/dashboard/components/tournament/command-center/setup-checklist.tsx` still `<Progress className="h-2" value={…} />`. No call-site edit.

Leftover scan on `progress.tsx`: no `radix-ui`, `@radix-ui`, or `IconPlaceholder`.

## Left alone

- Overlay asChild (#288). cmdk/vaul/sonner/calendar/chart/sortable.

## Behavior changes

Fill is owned by the Indicator (no manual `transform: translateX`). Height via `className` still hits the visible bar because className is on Track, not Root. If a later caller styled Root expecting the old single-element wrapper, that would miss; current caller does not.

## Verify by hand

- Command-center setup checklist: progress bar height stays `h-2`, fill matches completed-step ratio, empty/full look correct.
