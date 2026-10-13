# popover

2026-10-13. Golden pair via registry fetch and local replay, with installed Base UI 1.5.0 declarations verified. Migrated. Classified as customized against radix-vega after accounting for formatting, aliases and resolved icons; local classes, Tabler icons and custom props retained.

## Changed

Base portal positioner popup with all positioning options explicitly forwarded, render triggers, native Base title/description, and CSS variables in table consumers. Faceted keeps its existing one-argument public open callback because it also closes imperatively.

- `src/components/data-table/data-table-date-filter.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/components/data-table/data-table-filter-list.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/components/data-table/data-table-filter-menu.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/components/data-table/data-table-slider-filter.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/components/data-table/data-table-sort-list.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/components/form/form-combobox.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/components/ui/faceted.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/components/ui/popover.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/features/dashboard/components/tournament/builder/divisions-tab/athlete-pool/filters/pool-belt-filter.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/features/dashboard/components/tournament/builder/divisions-tab/athlete-pool/filters/pool-weight-filter.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/components/data-table/__tests__/overlays.test.tsx`: migrate this composition boundary or verify its rendered behavior.

Runtime leftover scan on this component is clean: no radix-ui, @radix-ui or IconPlaceholder. Parent personally ran typecheck, 19 rendered table/overlay checks, production build, and applicable browser checks. Browser coverage includes the seven table workflows, six dashboard overlay/navigation workflows, nested submenu positioning and Escape, select keyboard/focus return, mobile sidebar, scoreboard settings and file input.

## Left alone

cmdk commands, Vaul drawers, Sonner, react-day-picker and Recharts remain on their own libraries. Only necessary project-owned composition boundaries changed. Custom action-bar and sortable migration belongs to #289; direct Radix dependency removal belongs to #290.

## Behavior changes

Unused PopoverAnchor has no Base counterpart and is retained as an inert native div; use Positioner anchor for anchoring. No production Anchor consumer exists.

## Verify by hand

Open text, facet, range, date and advanced filter popovers; interact with inner controls, clear filters and dismiss without closing the outer dialog/sheet.
