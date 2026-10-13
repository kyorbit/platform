# sortable

2026-10-13. Transformation engine for the customized dnd-kit composition. Migrated.

## Changed

- `src/components/ui/sortable.tsx`: replace Radix Slot with Base useRender and mergeProps for Content, Item and ItemHandle. Retain composed refs, transforms, styles, activator attributes, callbacks, sensors, collision rules, announcements and overlays. Boolean drag state emits the original presence attribute. Hooks execute consistently when wrapper rendering is disabled.
- `src/components/data-table/data-table-sort-list.tsx` and `src/components/data-table/data-table-filter-list.tsx`: migrate every Content, Item and ItemHandle consumer to render composition.
- `src/components/data-table/__tests__/custom-interactions.test.tsx`: verify handle refs, merged callbacks, actual keyboard sensor activation, overlay and cancellation.
- `src/components/data-table/__tests__/date-filter.test.tsx`: complete table interaction coverage with real calendar single/range selection, actual filtered rows and clearing.

Parent review: typecheck, production build and 24 rendered table checks pass. Real browser pointer and keyboard reordering updates visible sort/filter order and query state; operator, join and reset checks pass. A regression run with the original keyboard guard fails the overlay assertion, and the corrected implementation passes.

Runtime scan is clean: no radix-ui, @radix-ui or IconPlaceholder imports.

## Left alone

dnd-kit remains the drag library. The independent arena ordering editor uses dnd-kit directly and remains intact. `withoutSlot` retains its existing wrapper-omission behavior. No sensor thresholds, drop animation, collision rules or sorting defaults changed.

## Behavior changes

Existing keyboard cancellation guards treated dnd-kit's deliberate keydown preventDefault as a user cancellation, blocking keyboard lifecycle updates. The guards now distinguish keydown from canceled pointer events. Keyboard reordering and Escape cancellation work; canceled pointer activation remains blocked. This repair is required by the ticket's keyboard sensor verification.

## Verify by hand

Open athlete advanced filters. Drag the first sort beneath the second and inspect URL order; repeat with Space, ArrowDown and Space. Reorder two named filters and inspect their URL order. Space then Escape cancels without changing order. Check cursor and overlay appearance during drag.
