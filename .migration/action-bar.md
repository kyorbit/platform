# action-bar

2026-10-13. Transformation engine for the customized toolbar. Migrated.

## Changed

- `src/components/ui/action-bar.tsx`: replace Radix Slot with Base useRender and mergeProps in Root, Selection, Group, Close and Separator. Replace direction utilities with Base useDirection and DirectionProvider, preserving explicit direction precedence. Retain positioning, portal container, refs, focus registration, roving navigation, event cancellation, selection events and Escape behavior.
- `src/components/data-table/__tests__/custom-interactions.test.tsx`: verify rendered root refs, RTL navigation, disabled action skipping, activation exactly once, Close, and canceled/default Escape.

Parent review: typecheck, production build and 24 rendered table checks pass. Browser verification selects two athlete rows, checks the count, navigates the bar by keyboard, opens the deletion dialog with exactly those two names, cancels without deleting, and clears selection via Escape.

Runtime scan is clean: no radix-ui, @radix-ui or IconPlaceholder imports.

## Left alone

`src/features/dashboard/components/athlete/athlete-table/athletes-action-bar.tsx` has no Slot consumers and retains its selection scope, export and bulk-action logic. The action items already use the migrated Base Button. Backend mutations and CSV behavior remain intact.

## Behavior changes

No intentional user-visible behavior changes. Direction is inherited from Base UI context and explicit dir still takes precedence. The hook executes before conditional portal rendering to preserve hook order when selection changes.

## Verify by hand

Select rows, check the count and bulk dialog names, cancel, then clear selection. Use arrow keys, Home/End and Shift+Tab; disabled actions are skipped. Test Escape and a canceled Escape handler. Repeat navigation in RTL.
