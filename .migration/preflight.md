# Preflight

2026-10-13. Whole-project Radix-to-Base UI Vega target only. No wrappers migrated.

## Scope

Branch `refactor/shadcn-base-ui`. Ticket [#286](https://github.com/kyorbit/platform/issues/286) under spec [#285](https://github.com/kyorbit/platform/issues/285).

Set `components.json` `style` from `radix-vega` to `base-vega`. Every other field stays as-is: `rsc`, `tsx`, Tailwind v4/`src/styles.css`/zinc, Tabler icons, menu color/accent, `@/` aliases, extra registries. No `shadcn add`, overwrite, preset, theme, font, or dependency change.

25 project-owned runtime Radix wrappers remain in `src/components/ui`. 22 have shadcn golden pairs. `action-bar`, `sortable`, and `animated-tabs` do not. Existing Base UI combobox is out of scope except where a later migrated Button contract forces a composition tweak.

This file is a preflight record. It is not a migration-status index. Remaining Radix count is derived from runtime imports.

## Installed Base UI

- Declared: `@base-ui/react` `^1.5.0`
- Resolved: `1.5.0` (`node_modules/@base-ui/react/package.json`)
- Direct Radix kept until [#290](https://github.com/kyorbit/platform/issues/290): `radix-ui` `^1.4.3`, `@radix-ui/react-direction` `^1.1.4`, `@radix-ui/react-use-controllable-state` `^1.2.3`

## Golden-pair classification

Pairs exist for: avatar, badge, breadcrumb, button, button-group, checkbox, dialog, dropdown-menu, label, popover, progress, radio-group, scroll-area, select, separator, sheet, sidebar, slider, tabs, toggle, toggle-group, tooltip.

Parent literal diffs against the Radix Vega origin differ for all 22, including formatting and CLI icon/alias resolution. Treat those as resolution noise, not product customizations.

Classification rule for later tickets:

1. Diff the local file against `https://ui.shadcn.com/r/styles/radix-vega/<component>.json` after accounting for Tabler/`@/` CLI resolution.
2. If the remaining delta is unclear, keep the local implementation.
3. Replay the kept delta onto the Base Vega counterpart (`base-vega/<component>.json`) via three-way merge. Never `--overwrite` a customized file. Never bulk `--all --overwrite`.
4. After every merge, leftover-scan the file for `radix-ui`, `@radix-ui`, and `IconPlaceholder`. A clean merge is not a clean file.
5. No-pair wrappers (`action-bar`, `sortable`, `animated-tabs`) use the transformation engine and installed `@base-ui/react@1.5.0` declarations. Keep toolbar focus, Motion, portals, and dnd-kit.

## Baseline

Valid comparison commands (default `test`/`build` scripts do not load `.env.local`):

- `bun run typecheck` — pass
- `bun --env-file=.env.local run test` — 68 suites, 412 tests pass
- `bun --env-file=.env.local run build` — pass

Warnings:

- Bare `bun run test` / `bun run build` miss `DATABASE_URL` / `DIRECT_DATABASE_URL` from `.env.local`. Do not edit env files or print secrets.
- Existing production-build warnings are unrelated and out of scope.
- No database schema changes.
- Parent writes rendered data-table fixtures under `src/components/data-table/__tests__`. This ticket does not own that work.

Parent verification for this preparation ticket:

- Added nine rendered interaction checks using the real shared table controls and TanStack Table v9. They cover stable-ID/page selection, mixed header state, bulk-action scope, text/range/faceted filters, sorting, pagination/page size, column visibility, and empty/fetching states. All nine pass against the Radix baseline.
- Added two tests through the existing `useDataTable` and Nuqs testing adapter. Pagination/sort URL persistence and clearing one filter while another updates both pass.
- The full suite after the first nine checks passed with 69 suites and 421 tests. The two URL checks also passed separately. Typecheck and targeted lint passed before the final formatting hook.
- Browser baseline: scoreboard, authenticated dashboard, athlete library, and tournament overview load without page errors. Baseline screenshots were captured outside the repository. Existing data was inspected without modification.
- Collaborative browser snapshots failed twice with `Preview automation snapshot timed out after 15000ms.` Parent switched to a temporary Playwright installation outside the project and the installed Edge browser. No browser dependency was added to the project.

## Dependency order

Leaf wrappers first. Intra-`ui` edges that constrain later tickets: `button-group` → `separator`; `toggle-group` → `toggle`; `dialog`/`sheet`/`action-bar` → `button`; `sidebar` → `button`, `separator`, `tooltip`, `sheet`. `animated-tabs` imports Radix Tabs directly, not `tabs.tsx`.

1. [#287](https://github.com/kyorbit/platform/issues/287): button, label, separator, badge, breadcrumb, button-group, checkbox, radio-group, slider, toggle, toggle-group, avatar, progress, scroll-area, tabs, animated-tabs
2. [#288](https://github.com/kyorbit/platform/issues/288): tooltip, select, dropdown-menu, popover, dialog, sheet, sidebar
3. [#289](https://github.com/kyorbit/platform/issues/289): sortable, action-bar
4. [#290](https://github.com/kyorbit/platform/issues/290): drop unused direct Radix, sweep consumers, final verify

## Retained non-Radix libraries

Leave these wrappers and their libraries intact. Boundary edits are allowed only when a migrated project-owned contract changes:

- `cmdk` — `command`
- `vaul` — `drawer`
- `sonner` — toast
- `react-day-picker` — `calendar`
- `recharts` — `chart`
- `@dnd-kit/*` — used by `sortable`

Vaul and similar third-party `asChild` APIs stay. Provenance-only Radix links in copied callback-ref / compose-ref docs are not runtime imports.

## Remaining runtime Radix

**25** project-owned wrappers still import `radix-ui` or `@radix-ui/*`:

action-bar, animated-tabs, avatar, badge, breadcrumb, button, button-group, checkbox, dialog, dropdown-menu, label, popover, progress, radio-group, scroll-area, select, separator, sheet, sidebar, slider, sortable, tabs, toggle, toggle-group, tooltip.

Transitive Radix from retained third-party libraries is not counted here.
