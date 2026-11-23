# Tournament builder divisions and tabs

Tournament Builder (`/dashboard/tournaments/$id/builder`) lets an admin switch between the `Divisions` tab and the `Brackets` tab, open tournament activity and settings dialogs, and select which division renders on the bracket canvas.

## Sub-features

- `builder-tab-switch` switches between `Divisions` and `Brackets` tabs and exits bracket fullscreen when leaving `Brackets`.
- `builder-division-select` selects a division and loads its matches onto the bracket canvas.

## How to get to it (user POV)

- Open `/dashboard/tournaments`, click a tournament, and navigate to Builder (`/dashboard/tournaments/<id>/builder`).

## Driving it with verify-kyorbit

Preconditions:

- `verify-kyorbit doctor --port 3199` returns `ok: true`.
- An authenticated session and a valid `<tournament-id>` exist.

- **Open builder on Divisions tab.** Run `python .agents/skills/verify-kyorbit/scripts/verify-kyorbit.py capture --url http://127.0.0.1:3199/dashboard/tournaments/<tournament-id>/builder?tab=divisions --out .verify-kyorbit/evidence/builder-run --name builder-divisions`. Confirm the Divisions view renders with zero console errors.
- **Open builder on Brackets tab.** Run `python .agents/skills/verify-kyorbit/scripts/verify-kyorbit.py drive-bracket --base-url http://127.0.0.1:3199 --tournament-id <tournament-id> --out .verify-kyorbit/evidence/builder-run --username <user> --password <pass>`. Confirm `01-bracket-two-sided.png` renders the selected division's bracket.

## Gotchas

- `TournamentBuilder` subscribes to `useTournamentRealtimeStream(id)`. If the external realtime Socket.io service (`VITE_REALTIME_URL`) is not running locally, check `.console.json` to distinguish expected websocket connection refusals from React or app errors.
