# project

2026-10-13. Whole-project Radix to Base UI migration using Base Vega golden pairs, local replay and transformation engine for custom compositions. Complete.

## Changed

The spec is [#285](https://github.com/kyorbit/platform/issues/285). The approved five-ticket sequence is [#286](https://github.com/kyorbit/platform/issues/286), [#287](https://github.com/kyorbit/platform/issues/287), [#288](https://github.com/kyorbit/platform/issues/288), [#289](https://github.com/kyorbit/platform/issues/289), and [#290](https://github.com/kyorbit/platform/issues/290), with one conventional commit per ticket. Cursor Grok 4.6 High completed preparation and shared controls. After three provider-start failures, the user authorized the parent to implement the remaining tickets. No further subagents were spawned; the parent reviewed and tested the work.

- `components.json` targets `base-vega`, retaining Tailwind 4, Tabler icons and project aliases.
- Project-owned primitive wrappers and consumers use `@base-ui/react@1.5.0`. Each migrated component has its own report in this directory.
- `package.json` removes direct `radix-ui`, `@radix-ui/react-direction`, and `@radix-ui/react-use-controllable-state` dependencies. `bun.lock` was regenerated and a frozen-lockfile installation succeeded. Comparing resolved version sets before/after shows no new dependency versions; Bun rehoisted existing entries and pruned the unused graph.
- Consumer composition, callback nullability, item labels, grouped menu labels, popup positioning, data attributes and CSS variables were audited. The final sweep fixed `src/components/ui/faceted.tsx` to use `--transform-origin`.
- Six rendered test files in `src/components/data-table/__tests__` add 24 checks against real controls, table state, overlays and custom compositions.
- The pre-existing sortable keyboard guard now permits dnd-kit's deliberately canceled keydown default action while preserving canceled pointer handling. A regression test fails with the old guard and passes with the repair.

Final parent verification:

| Check                                                 | Result                                                                                                                                                                                     |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `bun run typecheck`                                   | Passed                                                                                                                                                                                     |
| `bun --env-file=.env.local run test`                  | 74 suites, 436 tests passed; baseline was 68 suites, 412 tests                                                                                                                             |
| `bun --env-file=.env.local run build`                 | Production build passed                                                                                                                                                                    |
| `bun --env-file=.env.local install --frozen-lockfile` | Passed                                                                                                                                                                                     |
| Registry CLI info                                     | Base Vega confirmed                                                                                                                                                                        |
| Runtime Radix import audit                            | Zero project-owned wrappers or consumers remain                                                                                                                                            |
| Table browser workflows                               | Selection/mixed state, sorting, filters/reset, pagination/bounds, page size, column visibility and row menus passed                                                                        |
| Advanced table browser workflows                      | Pointer/keyboard sort/filter ordering and URL state, operators, join choice, command filters, nested single/multiple facets and bulk-action scope passed                                   |
| Overlay/navigation browser workflows                  | Dialogs, nested selects, sheets/popovers, inner Escape, focus return, desktop collapse and mobile sidebar passed                                                                           |
| Other affected browser workflows                      | Retained Vaul drawer, builder tab/URL routing, manual keyboard tab activation, light/dark themes, tooltip content/arrow, animated scoreboard settings, file input and progress fill passed |
| Visual inspection                                     | Athlete table and tournament builder screenshots inspected                                                                                                                                 |

Browser checks used a temporary QA account and canceled record-changing dialogs. The account and its owned sessions/accounts/device selections were removed afterward. Scripts, logs and screenshots live outside the repository at `C:/Users/Admin/AppData/Local/Temp/kyorbit-browser-check` and `C:/Users/Admin/AppData/Local/Temp/kyorbit-base-final-*.log`.

## Left alone

cmdk, Vaul, Sonner, react-day-picker, Recharts and dnd-kit remain on their own libraries. Their necessary project-owned composition boundaries were migrated. Transitive Radix dependencies required by retained libraries remain installed; provenance links in `src/hooks/use-callback-ref.ts` and `src/lib/compose-refs.ts` are comments and remain intact.

Local realtime websocket connection `wss://ws.kyorbit.localhost` is unavailable (`ERR_CONNECTION_REFUSED`), so live multi-client synchronization was not verified. Database-backed dashboard workflows and UI interactions passed. Existing crossOrigin/preload warnings and build warnings remain outside this migration's scope. RadioGroup and ScrollArea have no product consumers and were verified by compilation/build rather than a dashboard flow.

## Behavior changes

- Tabs and animated tabs use manual keyboard activation: arrows move focus; Enter/Space select. Click/tap selection and URL routing pass.
- Menu checkbox/radio choices stay open by Base UI default. Submenus open on mouse hover and keyboard ArrowRight; Escape dismisses one level.
- Tooltip content follows Base UI's visual-hint model; accessible naming remains on the triggers. Existing trigger text and labels are preserved.
- Select keeps the project's existing popper placement through `alignItemWithTrigger=false`; the stock Base Vega default is true. Consumers preserve readable labels and guard nullable values.
- Unused PopoverAnchor remains an inert div because Base UI has no equivalent; explicit anchors are supported by Positioner.
- Sortable keyboard lifecycle handling is repaired as described above. No drag sensor thresholds or collision rules changed.

## Verify by hand

Sign in and open the athlete table. Select two rows, inspect bulk dialog names and cancel. Change page size, sort, hide a column, apply/reset a facet and range. In advanced mode, reorder sorts and filters with mouse and keyboard and inspect the URL. Open command filters and add/reset a text value. In the builder, switch tabs, open Division Settings and a nested select, then Escape twice. Collapse desktop navigation, open mobile navigation, switch themes, and check delayed tooltips. Confirm the separate realtime service before testing live multi-client synchronization.
