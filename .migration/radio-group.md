# radio-group

2026-10-13. Golden pair via CLI fetch, replay local classes. Migrated. Anatomy is `RadioGroup` + `Radio.Root`/`Radio.Indicator`.

## Changed

Parent review: this wrapper has no production consumers. Installed API shapes, typecheck, and production build passed; its manual checklist remains unexecuted.

- `src/components/ui/radio-group.tsx`: `@base-ui/react/radio-group` + `@base-ui/react/radio`. Item is `RadioPrimitive.Root` with nested Indicator.

Leftover scan on `radio-group.tsx`: no `radix-ui`, `@radix-ui`, or `IconPlaceholder`.

No production imports of `@/components/ui/radio-group`. `DropdownMenuRadioGroup` in divisions-tabs-header and similar is the #288 dropdown primitive, not this wrapper.

## Left alone

- `DropdownMenuRadioGroup` / `DropdownMenuRadioItem` (#288).
- cmdk/vaul/sonner/calendar/chart/sortable.

## Behavior changes

None observable in product (no consumers). Item `data-checked` classes replace `data-[state=checked]`.

## Verify by hand

No in-app surface. If a later ticket uses `RadioGroup`/`RadioGroupItem`, confirm exclusive selection, keyboard arrows, and disabled items.
