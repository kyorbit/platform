# label

2026-10-13. Golden pair via CLI fetch, replay local classes. Migrated. Native `<label>` (no Base/Radix primitive).

## Changed

Parent review: typecheck and production build passed. The full suite passed with 72 suites and 428 tests before the additional rendered-link check, which also passed. The 17 focused checks and applicable table, navigation, overlay, and settings browser checks passed. Browser scripts and screenshots are kept outside the repository.

- `src/components/ui/label.tsx`: dropped `@radix-ui/react-label`. Same class string. Props are `React.ComponentProps<'label'>`.
- `src/features/app/components/settings/tabs/standard-settings.tsx:102`: Label is the Button `render` target (`nativeButton={false}`) for the avatar file-picker. `htmlFor`/click-to-focus still applies because the rendered element is a label.

Leftover scan on `label.tsx`: no `radix-ui`, `@radix-ui`, or `IconPlaceholder`.

Production Label consumers that did not need call-site edits: slider filter, bulk-add dialog, add-athletes sheet, arena editor, create-custom-match, bracket action queue, and other `htmlFor` pairings.

## Left alone

- `FieldLabel` in `src/components/ui/field.tsx` (not this wrapper).
- Overlay/dialog labels owned by #288.
- cmdk/vaul/sonner/calendar/chart/sortable.

## Behavior changes

None. Native `<label>` association (`htmlFor`, wrapping control) is the same as Radix Label.

## Verify by hand

- Click "Auto-assign" / "Select all shown" labels in add-athletes and bulk-add: checkbox toggles.
- Settings avatar "Choose Avatar" control still opens the file picker and does not submit a form.
- Slider filter min/max labels still associate with the number inputs.
