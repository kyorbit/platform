# select

2026-10-13. Golden pair via registry fetch and local replay, with installed Base UI 1.5.0 declarations verified. Migrated. Classified as customized against radix-vega after accounting for formatting, aliases and resolved icons; local classes, Tabler icons and custom props retained.

## Changed

Base Root generic value inference, GroupLabel, List, scroll arrows, native separator, render icon, Positioner/Popup. Consumers supply item labels and guard nullable callbacks. FormSelect derives labels from its existing rendered option children; numeric empty sentinels stay intact. Forward all installed Base positioning options explicitly.

- `src/components/data-table/data-table-filter-list.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/components/data-table/data-table-filter-menu.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/components/data-table/data-table-pagination.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/components/data-table/data-table-sort-list.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/components/form/form-select.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/components/ui/select.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/features/dashboard/components/athlete/athlete-drawer/athlete-row-fields.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/features/dashboard/components/athlete/dialogs/bulk-add-athletes-dialog.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/features/dashboard/components/tournament/builder/brackets-tab/divisions-panel/arena-division-order-sheet/retire-arena-dialog.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/features/dashboard/components/tournament/builder/brackets-tab/match-detail-panel/index.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/features/dashboard/components/tournament/builder/builder-shell/builder-footer.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/features/dashboard/components/tournament/builder/dialogs/division-settings-sheet.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/features/dashboard/components/tournament/builder/divisions-tab/athlete-pool/filters/pool-belt-filter.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/features/dashboard/components/tournament/builder/divisions-tab/athlete-pool/filters/pool-gender-select.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/features/dashboard/components/tournament/overview/tournaments-toolbar/index.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/components/data-table/__tests__/overlays.test.tsx`: migrate this composition boundary or verify its rendered behavior.

Runtime leftover scan on this component is clean: no radix-ui, @radix-ui or IconPlaceholder. Parent personally ran typecheck, 19 rendered table/overlay checks, production build, and applicable browser checks. Browser coverage includes the seven table workflows, six dashboard overlay/navigation workflows, nested submenu positioning and Escape, select keyboard/focus return, mobile sidebar, scoreboard settings and file input.

## Left alone

cmdk commands, Vaul drawers, Sonner, react-day-picker and Recharts remain on their own libraries. Only necessary project-owned composition boundaries changed. Custom action-bar and sortable migration belongs to #289; direct Radix dependency removal belongs to #290.

## Behavior changes

Local popper default is preserved with alignItemWithTrigger=false; this differs from the stock Base Vega true default. Public position prop becomes alignItemWithTrigger. Callbacks accept null and event details; callers guard null before domain updates.

## Verify by hand

Choose page size, verify boundaries and displayed labels, keyboard ArrowDown/End/Enter, typeahead, disabled choices, and nested form selects.
