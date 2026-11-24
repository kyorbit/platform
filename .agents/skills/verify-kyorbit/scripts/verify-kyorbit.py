#!/usr/bin/env python3
"""Playwright verification harness for Kyorbit."""

from __future__ import annotations

import argparse
import json
import os
import signal
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any


ROOT_DIR = Path(__file__).resolve().parents[4]
STATE_DIR = ROOT_DIR / ".verify-kyorbit"


def state_path(port: int) -> Path:
    return STATE_DIR / f"state-{port}.json"


def http_get(url: str, timeout: float = 5.0) -> tuple[int, str]:
    req = urllib.request.Request(url, headers={"Accept": "text/html"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.status, resp.read().decode("utf-8", errors="replace")


def pid_alive(pid: int) -> bool:
    if pid <= 0:
        return False
    if os.name == "nt":
        proc = subprocess.run(
            ["tasklist", "/FI", f"PID eq {pid}", "/FO", "CSV", "/NH"],
            capture_output=True,
            text=True,
            check=False,
        )
        return str(pid) in proc.stdout
    try:
        os.kill(pid, 0)
        return True
    except OSError:
        return False


def kill_pid_tree(pid: int) -> None:
    if not pid_alive(pid):
        return
    if os.name == "nt":
        subprocess.run(
            ["taskkill", "/PID", str(pid), "/T", "/F"],
            capture_output=True,
            text=True,
            check=False,
        )
    else:
        try:
            os.killpg(os.getpgid(pid), signal.SIGTERM)
        except ProcessLookupError:
            return
        for _ in range(20):
            if not pid_alive(pid):
                return
            time.sleep(0.1)
        try:
            os.killpg(os.getpgid(pid), signal.SIGKILL)
        except ProcessLookupError:
            pass


def cmd_launch(args: argparse.Namespace) -> int:
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    sp = state_path(args.port)
    if sp.exists():
        existing = json.loads(sp.read_text(encoding="utf-8"))
        if pid_alive(int(existing.get("pid", -1))):
            print(
                f"Refusing to launch: state file {sp} points to live PID {existing['pid']}. Run cleanup first.",
                file=sys.stderr,
            )
            return 1

    log_file = STATE_DIR / f"server-{args.port}.log"
    base_url = f"http://127.0.0.1:{args.port}"
    cwd = Path(args.cwd).resolve() if args.cwd else ROOT_DIR

    cmd = [
        "bunx",
        "vite",
        "dev",
        "--port",
        str(args.port),
        "--strictPort",
        "--host",
        "127.0.0.1",
    ]
    log_fh = log_file.open("wb")
    env = os.environ.copy()
    env["BETTER_AUTH_URL"] = base_url
    popen_kwargs: dict[str, Any] = {
        "cwd": str(cwd),
        "env": env,
        "stdout": log_fh,
        "stderr": subprocess.STDOUT,
    }
    if os.name == "nt":
        popen_kwargs["creationflags"] = subprocess.CREATE_NEW_PROCESS_GROUP
    else:
        popen_kwargs["start_new_session"] = True

    proc = subprocess.Popen(cmd, **popen_kwargs)
    log_fh.close()

    state = {
        "pid": proc.pid,
        "port": args.port,
        "baseUrl": base_url,
        "cwd": str(cwd),
        "logFile": str(log_file),
        "startedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    sp.write_text(json.dumps(state, indent=2), encoding="utf-8")

    deadline = time.time() + args.timeout
    last_error = "server did not respond"
    while time.time() < deadline:
        if proc.poll() is not None:
            print(f"Vite exited early with code {proc.returncode}. See {log_file}", file=sys.stderr)
            return 1
        try:
            home_status, home_body = http_get(f"{base_url}/", timeout=15.0)
            login_status, login_body = http_get(f"{base_url}/login", timeout=15.0)
            if (
                home_status == 200
                and login_status == 200
                and "<html" in home_body.lower()
                and "<html" in login_body.lower()
            ):
                print(json.dumps({"ok": True, **state}, indent=2))
                return 0
            last_error = f"HTTP {home_status}/{login_status}"
        except Exception as exc:  # noqa: BLE001
            last_error = str(exc)
        time.sleep(0.5)

    kill_pid_tree(proc.pid)
    sp.unlink(missing_ok=True)
    print(f"Timed out waiting for {base_url} ({last_error}). See {log_file}", file=sys.stderr)
    return 1


def cmd_doctor(args: argparse.Namespace) -> int:
    sp = state_path(args.port)
    checks: dict[str, Any] = {"port": args.port, "stateFile": str(sp)}
    if not sp.exists():
        checks["ok"] = False
        checks["error"] = "State file missing. Run launch first."
        print(json.dumps(checks, indent=2))
        return 1

    state = json.loads(sp.read_text(encoding="utf-8"))
    pid = int(state["pid"])
    base_url = state["baseUrl"]
    checks["pid"] = pid
    checks["pidAlive"] = pid_alive(pid)
    checks["baseUrl"] = base_url

    if not checks["pidAlive"]:
        checks["ok"] = False
        checks["error"] = f"Recorded PID {pid} is not running."
        print(json.dumps(checks, indent=2))
        return 1

    try:
        home_status, _ = http_get(f"{base_url}/", timeout=5.0)
        login_status, _ = http_get(f"{base_url}/login", timeout=5.0)
        checks["homeStatus"] = home_status
        checks["loginStatus"] = login_status
    except Exception as exc:  # noqa: BLE001
        checks["ok"] = False
        checks["error"] = f"HTTP check failed: {exc}"
        print(json.dumps(checks, indent=2))
        return 1

    try:
        from playwright.sync_api import sync_playwright

        with sync_playwright() as p:
            browser = p.chromium.launch()
            checks["chromiumVersion"] = browser.version
            browser.close()
    except Exception as exc:  # noqa: BLE001
        checks["ok"] = False
        checks["error"] = f"Playwright Chromium check failed: {exc}"
        print(json.dumps(checks, indent=2))
        return 1

    checks["ok"] = checks["homeStatus"] == 200 and checks["loginStatus"] == 200
    print(json.dumps(checks, indent=2))
    return 0 if checks["ok"] else 1


def apply_theme(page: Any, theme: str) -> None:
    is_dark = theme == "dark"
    page.emulate_media(color_scheme="dark" if is_dark else "light")
    page.evaluate(
        """(dark) => {
          try { localStorage.setItem('start-theme', dark ? 'dark' : 'light'); } catch {}
          document.documentElement.classList.toggle('dark', dark);
          document.documentElement.classList.toggle('light', !dark);
        }""",
        is_dark,
    )
    page.wait_for_timeout(300)


def save_page_proof(page: Any, out_dir: Path, name: str, errors: list[dict[str, str]]) -> dict[str, str]:
    out_dir.mkdir(parents=True, exist_ok=True)
    png_path = out_dir / f"{name}.png"
    aria_path = out_dir / f"{name}.aria.txt"
    console_path = out_dir / f"{name}.console.json"

    page.screenshot(path=str(png_path), full_page=False)
    try:
        aria_snapshot = page.locator("body").aria_snapshot()
    except Exception as exc:  # noqa: BLE001
        aria_snapshot = f"aria_snapshot unavailable: {exc}"
    aria_path.write_text(aria_snapshot, encoding="utf-8")
    console_path.write_text(
        json.dumps({"url": page.url, "title": page.title(), "errors": list(errors)}, indent=2),
        encoding="utf-8",
    )
    return {
        "screenshot": str(png_path.resolve()),
        "aria": str(aria_path.resolve()),
        "console": str(console_path.resolve()),
    }


def save_dual_theme_proof(
    page: Any, out_dir: Path, name: str, errors: list[dict[str, str]]
) -> dict[str, Any]:
    out_dir.mkdir(parents=True, exist_ok=True)
    apply_theme(page, "light")
    light_png = out_dir / f"{name}-light.png"
    page.screenshot(path=str(light_png), full_page=False)

    apply_theme(page, "dark")
    dark_png = out_dir / f"{name}-dark.png"
    page.screenshot(path=str(dark_png), full_page=False)

    # Restore light mode as the default working state between steps
    apply_theme(page, "light")

    aria_path = out_dir / f"{name}.aria.txt"
    console_path = out_dir / f"{name}.console.json"
    try:
        aria_snapshot = page.locator("body").aria_snapshot()
    except Exception as exc:  # noqa: BLE001
        aria_snapshot = f"aria_snapshot unavailable: {exc}"
    aria_path.write_text(aria_snapshot, encoding="utf-8")
    console_path.write_text(
        json.dumps({"url": page.url, "title": page.title(), "errors": list(errors)}, indent=2),
        encoding="utf-8",
    )
    return {
        "lightScreenshot": str(light_png.resolve()),
        "darkScreenshot": str(dark_png.resolve()),
        "aria": str(aria_path.resolve()),
        "console": str(console_path.resolve()),
    }


def parse_viewport(spec: str) -> dict[str, int]:
    w, h = spec.lower().split("x", 1)
    return {"width": int(w), "height": int(h)}


def attach_error_listeners(page: Any) -> list[dict[str, str]]:
    errors: list[dict[str, str]] = []
    page.on(
        "console",
        lambda msg: errors.append({"type": "console.error", "text": msg.text})
        if msg.type == "error"
        else None,
    )
    page.on("pageerror", lambda err: errors.append({"type": "pageerror", "text": str(err)}))
    return errors


def cmd_capture(args: argparse.Namespace) -> int:
    from playwright.sync_api import sync_playwright

    out_dir = Path(args.out).resolve()
    viewport = parse_viewport(args.viewport)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(viewport=viewport)
        page = context.new_page()
        errors = attach_error_listeners(page)
        page.goto(args.url, wait_until="load", timeout=45000)
        page.wait_for_timeout(1200)
        if args.theme == "both":
            artifacts: dict[str, Any] = save_dual_theme_proof(page, out_dir, args.name, errors)
        else:
            apply_theme(page, args.theme)
            artifacts = save_page_proof(page, out_dir, args.name, errors)
        browser.close()

    result = {"ok": len(errors) == 0, "url": args.url, "errors": errors, "artifacts": artifacts}
    print(json.dumps(result, indent=2))
    return 0 if result["ok"] else 1


def cmd_drive_scoreboard(args: argparse.Namespace) -> int:
    from playwright.sync_api import sync_playwright

    out_dir = Path(args.out).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    steps: list[dict[str, Any]] = []

    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()
        errors = attach_error_listeners(page)

        page.goto(f"{args.base_url}/", wait_until="load", timeout=45000)
        page.wait_for_timeout(1200)
        steps.append(
            {
                "step": "01-scoreboard-initial",
                "feature": "scoreboard-home",
                "artifacts": save_page_proof(page, out_dir, "01-scoreboard-initial", errors),
            }
        )

        # Exercise /login form visibility and capture proof
        page.goto(f"{args.base_url}/login", wait_until="load", timeout=45000)
        username_box = page.get_by_label("Username")
        password_box = page.get_by_label("Password")
        continue_btn = page.get_by_role("button", name="Continue")
        username_box.wait_for(state="visible", timeout=15000)
        password_box.wait_for(state="visible", timeout=15000)
        continue_btn.wait_for(state="visible", timeout=15000)

        steps.append(
            {
                "step": "02-login-page",
                "feature": "auth-login",
                "artifacts": save_page_proof(page, out_dir, "02-login-page", errors),
            }
        )

        # Verify unauthenticated /dashboard redirects to /login
        page.goto(f"{args.base_url}/dashboard", wait_until="load", timeout=45000)
        page.wait_for_url(lambda url: "/login" in url, timeout=15000)
        page.wait_for_timeout(400)
        redirected_to_login = "/login" in page.url
        steps.append(
            {
                "step": "03-dashboard-auth-gate",
                "feature": "auth-login",
                "redirectedToLogin": redirected_to_login,
                "finalUrl": page.url,
                "artifacts": save_page_proof(page, out_dir, "03-dashboard-auth-gate", errors),
            }
        )
        browser.close()

    summary = {
        "ok": len(errors) == 0 and redirected_to_login,
        "baseUrl": args.base_url,
        "errorCount": len(errors),
        "errors": errors,
        "steps": steps,
    }
    (out_dir / "summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(json.dumps(summary, indent=2))
    return 0 if summary["ok"] else 1


def http_post_json(url: str, payload: dict[str, Any], origin: str) -> tuple[int, str]:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Origin": origin,
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=15.0) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as err:
        return err.code, err.read().decode("utf-8", errors="replace")


def cmd_ensure_agent_user(args: argparse.Namespace) -> int:
    sign_up_status, sign_up_body = http_post_json(
        f"{args.base_url}/api/auth/sign-up/email",
        {
            "email": args.email,
            "password": args.password,
            "name": args.name,
            "username": args.username,
        },
        origin=args.base_url,
    )
    sign_in_status, sign_in_body = http_post_json(
        f"{args.base_url}/api/auth/sign-in/username",
        {
            "username": args.username,
            "password": args.password,
        },
        origin=args.base_url,
    )
    ok = sign_in_status == 200
    result = {
        "ok": ok,
        "username": args.username,
        "email": args.email,
        "signUpStatus": sign_up_status,
        "signInStatus": sign_in_status,
        "signUpError": None if sign_up_status == 200 else sign_up_body[:300],
        "signInError": None if ok else sign_in_body[:300],
    }
    print(json.dumps(result, indent=2))
    return 0 if ok else 1


def cmd_drive_bracket(args: argparse.Namespace) -> int:
    from playwright.sync_api import sync_playwright

    out_dir = Path(args.out).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    steps: list[dict[str, Any]] = []

    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx_kwargs: dict[str, Any] = {"viewport": {"width": 1440, "height": 900}}
        if args.storage_state:
            ctx_kwargs["storage_state"] = args.storage_state
        context = browser.new_context(**ctx_kwargs)
        page = context.new_page()
        errors = attach_error_listeners(page)

        if args.username and args.password:
            page.goto(f"{args.base_url}/login", wait_until="load", timeout=45000)
            page.get_by_label("Username").wait_for(state="visible", timeout=15000)
            page.get_by_label("Username").fill(args.username)
            page.get_by_label("Password").fill(args.password)
            page.get_by_role("button", name="Continue").click()
            page.wait_for_url(lambda url: "/login" not in url, timeout=20000)
            # Clear any pre-existing /login errors before driving the builder
            errors.clear()

        tournament_id = args.tournament_id
        if not tournament_id:
            page.goto(f"{args.base_url}/dashboard/tournaments", wait_until="load", timeout=45000)
            page.wait_for_timeout(1500)
            href = page.evaluate(
                """() => {
                  const links = Array.from(document.querySelectorAll('a[href*="/dashboard/tournaments/"]'));
                  for (const a of links) {
                    const m = a.getAttribute('href')?.match(/\\/dashboard\\/tournaments\\/([0-9a-f-]{36})/i);
                    if (m) return m[1];
                  }
                  return null;
                }"""
            )
            if not href:
                steps.append(
                    {
                        "step": "00-no-tournament",
                        "feature": "bracket-canvas",
                        "artifacts": save_page_proof(page, out_dir, "00-no-tournament", errors),
                    }
                )
                browser.close()
                summary = {
                    "ok": False,
                    "error": "Unmet precondition: no tournament found on /dashboard/tournaments.",
                    "steps": steps,
                }
                (out_dir / "summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
                print(json.dumps(summary, indent=2))
                return 1
            tournament_id = href

        builder_url = f"{args.base_url}/dashboard/tournaments/{tournament_id}/builder?tab=brackets"
        page.goto(builder_url, wait_until="load", timeout=45000)

        if "/login" in page.url:
            steps.append(
                {
                    "step": "00-auth-required",
                    "feature": "bracket-canvas",
                    "artifacts": save_page_proof(page, out_dir, "00-auth-required", errors),
                }
            )
            browser.close()
            summary = {
                "ok": False,
                "error": "Unmet precondition: redirected to /login. Supply --username/--password or --storage-state.",
                "steps": steps,
            }
            (out_dir / "summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
            print(json.dumps(summary, indent=2))
            return 1

        canvas_loc = page.locator("canvas[data-bracket-canvas]")
        try:
            canvas_loc.first.wait_for(state="visible", timeout=20000)
            page.wait_for_timeout(600)
        except Exception:
            page.wait_for_timeout(500)
        canvas_found = canvas_loc.count() > 0
        canvas_box = canvas_loc.first.bounding_box() if canvas_found else None

        steps.append(
            {
                "step": "01-bracket-two-sided",
                "feature": "bracket-canvas",
                "canvasFound": canvas_found,
                "canvasBox": canvas_box,
                "artifacts": save_dual_theme_proof(page, out_dir, "01-bracket-two-sided", errors),
            }
        )

        if canvas_found:
            one_sided_btn = page.get_by_role("radio", name="One-sided layout")
            if one_sided_btn.count() == 0:
                one_sided_btn = page.get_by_role("tab", name="One-sided layout")
            if one_sided_btn.count() == 0:
                one_sided_btn = page.get_by_role("button", name="One-sided layout")
            one_sided_btn.first.click()
            page.wait_for_timeout(500)
            steps.append(
                {
                    "step": "02-bracket-one-sided",
                    "feature": "bracket-canvas",
                    "artifacts": save_dual_theme_proof(page, out_dir, "02-bracket-one-sided", errors),
                }
            )

            two_sided_btn = page.get_by_role("radio", name="Two-sided layout")
            if two_sided_btn.count() == 0:
                two_sided_btn = page.get_by_role("tab", name="Two-sided layout")
            if two_sided_btn.count() == 0:
                two_sided_btn = page.get_by_role("button", name="Two-sided layout")
            two_sided_btn.first.click()
            page.wait_for_timeout(500)
            steps.append(
                {
                    "step": "03-bracket-two-sided-restored",
                    "feature": "bracket-canvas",
                    "artifacts": save_dual_theme_proof(page, out_dir, "03-bracket-two-sided-restored", errors),
                }
            )

            zoom_in = page.get_by_role("button", name="Zoom in")
            fit_btn = page.get_by_role("button", name="Fit bracket to view")
            if fit_btn.count() == 0:
                fit_btn = page.get_by_role("button", name="Fit to view")
            if zoom_in.count() > 0:
                zoom_in.first.click()
                page.wait_for_timeout(250)
            if fit_btn.count() > 0:
                fit_btn.first.click()
                page.wait_for_timeout(250)
            steps.append(
                {
                    "step": "04-bracket-zoom-fit",
                    "feature": "bracket-canvas",
                    "artifacts": save_dual_theme_proof(page, out_dir, "04-bracket-zoom-fit", errors),
                }
            )

            shot_btn = page.get_by_role("button", name="Capture bracket screenshot")
            if shot_btn.count() > 0 and shot_btn.first.is_enabled():
                shot_btn.first.click()
                page.wait_for_timeout(1200)
                steps.append(
                    {
                        "step": "05-bracket-screenshot-dialog",
                        "feature": "bracket-canvas",
                        "artifacts": save_dual_theme_proof(page, out_dir, "05-bracket-screenshot-dialog", errors),
                    }
                )
                page.keyboard.press("Escape")
                page.wait_for_timeout(250)

        browser.close()

    summary = {
        "ok": len(errors) == 0 and canvas_found,
        "baseUrl": args.base_url,
        "tournamentId": tournament_id,
        "canvasFound": canvas_found,
        "errorCount": len(errors),
        "errors": errors,
        "steps": steps,
    }
    (out_dir / "summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(json.dumps(summary, indent=2))
    return 0 if summary["ok"] else 1


def cmd_cleanup(args: argparse.Namespace) -> int:
    sp = state_path(args.port)
    if not sp.exists():
        print(json.dumps({"ok": True, "message": f"No state file at {sp}."}))
        return 0

    state = json.loads(sp.read_text(encoding="utf-8"))
    pid = int(state.get("pid", -1))
    kill_pid_tree(pid)
    alive_after = pid_alive(pid)
    sp.unlink(missing_ok=True)
    result = {
        "ok": not alive_after,
        "port": args.port,
        "killedPid": pid,
        "aliveAfter": alive_after,
        "evidencePreservedDir": str((STATE_DIR / "evidence").resolve()),
    }
    print(json.dumps(result, indent=2))
    return 0 if result["ok"] else 1


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Kyorbit Playwright verification harness")
    sub = parser.add_subparsers(dest="command", required=True)

    p_launch = sub.add_parser("launch")
    p_launch.add_argument("--port", type=int, default=3199)
    p_launch.add_argument("--cwd", type=str, default=None)
    p_launch.add_argument("--timeout", type=float, default=120.0)
    p_launch.set_defaults(func=cmd_launch)

    p_doctor = sub.add_parser("doctor")
    p_doctor.add_argument("--port", type=int, default=3199)
    p_doctor.set_defaults(func=cmd_doctor)

    p_capture = sub.add_parser("capture")
    p_capture.add_argument("--url", required=True)
    p_capture.add_argument("--out", required=True)
    p_capture.add_argument("--name", required=True)
    p_capture.add_argument("--viewport", default="1440x900")
    p_capture.add_argument("--theme", choices=["both", "light", "dark"], default="both")
    p_capture.set_defaults(func=cmd_capture)

    p_sb = sub.add_parser("drive-scoreboard")
    p_sb.add_argument("--base-url", required=True)
    p_sb.add_argument("--out", required=True)
    p_sb.set_defaults(func=cmd_drive_scoreboard)

    p_user = sub.add_parser("ensure-agent-user")
    p_user.add_argument("--base-url", required=True)
    p_user.add_argument("--username", default="verify_agent")
    p_user.add_argument("--email", default="verify-agent@kyorbit.local")
    p_user.add_argument("--password", default="VerifyAgent!2026")
    p_user.add_argument("--name", default="Verify Agent")
    p_user.set_defaults(func=cmd_ensure_agent_user)

    p_br = sub.add_parser("drive-bracket")
    p_br.add_argument("--base-url", required=True)
    p_br.add_argument("--tournament-id", default=None)
    p_br.add_argument("--out", required=True)
    p_br.add_argument("--username", default=None)
    p_br.add_argument("--password", default=None)
    p_br.add_argument("--storage-state", default=None)
    p_br.set_defaults(func=cmd_drive_bracket)

    p_clean = sub.add_parser("cleanup")
    p_clean.add_argument("--port", type=int, default=3199)
    p_clean.set_defaults(func=cmd_cleanup)

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    return int(args.func(args))


if __name__ == "__main__":
    raise SystemExit(main())
