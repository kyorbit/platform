# Desktop scoreboard home

The root route `/` renders the dark-mode Taekwondo sparring scoreboard on desktop screens (`>= 1024px`) and shows a Desktop Only placeholder on narrower viewports.

## Sub-features

- `scoreboard-desktop` renders the navigation bar, HUD, and sparring scoreboard on a `1440x900` viewport.
- `scoreboard-mobile-gate` displays the `Desktop Only` empty state below `1024px`.

## How to get to it (user POV)

- Open `/` in a desktop browser without signing in.

## Driving it with verify-kyorbit

Preconditions:

- `verify-kyorbit doctor --port 3199` returns `ok: true`.

- **Capture initial desktop scoreboard.** Run `python .agents/skills/verify-kyorbit/scripts/verify-kyorbit.py drive-scoreboard --base-url http://127.0.0.1:3199 --out .verify-kyorbit/evidence/scoreboard-run`. The script loads `/` at `1440x900` and saves `01-scoreboard-initial.png`, `01-scoreboard-initial.aria.txt`, and `01-scoreboard-initial.console.json`.
- **Check proof.** Open `summary.json` and confirm `ok: true` and `errorCount: 0`. Inspect `01-scoreboard-initial.png` to verify the dark scoreboard UI renders cleanly without the `Desktop Only` overlay.
- **Check narrow viewport gate.** Run `python .agents/skills/verify-kyorbit/scripts/verify-kyorbit.py capture --url http://127.0.0.1:3199/ --out .verify-kyorbit/evidence/scoreboard-run --name scoreboard-mobile --viewport 390x844`. `scoreboard-mobile.aria.txt` contains `Desktop Only`.

## Gotchas

- `/` forces dark theme via `ThemeProvider forcedTheme="dark"`. Do not expect light-mode tokens on `/`.
- Viewport width below `1024px` hides the scoreboard via `useMediaQuery('(min-width: 1024px)')` and shows `Desktop Only`.
