---
name: verify-kyorbit
description: "Verify Kyorbit web UI behavior end to end using an isolated Vite dev server and Python Playwright. Covers launching, health checks, driving the scoreboard, login flow, tournament builder, and 1-sided or 2-sided tournament bracket canvas, capturing screenshots and ARIA snapshots as proof, and cleaning up without deleting evidence. Use whenever verifying UI changes, bracket canvas rebuilds, or UI SDK agent bridge flows in Kyorbit."
---

# Verify Kyorbit

Drive the real Kyorbit web app in Chromium through Python Playwright, capture screenshots and ARIA snapshots as proof, and tear down only the server process this run started.

Read [features/README.md](features/README.md) before driving a feature. Each feature file in `features/` is the maintained recipe for that user journey.

## Surface and isolation

Kyorbit is a TanStack Start + React 19 + Vite 8 web app backed by PostgreSQL (Neon) and Better Auth.

- Primary surface is the browser UI (desktop viewport `1440x900`; `/` shows a Desktop Only empty state below `1024px`).
- Multiple verification runs can run side by side by passing distinct `--port` and `--state-file` values. Do not drive port `3000` or `https://kyorbit.localhost` if a developer server is already running there.
- All runs share the database configured in `.env.local`. Never run destructive bracket mutations (`Regenerate bracket`, `Reset bracket`, `Delete custom match`) against a non-disposable database unless the operator approves it.

## Launch

Start an isolated Vite dev server with `scripts/verify-kyorbit.py launch`:

```bash
python .agents/skills/verify-kyorbit/scripts/verify-kyorbit.py launch --port 3199
```

`launch` spawns `bunx vite dev --port 3199 --strictPort --host 127.0.0.1` with `BETTER_AUTH_URL=http://127.0.0.1:3199` so Better Auth trusts the isolated verification origin, writes the PID, base URL, and server log path to `.verify-kyorbit/state-3199.json`, and polls `GET http://127.0.0.1:3199/` and `GET http://127.0.0.1:3199/login` until both return HTTP 200.

Preconditions from a fresh checkout:

1. Dependencies installed (`bun install`) and Prisma client generated (`bun run db:generate`).
2. `.env.local` present with `DATABASE_URL`, `DIRECT_DATABASE_URL`, `BETTER_AUTH_URL`, and `BETTER_AUTH_SECRET` for authenticated `/dashboard` routes. Public `/` and `/login` render without logging in.
3. Python Playwright with Chromium installed (`playwright` on `PATH`).

## Doctor

Run `doctor` before driving any feature and whenever a step behaves unexpectedly:

```bash
python .agents/skills/verify-kyorbit/scripts/verify-kyorbit.py doctor --port 3199
```

`doctor` is read-only. It checks:

1. The PID recorded in `.verify-kyorbit/state-3199.json` is alive.
2. `http://127.0.0.1:3199/` and `http://127.0.0.1:3199/login` return HTTP 200 with Kyorbit HTML.
3. Python Playwright can launch headless Chromium.

If `doctor` exits non-zero, stop and fix the launch before driving any journey.

## Drive

Drive the app with `scripts/verify-kyorbit.py` using ARIA roles, accessible names, and stable `data-*` attributes.

### Capture any route (screenshot + ARIA + console log)

```bash
python .agents/skills/verify-kyorbit/scripts/verify-kyorbit.py capture \
  --url http://127.0.0.1:3199/login \
  --out .verify-kyorbit/evidence/run-1 \
  --name login-page
```

### Drive the public desktop scoreboard (`/`)

```bash
python .agents/skills/verify-kyorbit/scripts/verify-kyorbit.py drive-scoreboard \
  --base-url http://127.0.0.1:3199 \
  --out .verify-kyorbit/evidence/run-1
```

### Ensure a verification agent user via Better Auth API

```bash
python .agents/skills/verify-kyorbit/scripts/verify-kyorbit.py ensure-agent-user \
  --base-url http://127.0.0.1:3199 \
  --username verify_agent \
  --password 'VerifyAgent!2026'
```

`ensure-agent-user` calls `POST /api/auth/sign-up/email` (idempotent if the user already exists) and verifies sign-in through `POST /api/auth/sign-in/username`.

### Drive the tournament bracket canvas (`/dashboard/tournaments/<id>/builder`)

```bash
python .agents/skills/verify-kyorbit/scripts/verify-kyorbit.py drive-bracket \
  --base-url http://127.0.0.1:3199 \
  --out .verify-kyorbit/evidence/bracket-live \
  --username verify_agent \
  --password 'VerifyAgent!2026'
```

Pass `--tournament-id <uuid>` to target a specific tournament, or omit it to auto-select the first tournament listed on `/dashboard/tournaments`. You can also pass `--storage-state <path>` to reuse a saved Playwright auth state.

## Evidence

Proof artifacts go under `.verify-kyorbit/evidence/<run-id>/`. Each driven step writes:

- `<step>-light.png` and `<step>-dark.png` full-viewport screenshots at `1440x900` in both light mode and dark mode (for `drive-bracket` and `capture --theme both`).
- `<step>.aria.txt` accessibility tree snapshot of the visible page.
- `<step>.console.json` browser console errors and uncaught page errors.
- `summary.json` machine-readable record of the feature ID, entry point, assertions, and artifact paths.

Proof standards:

- Exercise the real user path (real clicks, keyboard events, and form submissions), never internal React state setters or test-only endpoints.
- Capture both the initial/action state and the resulting state, not only the final screen.
- Check console and page errors on every step. A passing screenshot with an uncaught exception fails verification.
- If a precondition is missing (for example, no seeded admin credentials or no division with matches), report the failure with the exact unmet precondition rather than weakening the check.

## Cleanup

Tear down the isolated server after verification:

```bash
python .agents/skills/verify-kyorbit/scripts/verify-kyorbit.py cleanup --port 3199
```

`cleanup` terminates only the exact PID tree recorded in `.verify-kyorbit/state-3199.json` (`taskkill /PID <pid> /T /F` on Windows, process-group `SIGTERM` on POSIX), removes the state file, and never deletes `.verify-kyorbit/evidence/`. Always confirm the proof files still exist after cleanup.

## Helpers

All commands live in `.agents/skills/verify-kyorbit/scripts/verify-kyorbit.py`:

- `launch --port <PORT> [--cwd <DIR>]` starts Vite with `BETTER_AUTH_URL=http://127.0.0.1:<PORT>`, waits for ready, writes state JSON.
- `doctor --port <PORT>` runs read-only health and Playwright checks.
- `ensure-agent-user --base-url <URL> [--username U --email E --password P --name N]` creates or verifies a Better Auth verification account.
- `capture --url <URL> --out <DIR> --name <SLUG> [--viewport WxH] [--theme both|light|dark]` saves light and dark `.png` screenshots (default `both`), `.aria.txt`, and `.console.json`.
- `drive-scoreboard --base-url <URL> --out <DIR>` exercises `/` desktop scoreboard and saves before/after proof.
- `drive-bracket --base-url <URL> [--tournament-id ID] --out <DIR> [--username U --password P | --storage-state PATH]` exercises login, Brackets tab, `<canvas data-bracket-canvas>`, `Two-sided layout`, `One-sided layout`, zoom/fit, and `Capture bracket screenshot` dialog.
- `cleanup --port <PORT>` stops only the started server PID and removes scratch state while preserving evidence.
