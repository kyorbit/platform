# Tournament bracket canvas

The tournament bracket canvas displays a division's single-elimination tree in either `two-sided` or `one-sided` layout with pan, zoom, slot locks, drag-and-drop athlete assignment, match detail inspection, light-mode PNG export, and UI SDK agent bridge control.

## Sub-features

- `bracket-two-sided` renders left and right wings converging on a centered Final and optional Third-Place Match.
- `bracket-one-sided` renders a left-to-right tree with the final column inset and feeder trunk attached.
- `bracket-viewport` supports mouse pan, wheel zoom, `Zoom in`, `Zoom out`, and `Fit to view`.
- `bracket-slot-lock` locks or unlocks an individual red or blue corner without opening the match sheet.
- `bracket-match-detail` opens the match detail sheet when a user clicks or activates a match slot.
- `bracket-screenshot` exports a light-mode PNG preview of the full bracket.
- `bracket-agent-bridge` exposes bracket state and actions through `@ui-sdk/react/agent` (`snapshot`, `query`, `act`) with `data-agent-confirm` gating on destructive actions.

## How to get to it (user POV)

- Sign in at `/login`, open `/dashboard/tournaments`, select a tournament, open Builder, and select the `Brackets` tab.
- Open `/dashboard/tournaments/<tournament-id>/builder?tab=brackets` directly while authenticated.

## Driving it with verify-kyorbit

Preconditions:

- `verify-kyorbit doctor --port 3199` returns `ok: true`.
- Run `python .agents/skills/verify-kyorbit/scripts/verify-kyorbit.py ensure-agent-user --base-url http://127.0.0.1:3199` once to provision and verify the `verify_agent` Better Auth account.
- At least one tournament with a division containing generated matches exists in the configured database.

- **Launch bracket drive.** Run `python .agents/skills/verify-kyorbit/scripts/verify-kyorbit.py drive-bracket --base-url http://127.0.0.1:3199 --out .verify-kyorbit/evidence/bracket-live --username verify_agent --password 'VerifyAgent!2026'`. Pass `--tournament-id <uuid>` to pick a specific tournament, or omit it to use the first tournament on `/dashboard/tournaments`.
- **Verify two-sided layout.** Inspect `01-bracket-two-sided-light.png`, `01-bracket-two-sided-dark.png`, and `01-bracket-two-sided.aria.txt`. `canvas[data-bracket-canvas]` is visible with non-zero bounds and renders symmetric left and right wings converging on the Final in both themes.
- **Switch to one-sided layout.** The script clicks `One-sided layout` (`@ui-sdk/react/segmented-control`) and saves `02-bracket-one-sided-light.png` and `02-bracket-one-sided-dark.png`. All rounds align left-to-right and the layout persists in `localStorage` under `tku-bracket-canvas-layout`.
- **Restore two-sided layout.** The script clicks `Two-sided layout` and saves `03-bracket-two-sided-restored-light.png` and `03-bracket-two-sided-restored-dark.png`. The bracket returns to symmetric two-sided wings.
- **Verify zoom and fit.** The script clicks `Zoom in` and `Fit bracket to view` and saves `04-bracket-zoom-fit-light.png` and `04-bracket-zoom-fit-dark.png`. The bracket stays framed cleanly.
- **Verify direct canvas PNG export.** The script clicks `Capture bracket screenshot` and saves `05-bracket-screenshot-dialog-light.png` and `05-bracket-screenshot-dialog-dark.png`. The dialog renders a crisp light-mode PNG preview with Copy and Save buttons even when triggered from dark mode.

## Gotchas

- `launch` must set `BETTER_AUTH_URL=http://127.0.0.1:<PORT>` so Better Auth's `trustedOrigins` accepts local sign-up and sign-in requests on the isolated port.
- Matches load asynchronously from Neon Postgres after SSR hydration; `drive-bracket` waits up to 20 seconds for `canvas[data-bracket-canvas]` rather than using a fixed sleep.
- If no credentials or storage state are passed, `/dashboard/tournaments/<id>/builder` redirects to `/login`. `drive-bracket` fails explicitly and saves `00-auth-required.png`.
- When the external realtime server (`VITE_REALTIME_URL`) is not running locally, `.console.json` records a `WebSocket connection to 'wss://ws.kyorbit.localhost/...' failed` error alongside the pre-existing SSR `crossorigin` / `append` errors. Inspect `.console.json` to confirm zero new bracket or UI SDK errors.
- Do not run destructive toolbar actions (`Regenerate bracket`, `Reset bracket`) against a shared database with real tournament data.
