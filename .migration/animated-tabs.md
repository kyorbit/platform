# animated-tabs

2026-10-13. Transformation engine (no stock golden pair). Migrated Radix Tabs composition to `@base-ui/react/tabs`. Motion and public animation API retained.

## Changed

Parent review: typecheck and production build passed. The full suite passed with 72 suites and 428 tests before the additional rendered-link check, which also passed. The 17 focused checks and applicable table, navigation, overlay, and settings browser checks passed. Browser scripts and screenshots are kept outside the repository.

- `src/components/ui/animated-tabs.tsx`: `TabsPrimitive` from `@base-ui/react/tabs`. `Trigger` → `Tab`. `Content` → `Panel` with `keepMounted` (replaces `forceMount`) default **true** so Motion layout/opacity state is preserved. Panel uses `render={<motion.div … {...props} />}` instead of wrapping Radix Content. Public exports unchanged: `Tabs`, `TabsList`, `TabsTab`/`TabsTrigger`, `TabsPanels`/`TabsContents`, `TabsPanel`/`TabsContent`, variants, underline position, `mode="auto-height"|"layout"`.
- Consumer `src/features/app/components/settings/index.tsx`: still uses `Tabs`/`TabsList`/`TabsTrigger`/`TabsContents`/`TabsContent` with `mode="layout"` and `onValueChange`. No call-site edit.

Leftover scan on `animated-tabs.tsx`: no `radix-ui`, `@radix-ui`, or `IconPlaceholder`.

## Left alone

- `src/helpers/effects/highlight.tsx` and `auto-height` (Motion helpers, not Radix Tabs).
- Settings dialog chrome (#288).
- Stock `src/components/ui/tabs.tsx` (own report).
- cmdk/vaul/sonner/calendar/chart/sortable.

## Behavior changes

Same manual-activation FLAG as stock tabs: `TabsList.activateOnFocus` default false. Settings tabs are click-driven. Panels stay mounted (`keepMounted` default true) so layout-mode height animation still runs. `data-active` class on triggers was already the local selector.

## Verify by hand

- Open Match Settings: Standard/Advance vertical tabs, underline + gradient on the active item, content cross-fade/layout resize.
- Advance tab still gated when logged out.
- Switching tabs does not lose in-progress standard form fields (keepMounted).
- Apply/cancel footer still works.
