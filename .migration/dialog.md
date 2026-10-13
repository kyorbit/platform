# dialog

2026-10-13. Golden pair via registry fetch and local replay, with installed Base UI 1.5.0 declarations verified. Migrated. Classified as customized against radix-vega after accounting for formatting, aliases and resolved icons; local classes, Tabler icons and custom props retained.

## Changed

Base Dialog backdrop/popup and render composition. Preserved custom overlayClassName, closeButtonClassName, close toggle, dimensions, and footer.

- `src/components/navigation/navbar.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/components/ui/command.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/components/ui/dialog.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/features/dashboard/components/athlete/dialogs/bulk-add-athletes-dialog.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/features/dashboard/components/tournament/builder/brackets-tab/divisions-panel/arena-division-order-sheet/retire-arena-dialog.tsx`: migrate this composition boundary or verify its rendered behavior.
- `src/components/data-table/__tests__/overlays.test.tsx`: migrate this composition boundary or verify its rendered behavior.

Runtime leftover scan on this component is clean: no radix-ui, @radix-ui or IconPlaceholder. Parent personally ran typecheck, 19 rendered table/overlay checks, production build, and applicable browser checks. Browser coverage includes the seven table workflows, six dashboard overlay/navigation workflows, nested submenu positioning and Escape, select keyboard/focus return, mobile sidebar, scoreboard settings and file input.

## Left alone

cmdk commands, Vaul drawers, Sonner, react-day-picker and Recharts remain on their own libraries. Only necessary project-owned composition boundaries changed. Custom action-bar and sortable migration belongs to #289; direct Radix dependency removal belongs to #290.

## Behavior changes

No intentional user-visible behavior change. Base focus and dismissal are covered by nested-dialog and focus-return tests.

## Verify by hand

Open an edit/create dialog, use the nested select, close by Escape and Close; focus returns to the trigger. Cancel a form without saving.
