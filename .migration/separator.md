# separator

2026-10-13. Golden pair via CLI fetch, replay local `data-[orientation=…]` classes. Migrated.

## Changed

Parent review: typecheck and production build passed. The full suite passed with 72 suites and 428 tests before the additional rendered-link check, which also passed. The 17 focused checks and applicable table, navigation, overlay, and settings browser checks passed. Browser scripts and screenshots are kept outside the repository.

- `src/components/ui/separator.tsx`: `@base-ui/react/separator`. Dropped `decorative` (not on Base Separator). Default `orientation="horizontal"` kept.
- `src/components/ui/button-group.tsx`: `ButtonGroupSeparator` still composes this Separator; orientation default remains `vertical`.

Leftover scan on `separator.tsx`: no `radix-ui`, `@radix-ui`, or `IconPlaceholder`.

No production `decorative=` call sites existed. Other consumers (sidebar, site-header, slider filter, date filter, faceted filter, builder-footer, match-detail-panel, activity sheet, skeletons) pass `orientation`/`className` only.

## Left alone

- Full-width divider helper (`src/components/ui/full-width-divider.tsx`).
- DropdownMenuSeparator / SelectSeparator (#288).
- cmdk/vaul/sonner/calendar/chart/sortable.

## Behavior changes

`decorative` is gone. Call sites never passed it. Role/presentation follows Base Separator defaults.

## Verify by hand

- Site header vertical rule between sidebar trigger and breadcrumb.
- Builder footer, match detail, activity sheet, and table filter popovers still show the same dividers.
- Button group separators in the scoreboard timer and builder header still split adjacent controls.
