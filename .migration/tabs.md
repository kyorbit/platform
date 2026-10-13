# tabs

2026-10-13. Golden pair via CLI fetch, replay local list variants (`default`/`line`), `after:-bottom-1.25` underline, orientation classes. Migrated. `TabsTrigger` → `Tabs.Tab`; `TabsContent` → `Tabs.Panel`. Public names `TabsTrigger`/`TabsContent` kept.

## Changed

Parent review: typecheck and production build passed. The full suite passed with 72 suites and 428 tests before the additional rendered-link check, which also passed. The 17 focused checks and applicable table, navigation, overlay, and settings browser checks passed. Browser scripts and screenshots are kept outside the repository.

- `src/components/ui/tabs.tsx`: `@base-ui/react/tabs`. Trigger `asChild` dropped (no Trigger asChild consumers). `forceMount` → `keepMounted` on Panel; not set, so default `false` (same as Radix without `forceMount`).
- Installed `@base-ui/react@1.5.0` `TabsList.activateOnFocus` default is **`false`** (manual: arrows move focus, Enter/Space activate). Radix Tabs defaulted to automatic activation on arrow focus. **Not patched** (`activateOnFocus` not added). List still forwards the prop if a caller sets it.
- Production consumers, no further API edits:
  - `src/features/dashboard/components/tournament/builder/builder-shell/builder-header.tsx` (controlled Divisions/Brackets)
  - `src/features/dashboard/components/tournament/builder/brackets-tab/bracket-layout-toggle.tsx`
  - `src/features/dashboard/components/tournament/builder/brackets-tab/divisions-panel/divisions-tabs-header.tsx` (`TabsTrigger` ref still registers for scroll-into-view; `onValueChange` first arg still the tab value)
- Parent-owned `src/components/data-table/__tests__/controls.test.tsx` also imports Tabs. Not edited.

Leftover scan on `tabs.tsx`: no `radix-ui`, `@radix-ui`, or `IconPlaceholder`.

## Left alone

- Custom `animated-tabs` (own report). It imports `@base-ui/react/tabs` directly, not this wrapper.
- Overlay asChild (#288), including Tooltip around bracket-layout `TabsTrigger`.
- cmdk/vaul/sonner/calendar/chart/sortable.

## Behavior changes

**FLAG:** keyboard activation is manual (`activateOnFocus` default false). Click/tap still selects. Arrow keys focus the next tab but do not change `value` until Enter/Space. Builder header, bracket layout toggle, and division tabs are click-driven in product; arrow-key auto-switch is the delta vs Radix.

`keepMounted` default false: inactive panels unmount, matching Radix without `forceMount`. `onValueChange` now also receives event details; existing one-arg callbacks still work.

## Verify by hand

- Builder header: click Divisions/Brackets switches the builder tab and URL.
- Bracket layout toggle: click two-sided/one-sided; tooltip still works.
- Divisions panel tabs: click a division, overflow list scrolls the active tab, "all divisions" menu still selects.
- Keyboard: Tab to the list, arrows move focus without changing the selected tab until Enter/Space.
