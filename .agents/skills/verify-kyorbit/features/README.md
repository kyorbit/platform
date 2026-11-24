# Kyorbit verification map

This directory is the maintained source for verifying the user-facing behavior of Kyorbit. Read this index before driving the app, then follow the matching feature file.

## Baseline preconditions

- Launch an isolated Vite dev server with `python .agents/skills/verify-kyorbit/scripts/verify-kyorbit.py launch --port 3199`.
- Run `python .agents/skills/verify-kyorbit/scripts/verify-kyorbit.py doctor --port 3199` and require `ok: true` with HTTP 200 on `/` and `/login` plus Chromium version output.
- Never drive a developer server on port `3000` or `https://kyorbit.localhost` that this verification run did not start.
- Use a `1440x900` desktop viewport because `/` shows a Desktop Only placeholder below `1024px`.
- For authenticated `/dashboard` journeys, supply an admin account (`--username` and `--password` or `--storage-state`) and a seeded tournament ID.

## Driving conventions

- Start every recipe from the baseline state unless its preconditions state otherwise.
- Prefer ARIA roles and accessible names (`One-sided layout`, `Two-sided layout`, `Zoom in`, `Fit to view`, `Username`, `Password`, `Continue`) over CSS classes or DOM coordinates.
- Use `wait_until="load"` plus explicit element waits in Playwright because Vite HMR keeps a persistent WebSocket open and `networkidle` times out.
- Treat every command as literal and keep quoted names and flags unchanged.
- Do not delete `.verify-kyorbit/evidence/` during cleanup.

## Proof and skip reporting

- Capture both the action state and the resulting state, not only the final screen.
- UI proof includes a `.png` screenshot, an `.aria.txt` snapshot, and a `.console.json` error log with zero console or page errors.
- Record the feature ID and entry point in `summary.json`.
- Report an unreachable path with the attempted command and the exact unmet precondition.
- Never report a skipped entry point as verified through a different path.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior, followed by four H2 sections in order.

1. `Sub-features` lists short IDs with one line per behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with verify-kyorbit` starts with `Preconditions:` and pairs each user action with a literal command and observable result.
4. `Gotchas` lists traps that can invalidate a run.

## Features

- [Tournament bracket canvas](./bracket-canvas.md) covers `two-sided` and `one-sided` layouts, pan and zoom, slot lock, match selection, drag and drop, screenshot export, and the UI SDK agent bridge.
- [Desktop scoreboard home](./scoreboard-home.md) covers the public `/` desktop sparring scoreboard and viewport gate.
- [Authentication and dashboard gate](./auth-login.md) covers `/login` form controls, validation, and unauthenticated redirect from `/dashboard`.
- [Tournament builder divisions and tabs](./tournament-builder-divisions.md) covers switching between Divisions and Brackets tabs inside `/dashboard/tournaments/$id/builder`.
