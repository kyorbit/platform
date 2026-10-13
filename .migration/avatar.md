# avatar

2026-10-13. Golden pair via CLI fetch, replay local `size` / `AvatarBadge` / `AvatarGroup` / `AvatarGroupCount`. Migrated.

## Changed

Parent review: typecheck and production build passed. The full suite passed with 72 suites and 428 tests before the additional rendered-link check, which also passed. The 17 focused checks and applicable table, navigation, overlay, and settings browser checks passed. Browser scripts and screenshots are kept outside the repository.

- `src/components/ui/avatar.tsx`: `@base-ui/react/avatar` Root/Image/Fallback. Extra local parts kept (Badge/Group/GroupCount, `size` sm/default/lg).
- Production consumers needed no API edits: `src/features/app/components/match-result/index.tsx`, `src/components/user/user-avatar.tsx`, `src/features/app/components/hud/player-avatar.tsx`, `src/features/dashboard/components/athlete/athlete-avatar.tsx`.

Leftover scan on `avatar.tsx`: no `radix-ui`, `@radix-ui`, or `IconPlaceholder`.

## Left alone

- Image fallbacks and HUD overlays around Avatar.
- Overlay asChild (#288). cmdk/vaul/sonner/calendar/chart/sortable.

## Behavior changes

None. Image load still falls back. Size data attributes unchanged.

## Verify by hand

- Athlete table/drawer avatars, match-result faces, scoreboard HUD player avatars: image, initials/fallback, sizes.
