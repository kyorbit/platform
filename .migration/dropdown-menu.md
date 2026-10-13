# dropdown-menu

2026-10-13. Golden pair via registry fetch and local replay, with installed Base UI 1.5.0 declarations verified. Migrated. Classified as customized against radix-vega after accounting for formatting, aliases and resolved icons; local classes, Tabler icons and custom props retained.

## Changed

Base Menu groups, separate checkbox/radio indicators, submenu roots/triggers and portal positioner popup. All positioning options are forwarded. Consumers use onClick for actions and explicit groups around labels; popup CSS variables and trigger state hooks updated.

- `src/components/data-table/data-table-column-header.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/components/ui/dropdown-menu.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/components/user/user-dropdown.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/components/user/user-nav.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/features/dashboard/components/athlete/athlete-table/athletes-action-menu.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/features/dashboard/components/sidebar/nav-documents.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/features/dashboard/components/tournament/builder/brackets-tab/divisions-panel/divisions-tabs-header.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/features/dashboard/components/tournament/builder/divisions-tab/division-roster-table/division-roster-columns.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/features/dashboard/components/tournament/overview/tournaments-table/tournaments-action-menu.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/components/data-table/__tests__/overlays.test.tsx`: migrate this composition boundary or verify its rendered behavior.

Runtime leftover scan on this component is clean: no radix-ui, @radix-ui or IconPlaceholder. Parent personally ran typecheck, 19 rendered table/overlay checks, production build, and applicable browser checks. Browser coverage includes the seven table workflows, six dashboard overlay/navigation workflows, nested submenu positioning and Escape, select keyboard/focus return, mobile sidebar, scoreboard settings and file input.

## Left alone

cmdk commands, Vaul drawers, Sonner, react-day-picker and Recharts remain on their own libraries. Only necessary project-owned composition boundaries changed. Custom action-bar and sortable migration belongs to #289; direct Radix dependency removal belongs to #290.

## Behavior changes

FLAG: checkbox and radio items default closeOnClick=false, keeping choices open; no override added. Mouse submenus open on hover; ArrowRight opens them by keyboard. Escape dismisses the submenu first.

## Verify by hand

Sort ascending/descending/reset; open a row action submenu, inspect disabled items, choose a radio action in a test fixture, Escape twice and check focus.
