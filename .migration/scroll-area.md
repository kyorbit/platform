# scroll-area

2026-10-13. Golden pair via CLI fetch, replay local viewport/scrollbar classes. Migrated. Scrollbar/Thumb rename. No Content wrapper (matches base-vega golden).

## Changed

Parent review: this wrapper has no production consumers. Installed API shapes, typecheck, and production build passed; its manual checklist remains unexecuted.

- `src/components/ui/scroll-area.tsx`: `@base-ui/react/scroll-area`. Viewport wraps children. `ScrollBar` uses `Scrollbar` + `Thumb`. Radix `type` / `scrollHideDelay` are not on Base Root and were not used locally.

Leftover scan on `scroll-area.tsx`: no `radix-ui`, `@radix-ui`, or `IconPlaceholder`.

No production imports of `@/components/ui/scroll-area`.

## Left alone

- Native overflow scrollers in tables, sheets, and activity lists.
- Overlay asChild (#288). cmdk/vaul/sonner/calendar/chart/sortable.

## Behavior changes

None in product (no consumers). If used later: Base has no `type="hover"`/`scrollHideDelay`; scrollbar visibility follows Base defaults.

## Verify by hand

No in-app surface. If a later ticket mounts `ScrollArea`, confirm wheel/trackpad scroll, keyboard focus in the viewport, and both orientations of `ScrollBar`.
