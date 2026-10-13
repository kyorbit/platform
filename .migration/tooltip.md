# tooltip

2026-10-13. Golden pair via registry fetch and local replay, with installed Base UI 1.5.0 declarations verified. Migrated. Classified as customized against radix-vega after accounting for formatting, aliases and resolved icons; local classes, Tabler icons and custom props retained.

## Changed

Base provider/root/trigger, portal positioner popup and side-aware arrow. Provider delayDuration becomes delay; per-tooltip delays move to Trigger. Forward all positioning options. Preserve selection styling and local zero offset.

- `src/components/ui/sidebar.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/components/ui/tooltip.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/contexts/feature-flags/provider.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/features/dashboard/components/tournament/builder/brackets-tab/bracket-layout-toggle.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/features/dashboard/components/tournament/builder/brackets-tab/bracket-toolbar.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/features/dashboard/components/tournament/builder/brackets-tab/bracket-view-toolbar.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/features/dashboard/components/tournament/builder/builder-shell/builder-footer.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/features/dashboard/components/tournament/builder/dialogs/division-settings-sheet.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/features/dashboard/components/tournament/builder/divisions-tab/athlete-pool/athlete-pool-row.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/features/dashboard/components/tournament/builder/divisions-tab/division-violation-badge.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/features/dashboard/components/tournament/command-center/activity-event-row.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/components/data-table/__tests__/overlays.test.tsx`: migrate this composition boundary or verify its rendered behavior.

Runtime leftover scan on this component is clean: no radix-ui, @radix-ui or IconPlaceholder. Parent personally ran typecheck, 19 rendered table/overlay checks, production build, and applicable browser checks. Browser coverage includes the seven table workflows, six dashboard overlay/navigation workflows, nested submenu positioning and Escape, select keyboard/focus return, mobile sidebar, scoreboard settings and file input.

## Left alone

cmdk commands, Vaul drawers, Sonner, react-day-picker and Recharts remain on their own libraries. Only necessary project-owned composition boundaries changed. Custom action-bar and sortable migration belongs to #289; direct Radix dependency removal belongs to #290.

## Behavior changes

FLAG: Base UI treats tooltip content as a visual hint and leaves accessible naming to the trigger ([usage guidelines](https://base-ui.com/react/components/tooltip)). The installed popup does not expose Radix's tooltip role/description association. Existing trigger text and explicit labels are retained; browser verification checks visible content, focus/hover and arrow positioning directly.

Existing explicit delays (700ms feature flags, 300ms bracket layouts, 200ms builder provider, 0ms sidebar provider) are retained. No unsupported Radix delay/hoverable-content overrides were present.

## Verify by hand

Hover or keyboard focus navigation and builder controls, check delayed tooltips and arrow placement, collapse sidebar and check navigation labels.
