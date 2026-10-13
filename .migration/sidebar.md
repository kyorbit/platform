# sidebar

2026-10-13. Golden pair via registry fetch and local replay, with installed Base UI 1.5.0 declarations verified. Migrated. Classified as customized against radix-vega after accounting for formatting, aliases and resolved icons; local classes, Tabler icons and custom props retained.

## Changed

Replace five Radix Slot compositions with useRender and mergeProps; migrate render consumers and tooltip composition. Preserve active=true CSS markers, state/cookies, shortcut, sizes, native links, mobile Sheet and collapse behavior.

- `src/components/ui/sidebar.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/components/user/user-nav.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/features/dashboard/components/sidebar/app-sidebar.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/features/dashboard/components/sidebar/nav-documents.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/features/dashboard/components/sidebar/nav-main.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/components/data-table/__tests__/overlays.test.tsx`: migrate this composition boundary or verify its rendered behavior.

Runtime leftover scan on this component is clean: no radix-ui, @radix-ui or IconPlaceholder. Parent personally ran typecheck, 19 rendered table/overlay checks, production build, and applicable browser checks. Browser coverage includes the seven table workflows, six dashboard overlay/navigation workflows, nested submenu positioning and Escape, select keyboard/focus return, mobile sidebar, scoreboard settings and file input.

## Left alone

cmdk commands, Vaul drawers, Sonner, react-day-picker and Recharts remain on their own libraries. Only necessary project-owned composition boundaries changed. Custom action-bar and sortable migration belongs to #289; direct Radix dependency removal belongs to #290.

## Behavior changes

No intentional user-visible behavior change. Active markers remain string values matching existing local CSS.

## Verify by hand

Collapse/expand desktop sidebar, use keyboard shortcut, navigate native links, hover collapsed tooltips, open/close mobile sidebar.
