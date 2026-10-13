# slider

2026-10-13. Golden pair via CLI fetch, replay local track/thumb classes. Migrated. Anatomy: Control + Track + Indicator + Thumb. `thumbAlignment="edge"`.

## Changed

Parent review: typecheck and production build passed. The full suite passed with 72 suites and 428 tests before the additional rendered-link check, which also passed. The 17 focused checks and applicable table, navigation, overlay, and settings browser checks passed. Browser scripts and screenshots are kept outside the repository.

- `src/components/ui/slider.tsx`: `@base-ui/react/slider`. Value may be scalar or array; thumbs keyed from `_values`. Commit callback on the primitive is `onValueCommitted` (not Radix `onValueCommit`).
- `src/components/data-table/data-table-slider-filter.tsx:149-154,273-279`: still live `onValueChange` (the product updates the filter while dragging). Handler accepts `number | readonly number[]` and writes when it is a length-2 array.

Leftover scan on `slider.tsx`: no `radix-ui`, `@radix-ui`, or `IconPlaceholder`.

## Left alone

- Number inputs beside the slider (same filter popover).
- Parent-owned data-table tests. Overlay asChild on the filter `PopoverTrigger` (#288).
- cmdk/vaul/sonner/calendar/chart/sortable.

## Behavior changes

None in the consumer: it never used `onValueCommit`. Wrapper exposes Base `onValueCommitted` if a later caller needs pointer-up. `thumbAlignment="edge"` matches the Vega base golden so thumbs sit inside the track at min/max.

`onValueChange` value type is generic (`number` or `readonly number[]`). The filter only applies array pairs.

## Verify by hand

- Open a numeric range filter on the athletes/tournaments table.
- Drag either thumb: filter updates live; from/to inputs stay in sync.
- Type in from/to: slider thumbs follow.
- Clear still resets the range.
