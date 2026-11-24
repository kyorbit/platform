# Authentication and dashboard gate

Authentication uses Better Auth username and password sign-in on `/login` and guards all `/dashboard` and `/dashboard/tournaments/$id/builder` routes with `requireSession`.

## Sub-features

- `auth-login-form` renders `Username`, `Password`, and `Continue` controls on `/login`.
- `auth-dashboard-gate` redirects unauthenticated requests for `/dashboard` to `/login`.

## How to get to it (user POV)

- Open `/login` directly.
- Open `/dashboard` while signed out to trigger the session redirect.

## Driving it with verify-kyorbit

Preconditions:

- `verify-kyorbit doctor --port 3199` returns `ok: true`.

- **Verify login form and dashboard gate.** Run `python .agents/skills/verify-kyorbit/scripts/verify-kyorbit.py drive-scoreboard --base-url http://127.0.0.1:3199 --out .verify-kyorbit/evidence/auth-run`. The script verifies `Username`, `Password`, and `Continue` on `/login`, saves `02-login-page.png`, navigates to `/dashboard`, confirms redirect to `/login`, and saves `03-dashboard-auth-gate.png`.
- **Check proof.** Inspect `summary.json` for `redirectedToLogin: true` and `errorCount: 0`.

## Gotchas

- `LoginForm` authenticates by `username`, not email (`authClient.signIn.username`).
- Never commit `.storage-state.json` or admin passwords into the repository or evidence files.
- On the current `staging` checkout, loading `/login` logs a pre-existing React warning (`Invalid DOM property crossorigin`) and a `pageerror` (`Cannot read properties of null (reading 'append')`). The harness records these in `.console.json` and reports `ok: false` until fixed rather than hiding them.
