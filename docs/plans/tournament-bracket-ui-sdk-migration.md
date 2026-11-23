# Tournament bracket UI SDK migration plan

This plan rebuilds the Kyorbit tournament bracket as a canvas-based component powered by `@ui-sdk/core`, `@ui-sdk/react`, and the `@ui-sdk/react/agent` bridge.
Tournament admins keep both `one-sided` and `two-sided` layouts, pan and zoom, slot locking, drag and drop, and light-mode PNG export while gaining keyboard navigation and direct AI agent control.
Every PR keeps the single-elimination layout engine in `src/lib/tournament/bracket/bracket-layout/` as the geometry source of truth and deletes legacy DOM bracket code in the same wave that migrates its caller.
The stack runs in five ordered PRs named `PR-1`, `PR-2`, `PR-3`, `PR-4`, and `PR-5`.

## How to read this

One box is one unit of work. Every box names the evidence that checks it. A nested box is a sub-step of the box above it. Check a box only when its evidence exists, a file, a log line, a screenshot, a test run, or a SHA. The body is a how-to. The appendices explain and record.

The program runs `pstack/skills/poteto-mode/playbooks/autopilot-stack.md`. The root appends each verified PR to one base-chained stack and the operator lands the stack bottom-up after review. `PR-3`, `PR-4`, and `PR-5` change user-facing or agent-facing interactions and stop at merge-ready for operator review.

Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

## Program checklist

### Arm the program

- [ ] State the protocol and this plan to the operator, then stop. Start execution only on the operator's explicit go.
- [ ] Read these from trunk at program start. Re-read them at every tick.
  - [ ] `git show origin/main:pstack/skills/poteto-mode/playbooks/autopilot-stack.md`
  - [ ] `git show origin/main:pstack/skills/swarm/SKILL.md`
  - [ ] `git show origin/main:cursor-team-kit/skills/control-ui/SKILL.md`
  - [ ] `git show origin/main:pstack/skills/poteto-mode/playbooks/opening-a-pr.md`
  - [ ] `git show origin/main:pstack/skills/poteto-mode/playbooks/shipping.md`
- [ ] On the operator's go, arm the audit tick as `/loop 1h` with the tick prompt below. Never leave the cadence to memory.
- [ ] Use this tick prompt, verbatim. "Re-read the execution playbook from trunk. Audit the operation against it and fix drift in this tick. Probe every active lane and judge progress by side effects only. Stand down a stuck lane and dispatch its replacement now. Then post a short status message to the operator in chat only when the audit found a tracked change that no earlier status message reported, such as a PR opened, a code-ready head, a round launched or closed, a verdict, a merge, a stuck agent and the action taken, a blocker added or cleared, or a decision only the operator can make. Name every such change and nothing else. Do not repeat a table, the merged list, or an unchanged blocker. If the audit found none, end the turn with no reply text. Either way, log this tick's row in your decision trail. The row names the items reported, or none."
- [ ] On the operator's hold or stand-down, send every owner a zero-writes order at once.

### Spawn owners

- [ ] Spawn one owner per PR with the full lifecycle the execution playbook names.
- [ ] Follow this dependency graph. Start dependent work only after its parent reaches STACK-READY and base each child on its parent branch.
  - [ ] `PR-1` is first and branches from `staging`.
  - [ ] `PR-2` branches from `PR-1`.
  - [ ] `PR-3` branches from `PR-2`.
  - [ ] `PR-4` branches from `PR-3`.
  - [ ] `PR-5` branches from `PR-4`.
- [ ] Hold the file boundaries. `PR-1` touches only `package.json`, `bun.lock`, `src/styles.css`, and `src/test/`. `PR-2` touches only `src/lib/tournament/bracket/bracket-layout/` and `src/components/tournament-bracket/bracket-primitive*`. `PR-3` touches only `src/components/tournament-bracket/` and `src/features/dashboard/lib/tournament/capture-bracket-png*`. `PR-4` touches only `src/features/dashboard/components/tournament/builder/brackets-tab/`, `src/features/dashboard/hooks/`, `src/contexts/bracket/`, and legacy `src/components/tournament-bracket/` files slated for deletion. `PR-5` touches only `src/features/dashboard/lib/tournament/bracket-agent-bridge*`, `src/features/dashboard/components/tournament/builder/brackets-tab/`, and agent tests.
- [ ] Hold the review gate. `PR-3`, `PR-4`, and `PR-5` change interactions. They wait for the operator's review in chat with screenshots and a video before merge.

### PR mechanics, for every PR

- [ ] Resolve the forge once. Default to `gh`; if `command -v origin` succeeds and Origin can resolve the repository, use `origin pr` for every PR operation. Record any fallback to `gh`. Never require `gt`.
- [ ] Open the PR ready, never draft, per **Opening a PR**. Use the run's built-in PR tool when it has one, else `origin pr create --status open --base <base-branch>` or `gh pr create --base <base-branch>` according to the resolved forge. A stack child targets its parent branch.
- [ ] Run `bun run lint` and `bun run typecheck` once before the PR-facing push. Push with hooks on.
- [ ] Run `/deslop` before each commit and `/no-comments` before review.
- [ ] Triage every Bugbot and security-reviewer comment per `../references/bugbot-triage.md`.
- [ ] Rebase onto current parent branch before the STACK-READY report and babysit. Keep that merge base in fix rounds. Only the root rebases or retargets the chain.

### Verdict and merge, for every PR

- [ ] A full swarm runs once, at the code-ready head. Another full swarm runs only for new behavior, a redesign, or a large new diff. A rebase, a merge-conflict resolution, or a minor fix gets a single verifier at the new head. Run each full swarm per `pstack/skills/swarm/SKILL.md`. One gates lane. The ten live lanes from the PR's **Verify, live** block. The perf lane from its **Verify, perf** block. Two or more audit lanes, each with its own focus, that read the diff and the receipts and distrust the PR body. The root audits the receipts in the STACK-READY report before the verdict.
- [ ] Clean only when every lane is `PASS`. Findings go back to the owner, including a defect that a lane filed as a note. A new head gets a fresh verdict, except for results that stay valid under the patch-id rule in `playbooks/shipping.md`.
- [ ] The root appends each clean PR to the base-branch stack in dependency order and keeps hands off once landing starts, applying the patch-id rule from `playbooks/shipping.md` link by link so the operator lands the chain bottom-up.

### Boot recipe, for every live lane

Each live lane runs on its own cloud VM at the PR head. Drive through `control-ui` from `cursor-team-kit`.

- [ ] `git fetch origin <head-branch> && git checkout <head SHA>`.
- [ ] Run `bun install && bun run dev` and wait until `http://localhost:3000` returns HTTP 200. Sign in with the seeded admin account and open `/dashboard/tournaments/<seeded-id>/builder` on the Brackets tab.
- [ ] Deliver input only through `control-ui` commands. Use browser console and DOM queries only as read-only diagnostics.
- [ ] Save every screenshot to `/tmp/swarm-<pr-id>/worker-<n>/<slug>.png` and return the paths with the report.

## Install UI SDK packages and configure test harness (PR-1)

**Depends on.** None.

**Files.**

- [ ] Edit `package.json`.
- [ ] Edit `bun.lock`.
- [ ] Edit `src/styles.css`.
- [ ] Create `src/test/ui-sdk-setup.ts`.
- [ ] Create `src/test/__tests__/ui-sdk-setup.test.ts`.

**Build.**

- [ ] Install `@ui-sdk/core` and `@ui-sdk/react` at matching versions with `bun add @ui-sdk/core @ui-sdk/react`.
- [ ] Add `@layer ui-sdk;` as line 1 of `src/styles.css` above `@import 'tailwindcss';`.
- [ ] Create `src/test/ui-sdk-setup.ts` that declares `globalThis.__UI_SDK_STRICT__ = true`, installs the jsdom stubs required by `ui-sdk` (`showPopover`, `hidePopover`, `getAnimations`, `scrollIntoView`, `checkVisibility`, `getClientRects`, `elementFromPoint`, `elementsFromPoint`, `ResizeObserver`, and the `[popover]` style rule), and registers `afterEach(cleanup)`.
- [ ] Add `src/test/__tests__/ui-sdk-setup.test.ts` (with `// @vitest-environment jsdom`) that verifies `@ui-sdk/core`, `@ui-sdk/react/button`, and `@ui-sdk/react/agent` import cleanly and pass under `__UI_SDK_STRICT__`.

**You see.**

- [ ] `bun run test src/test/__tests__/ui-sdk-setup.test.ts` exits with code 0 and prints passing tests for strict mode and `createAgent().snapshot()`.
- [ ] `bun run build` exits with code 0 and emits CSS with `@layer ui-sdk;` ahead of Tailwind layers.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `src/test/__tests__/ui-sdk-setup.test.ts` checks strict mode, jsdom stubs, and `@ui-sdk/react/agent` snapshot on a rendered `Button`. Run `bun run test src/test/__tests__/ui-sdk-setup.test.ts && bun run typecheck && bun run lint`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `claudeAgent/claude-opus-5-5-medium` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Load the Brackets tab on a 16-athlete division in both trunk and head and confirm existing styles and bracket rendering are unchanged. Save `lane-1-regression.png`. Pass when the bracket renders with zero console errors and identical computed styles for match cards.
- [ ] Lane 2. Verify `@layer ui-sdk;` is the first CSS rule in the loaded stylesheet on `/dashboard/tournaments/<seeded-id>/builder`. Save `lane-2-css-layer.png`. Pass when `document.styleSheets` shows the `ui-sdk` layer ordered before Tailwind utilities.
- [ ] Lane 3. Switch the app to dark mode on the Brackets tab and verify Tailwind theme tokens remain intact. Save `lane-3-dark-mode.png`. Pass when dark surfaces and text match trunk with zero contrast regressions.
- [ ] Lane 4. Switch the app to light mode on the Brackets tab and verify Tailwind theme tokens remain intact. Save `lane-4-light-mode.png`. Pass when light surfaces and text match trunk.
- [ ] Lane 5. Open the Match detail sheet and verify Base UI / Tailwind overlay z-index and styles are unaffected by `@layer ui-sdk;`. Save `lane-5-match-sheet.png`. Pass when the sheet opens cleanly without clipping.
- [ ] Lane 6. Open the Bracket screenshot dialog and generate a PNG preview to confirm `captureBracketPng` still works on PR-1. Save `lane-6-screenshot-dialog.png`. Pass when the preview image renders non-blank.
- [ ] Lane 7. Toggle bracket fullscreen and reveal top and left chrome edges. Save `lane-7-fullscreen.png`. Pass when chrome reveals and hides without style regressions.
- [ ] Lane 8. Toggle layout from `two-sided` to `one-sided` and back on the existing bracket. Save `lane-8-layout-toggle.png`. Pass when both layouts render without errors.
- [ ] Lane 9. Verify the client bundle builds cleanly with `bun run build` and serves without missing chunk or ESM resolution errors in `bun run preview`. Save `lane-9-preview-build.png`. Pass when the preview page loads with HTTP 200 and zero console errors.
- [ ] Lane 10. Verify `/dashboard` and `/dashboard/athletes` render with no Tailwind cascade shift from `@layer ui-sdk;`. Save `lane-10-other-routes.png`. Pass when both routes render cleanly with zero console errors.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Production client JS bundle size (gzipped) and CSS bundle size emitted by `bun run build`, plus Brackets tab cold load FCP in milliseconds.
- [ ] Probe. Run `bun run build` and inspect `.output/public/assets/` sizes, then load the Brackets tab five times interleaved at trunk and head.
- [ ] Baseline. Record trunk gzipped JS size, CSS size, and median Brackets tab FCP first.
- [ ] Rule. PR-1 adds no runtime bracket bundle yet. Fail if main route gzipped JS grows by more than 2 KiB or median FCP regresses by more than 50 ms.

**Review gate.** None. PR-1 is not review-gated.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] The root appends `PR-1` as the stack root and the operator lands it bottom-up.

## Build headless bracket primitive and spatial hit-test index (PR-2)

**Depends on.** PR-1.

**Files.**

- [ ] Create `src/lib/tournament/bracket/bracket-layout/hit-test.ts`.
- [ ] Create `src/lib/tournament/bracket/__test__/bracket-hit-test.test.ts`.
- [ ] Create `src/components/tournament-bracket/bracket-primitive.ts`.
- [ ] Create `src/components/tournament-bracket/__tests__/bracket-primitive.test.ts`.

**Build.**

- [ ] Create `src/lib/tournament/bracket/bracket-layout/hit-test.ts` exporting `hitTestBracket(worldPoint, layout, options)` and `buildMatchIndex(matches)`. Map canvas world coordinates to either `{ kind: 'lock', matchId, side }`, `{ kind: 'slot', matchId, side }`, `{ kind: 'match', matchId }`, or `null` for both `one-sided` and `two-sided` layouts, accounting for the `1.2x` scaled final card and right-wing RTL lock button position.
- [ ] Create `src/components/tournament-bracket/bracket-primitive.ts` using `definePrimitive` from `@ui-sdk/core` with controlled and uncontrolled options for `layoutMode` (`'two-sided' | 'one-sided'`), `selectedMatchId`, and `viewport` (`{ x, y, scale }`), plus data inputs `matches`, `thirdPlaceMatch`, `readOnly`, `athleteMap`, and `matchLabel`.
- [ ] Model slots on `bracketPrimitive` with strict ARIA roles (`root` as `region`, `canvas` as `presentation`, `match` as `group`, `slot` as `button`, `lockButton` as `button`), `createRovingFocus` for arrow navigation across rounds and wings (respecting `isRTL(el)` in `two-sided` mode), `createFocusRecovery` for division switches and bracket regeneration, and `createChange` with shared `ReasonVocabulary` plus custom reasons `'layout-toggle'`, `'viewport-pan'`, `'viewport-zoom'`, `'viewport-fit'`, `'slot-lock'`, and `'slot-assign'`.
- [ ] Declare the `agent` block on `bracketPrimitive` exposing `actions` (`['selectMatch', 'setLayoutMode', 'toggleSlotLock', 'assignSlot', 'swapSlots', 'swapParticipants', 'zoomIn', 'zoomOut', 'fitView', 'focusMatch']`) and `items(api)` returning `{ value, label }` for every match slot so agents can discover match and corner targets from `snapshot()` or `query()`.
- [ ] Write `bracket-hit-test.test.ts` and `bracket-primitive.test.ts` using `mount`, `checkServer`, and `checkDirection` from `@ui-sdk/core/testing`, including mutation checks that break each key behavior and confirm tests fail.

**You see.**

- [ ] `bun run test src/lib/tournament/bracket/__test__/bracket-hit-test.test.ts src/components/tournament-bracket/__tests__/bracket-primitive.test.ts` exits with code 0 with all keyboard, focus recovery, SSR, RTL, and hit-test assertions passing.
- [ ] `checkServer(bracketPrimitive, ...)` and `checkDirection(bracketPrimitive, ...)` pass under `__UI_SDK_STRICT__ = true`.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `bracket-hit-test.test.ts` covers `one-sided` and `two-sided` slot, lock, final-card, third-place, and empty-space hit tests. `bracket-primitive.test.ts` covers arrow navigation, Enter and Space activation, `L` lock shortcut, focus recovery on match removal, controlled and uncontrolled `layoutMode` and `selectedMatchId`, `checkServer`, `checkDirection`, and `details.source === 'agent'` cancellation. Run `bun run test src/lib/tournament/bracket/__test__/bracket-hit-test.test.ts src/components/tournament-bracket/__tests__/bracket-primitive.test.ts && bun run typecheck && bun run lint`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `claudeAgent/claude-opus-5-5-medium` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Load the Brackets tab in trunk and head and confirm the existing DOM bracket still renders untouched because PR-2 adds only unmounted primitive modules. Save `lane-1-regression.png`. Pass when the Brackets tab matches trunk with zero console errors.
- [ ] Lane 2. Run a browser probe in Vite dev server importing `bracketPrimitive` and verify `mount` + `ArrowRight` / `ArrowLeft` moves roving focus across rounds in `two-sided` mode. Save `lane-2-two-sided-keys.png`. Pass when focus moves from left-wing round 0 to center final to right-wing round 0.
- [ ] Lane 3. Run the same browser probe in `one-sided` mode and verify `ArrowRight` / `ArrowLeft` moves strictly left-to-right across rounds. Save `lane-3-one-sided-keys.png`. Pass when focus visits each round in order.
- [ ] Lane 4. Press `ArrowUp` and `ArrowDown` inside a round column and confirm roving focus steps between adjacent slots without scrolling the page. Save `lane-4-vertical-keys.png`. Pass when active element advances by one slot and `window.scrollY` stays 0.
- [ ] Lane 5. Press `Enter` and `Space` on a focused slot and verify `selectedMatchId` updates with `reason: 'item-press'` and `source: 'keyboard'`. Save `lane-5-slot-activate.png`. Pass when callback log records the expected reason and source.
- [ ] Lane 6. Press `L` on a focused slot with `readOnly: false` and with `readOnly: true`. Save `lane-6-lock-shortcut.png`. Pass when `onToggleLock` fires only when `readOnly` is false.
- [ ] Lane 7. Remove the focused match from `matches` while focused and confirm `createFocusRecovery` moves focus to the nearest remaining slot. Save `lane-7-focus-recovery.png`. Pass when `document.activeElement` stays inside the bracket root.
- [ ] Lane 8. Switch `dir="rtl"` on the container and verify `ArrowLeft` and `ArrowRight` reverse as expected under `isRTL`. Save `lane-8-rtl-direction.png`. Pass when focus moves in visual reading order.
- [ ] Lane 9. Verify `hitTestBracket` in the browser against rendered bounding coordinates for a 32-athlete `two-sided` bracket including the scaled final and third-place match. Save `lane-9-hit-test-two-sided.png`. Pass when 100 percent of slot centers and lock button centers resolve to the exact match and side.
- [ ] Lane 10. Call `bracketPrimitive` agent actions (`selectMatch`, `setLayoutMode`, `fitView`) through a mounted instance and verify `details.source === 'agent'` and `details.cancel()` refuses a blocked change. Save `lane-10-agent-api.png`. Pass when allowed actions update state and cancelled actions leave state unchanged.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. `hitTestBracket` lookup latency over a 64-athlete division (63 main matches plus third-place match) and `buildMatchIndex` construction time.
- [ ] Probe. Run a Vitest bench or Node timing script calling `buildMatchIndex` once and `hitTestBracket` 10,000 times on trunk (no-op baseline noted) and head.
- [ ] Baseline. Trunk lacks `hitTestBracket` and `bracketPrimitive`; record that fact and record baseline `buildTwoSidedLayout` time on 64 athletes.
- [ ] Rule. `buildMatchIndex` must stay under 1 ms and `hitTestBracket` p99 must stay under 0.05 ms per pointer event on a 64-athlete bracket.

**Review gate.** None. PR-2 is not review-gated.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto `PR-1` after the verdict, patch-id unchanged.
- [ ] The root appends `PR-2` on top of `PR-1` in the base-branch stack.

## Build Canvas 2D renderer, React parts adapter, and direct PNG export (PR-3)

**Depends on.** PR-2.

**Files.**

- [ ] Create `src/components/tournament-bracket/canvas-theme.ts`.
- [ ] Create `src/components/tournament-bracket/canvas-renderer.ts`.
- [ ] Create `src/components/tournament-bracket/bracket-parts.tsx`.
- [ ] Create `src/components/tournament-bracket/bracket-canvas-view.tsx`.
- [ ] Create `src/components/tournament-bracket/export-bracket-png.ts`.
- [ ] Create `src/components/tournament-bracket/__tests__/bracket-canvas-view.test.tsx`.

**Build.**

- [ ] Create `src/components/tournament-bracket/canvas-theme.ts` that resolves CSS variables from `getComputedStyle(rootEl)` into concrete Canvas 2D colors for light and dark modes (card fill, border, pending/active/complete stroke, red and blue corner accents, winner tint, locked amber text, focus ring, selection ring, drop-target ring, and Geist font family). Provide a static light-mode palette constant for PNG export.
- [ ] Create `src/components/tournament-bracket/canvas-renderer.ts` exporting `drawBracketCanvas(ctx, scene)` using `new Path2D(connector.d)` for connectors, DPR-scaled camera transforms, standard and `1.2x` final match cards with diamond accents, right-wing RTL alignment in `two-sided` mode, round and third-place labels, athlete names and feeder placeholders (`Winner {n}` / `Open`), scores, lock icons, hover/focus/selection rings, and drag-over slot highlights.
- [ ] Create `src/components/tournament-bracket/bracket-parts.tsx` (`"use client"`) calling `createParts(bracketPrimitive, ...)` from `@ui-sdk/react/primitive` with no key handlers, focus moves, or ARIA in the adapter.
- [ ] Create `src/components/tournament-bracket/bracket-canvas-view.tsx` composing `<canvas aria-hidden="true">` with the semantic `bracket-parts.tsx` slot layer so screen readers, keyboard users, and `@ui-sdk/react/agent` see every match, slot, and lock control while `<canvas>` paints at 60 fps via a dirty-flag `requestAnimationFrame` loop. Implement pointer pan, wheel zoom at cursor, two-finger pinch zoom, auto-fit on division or layout change, and hit-tested click/hover/lock dispatch into `bracketPrimitive`.
- [ ] Create `src/components/tournament-bracket/export-bracket-png.ts` exporting `renderBracketToPng(options)` that renders the full bracket at `pixelRatio: 2` onto an offscreen `<canvas>` with the light-mode theme, tight content crop, and `48px` white padding, returning a PNG `Blob` and data URL without `html-to-image` or iframe cloning.
- [ ] Write `src/components/tournament-bracket/__tests__/bracket-canvas-view.test.tsx` (jsdom with `src/test/ui-sdk-setup.ts`) testing both `one-sided` and `two-sided` renders, accessible names for every slot and lock button, keyboard focus and activation, layout switching, and `createAgent().snapshot()` visibility.

**You see.**

- [ ] `bun run test src/components/tournament-bracket/__tests__/bracket-canvas-view.test.tsx` exits with code 0 with zero `__UI_SDK_STRICT__` warnings.
- [ ] Rendering `BracketCanvasView` in a browser paints crisp DPR-scaled connectors and cards in both `one-sided` and `two-sided` layouts, and `renderBracketToPng` outputs a non-empty light-mode PNG data URL.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `bracket-canvas-view.test.tsx` verifies `one-sided` and `two-sided` rendering, canvas draw calls, accessible names, keyboard selection, lock toggle, and `createAgent().snapshot()` labels. Run `bun run test src/components/tournament-bracket/__tests__/bracket-canvas-view.test.tsx && bun run typecheck && bun run lint`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `claudeAgent/claude-opus-5-5-medium` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Load the Brackets tab in trunk and compare visual layout geometry against a head dev preview of `BracketCanvasView` on the same 16-athlete `two-sided` division. Save `lane-1-two-sided-parity.png`. Pass when round columns, connectors, final scale, and third-place placement match trunk geometry.
- [ ] Lane 2. Render `BracketCanvasView` in `one-sided` layout on a 16-athlete division. Save `lane-2-one-sided-parity.png`. Pass when all rounds read left-to-right and the final trunk attaches cleanly to the `1.2x` final card.
- [ ] Lane 3. Render `BracketCanvasView` in dark mode and toggle to light mode live without remounting. Save `lane-3-theme-switch.png`. Pass when canvas colors update within one frame and text contrast meets 4.5 to 1.
- [ ] Lane 4. Pan with mouse drag and zoom with mouse wheel at cursor, then trigger `fitView`. Save `lane-4-pan-zoom-fit.png`. Pass when canvas translates and zooms smoothly around cursor and `fitView` restores full bracket framing.
- [ ] Lane 5. Click a match slot and click a slot lock icon on `<canvas>` in both left wing and right wing (RTL). Save `lane-5-click-and-lock.png`. Pass when slot click selects the match and lock click toggles only that corner without opening the match sheet.
- [ ] Lane 6. Tab into `BracketCanvasView` and navigate across rounds and wings using arrow keys, observing the canvas focus ring. Save `lane-6-keyboard-focus-ring.png`. Pass when the visible canvas focus ring tracks `document.activeElement` on every key press.
- [ ] Lane 7. Render a 64-athlete division in `two-sided` layout and pan across all quadrants. Save `lane-7-64-athletes.png`. Pass when all 63 matches plus third-place match render cleanly with zero clipped labels.
- [ ] Lane 8. Render a 2-athlete (final-only) division and a 4-athlete division with third-place match enabled. Save `lane-8-small-divisions.png`. Pass when both edge-case bracket shapes paint without NaN transforms or stray connectors.
- [ ] Lane 9. Invoke `renderBracketToPng` from dark mode and display the resulting PNG in an `<img>`. Save `lane-9-png-export.png`. Pass when the exported PNG has a solid white background, light-mode card colors, crisp 2x text, and full bracket bounds.
- [ ] Lane 10. Inspect `canvas` idle frame activity for 3 seconds with no pointer or state changes. Save `lane-10-idle-frames.png`. Pass when zero `requestAnimationFrame` paint callbacks execute while idle.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Frame render time (ms per frame) during continuous pan and zoom on a 64-athlete `two-sided` division, plus PNG export time (ms).
- [ ] Probe. Run an interleaved browser script on trunk (DOM bracket + `captureBracketPng`) and head (`BracketCanvasView` + `renderBracketToPng`) executing 120 pan/zoom frames and 3 PNG exports on the same 64-athlete division.
- [ ] Baseline. Record trunk median frame time, p95 frame time, and median `captureBracketPng` duration first.
- [ ] Rule. Head p95 frame time must stay under 16.6 ms (60 fps) and be at least as fast as trunk. `renderBracketToPng` median time must be under 250 ms and faster than trunk `captureBracketPng`.

**Review gate.** The operator reviews before merge.

- [ ] Copy lane 1, lane 2, lane 3, and lane 9 screenshots into `/tmp/review-media/PR-3-review-parity.png`, `/tmp/review-media/PR-3-review-one-sided.png`, `/tmp/review-media/PR-3-review-theme.png`, and `/tmp/review-media/PR-3-review-png-export.png`.
- [ ] Record a 30 to 60 second video of pan, zoom, 1-sided and 2-sided switching, keyboard navigation, and PNG export on a lane VM. Save it as `/tmp/review-media/PR-3-review.mp4`.
- [ ] Post the screenshots and the video in chat. Stop at merge-ready. Wait for the operator's click.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto `PR-2` after the verdict, patch-id unchanged.
- [ ] The root appends `PR-3` on top of `PR-2` in the base-branch stack.

## Migrate dashboard brackets-tab, bridge DnD, and delete legacy DOM bracket (PR-4)

**Depends on.** PR-3.

**Files.**

- [ ] Edit `src/components/tournament-bracket/bracket.tsx`.
- [ ] Edit `src/features/dashboard/components/tournament/builder/brackets-tab/bracket-canvas.tsx`.
- [ ] Edit `src/features/dashboard/components/tournament/builder/brackets-tab/bracket-layout-toggle.tsx`.
- [ ] Edit `src/features/dashboard/components/tournament/builder/brackets-tab/bracket-view-toolbar.tsx`.
- [ ] Edit `src/features/dashboard/components/tournament/builder/brackets-tab/bracket-screenshot-dialog.tsx`.
- [ ] Edit `src/features/dashboard/hooks/use-brackets-tab-dnd.ts`.
- [ ] Edit `src/features/dashboard/contexts/bracket-chrome/context.ts`.
- [ ] Edit `src/features/dashboard/contexts/bracket-chrome/provider.tsx`.
- [ ] Edit `src/features/dashboard/lib/tournament/capture-bracket-png.ts`.
- [ ] Delete `src/components/tournament-bracket/bracket-connectors.tsx`.
- [ ] Delete `src/components/tournament-bracket/bracket-final-match-node.tsx`.
- [ ] Delete `src/components/tournament-bracket/bracket-match-node-frame.tsx`.
- [ ] Delete `src/components/tournament-bracket/bracket-match-node.tsx`.
- [ ] Delete `src/components/tournament-bracket/bracket-round-labels.tsx`.
- [ ] Delete `src/components/tournament-bracket/bracket-slot.tsx`.
- [ ] Delete `src/contexts/bracket/context.ts`.
- [ ] Delete `src/contexts/bracket/provider.tsx`.
- [ ] Delete `src/contexts/bracket/use-bracket.ts`.
- [ ] Delete `src/contexts/bracket/index.ts`.
- [ ] Delete `src/features/dashboard/hooks/use-pan-zoom.ts`.
- [ ] Create `src/features/dashboard/components/tournament/builder/brackets-tab/__tests__/bracket-canvas.test.tsx`.

**Build.**

- [ ] Replace `src/components/tournament-bracket/bracket.tsx` to export the new `BracketCanvasView` backed by `bracketPrimitive` and remove all references to `BracketProvider` and legacy DOM subcomponents.
- [ ] Update `BracketCanvas` (`bracket-canvas.tsx`) to mount the new `Bracket`, connect controlled `layoutMode` (`useBracketCanvasLayout`), `selectedMatchId` (from `useTournamentBracket`), and `viewport` actions (`zoomIn`, `zoomOut`, `fitView`) exposed to `BracketViewToolbar`.
- [ ] Rebuild `BracketLayoutToggle` and `BracketViewToolbar` controls using `@ui-sdk/react` primitives (`Button`, `ToggleGroup` or `Tabs`) with unique accessible names (`Two-sided layout`, `One-sided layout`, `Zoom in`, `Zoom out`, `Fit bracket to view`, `Capture bracket screenshot`, `Toggle bracket fullscreen`) so both keyboard users and agents can target every control cleanly.
- [ ] Bridge `@dnd-kit/core` in `bracket-canvas.tsx` and `use-brackets-tab-dnd.ts` so dragging a `PanelAthleteRow` over `<canvas>` highlights the hit-tested round-0 slot and calls `useAssignSlot`, dragging from a canvas slot to `DivisionsPanel` unassigns the athlete, dragging across round-0 slots calls `useSwapSlots`, and dragging between opposite corners of an unlocked upper-round match calls `useSwapParticipants`.
- [ ] Replace `captureBracketPng` and `BracketScreenshotDialog` target handling to call `renderBracketToPng` directly instead of `html-to-image` DOM cloning. Remove `html-to-image` from `package.json` if no other file imports it.
- [ ] Delete all legacy DOM bracket components, `src/contexts/bracket/*`, and `src/features/dashboard/hooks/use-pan-zoom.ts`.
- [ ] Write `bracket-canvas.test.tsx` covering layout switching (`one-sided` and `two-sided`), toolbar zoom and fit, match selection opening `MatchDetailPanel`, slot lock toggling, and DnD slot assignment and swap callbacks.

**You see.**

- [ ] `bun run test` passes across the entire repository with zero references to deleted legacy bracket files.
- [ ] Opening `/dashboard/tournaments/<id>/builder` renders the `<canvas>` bracket inside `BracketsTab` with working pan/zoom, layout toggle, fullscreen, screenshot export, match detail sheet, and drag-and-drop.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `bracket-canvas.test.tsx` and `bracket-toolbar.test.tsx` pass alongside all existing bracket layout and progression tests. Run `bun run test && bun run typecheck && bun run lint`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `claudeAgent/claude-opus-5-5-medium` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Load the Brackets tab on a 16-athlete division at trunk and head, click a match, and verify `MatchDetailPanel` opens with matching athlete names and scores. Save `lane-1-regression-select.png`. Pass when the panel displays the exact selected match and zero console errors occur.
- [ ] Lane 2. Toggle layout between `Two-sided layout` and `One-sided layout`, reload the page, and confirm persistence in `localStorage` (`tku-bracket-canvas-layout`). Save `lane-2-layout-persist.png`. Pass when the chosen layout survives reload and auto-fits.
- [ ] Lane 3. Drag an unassigned athlete from `DivisionsPanel` onto an open round-0 canvas slot. Save `lane-3-dnd-assign.png`. Pass when the drop target highlights during drag and the athlete renders inside that slot after drop.
- [ ] Lane 4. Drag an assigned athlete from a round-0 canvas slot back to `DivisionsPanel`. Save `lane-4-dnd-unassign.png`. Pass when the slot returns to `Open` and the athlete reappears in the panel pool.
- [ ] Lane 5. Drag an assigned athlete from one unlocked round-0 slot onto another unlocked round-0 slot. Save `lane-5-dnd-swap-slots.png`. Pass when the two slots exchange athletes.
- [ ] Lane 6. Drag one corner onto the opposite corner of an unlocked upper-round match (`round > 0`). Save `lane-6-dnd-corner-swap.png`. Pass when `cornersSwapped` flips and feeder labels swap sides.
- [ ] Lane 7. Toggle a slot lock icon directly on the canvas and attempt to drag that locked slot. Save `lane-7-slot-lock.png`. Pass when the lock icon turns amber and dragging the locked slot is prevented.
- [ ] Lane 8. Click `Zoom in`, `Zoom out`, and `Fit bracket to view` in `BracketViewToolbar`, then toggle `Toggle bracket fullscreen` and press `Escape`. Save `lane-8-toolbar-fullscreen.png`. Pass when every toolbar button updates the canvas and `Escape` exits fullscreen.
- [ ] Lane 9. Click `Capture bracket screenshot` from dark mode and verify the preview dialog renders a light-mode PNG and Copy/Save work without closing the dialog. Save `lane-9-screenshot-dialog.png`. Pass when the preview image loads with white background and clean bounds.
- [ ] Lane 10. Switch between two divisions in `DivisionsTabsHeader` and verify canvas auto-fits and focus recovers cleanly. Save `lane-10-division-switch.png`. Pass when the new division renders fitted with zero stale nodes from the prior division.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. End-to-end Brackets tab interaction latency (layout switch + fit frame time, continuous pan/zoom FPS on a 32-athlete division, and DOM node count inside `[data-slot="bracket-root"]`).
- [ ] Probe. Run an interleaved browser script on trunk and head measuring DOM node count, layout toggle frame time, and 120-frame pan/zoom p95 frame time.
- [ ] Baseline. Record trunk DOM node count, layout toggle frame time, and pan/zoom p95 frame time first.
- [ ] Rule. Head pan/zoom p95 frame time must stay under 16.6 ms and layout toggle must complete within 32 ms. Fail if head DOM node count exceeds trunk or p95 frame time regresses.

**Review gate.** The operator reviews before merge.

- [ ] Copy lane 1, lane 3, lane 6, and lane 9 screenshots into `/tmp/review-media/PR-4-review-select.png`, `/tmp/review-media/PR-4-review-dnd.png`, `/tmp/review-media/PR-4-review-corner-swap.png`, and `/tmp/review-media/PR-4-review-screenshot.png`.
- [ ] Record a 30 to 60 second video of dragging athletes onto canvas slots, swapping corners, locking slots, switching 1-sided and 2-sided layouts, and taking a bracket screenshot on a lane VM. Save it as `/tmp/review-media/PR-4-review.mp4`.
- [ ] Post the screenshots and the video in chat. Stop at merge-ready. Wait for the operator's click.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto `PR-3` after the verdict, patch-id unchanged.
- [ ] The root appends `PR-4` on top of `PR-3` in the base-branch stack.

## Wire UI SDK agent bridge, confirmation gates, and WebMCP registration (PR-5)

**Depends on.** PR-4.

**Files.**

- [ ] Create `src/features/dashboard/lib/tournament/bracket-agent-bridge.ts`.
- [ ] Create `src/features/dashboard/components/tournament/builder/brackets-tab/agent-confirm-dialog.tsx`.
- [ ] Edit `src/features/dashboard/components/tournament/builder/brackets-tab/index.tsx`.
- [ ] Edit `src/features/dashboard/components/tournament/builder/brackets-tab/bracket-toolbar.tsx`.
- [ ] Edit `src/features/dashboard/components/tournament/builder/brackets-tab/match-detail-panel/index.tsx`.
- [ ] Create `src/features/dashboard/components/tournament/builder/brackets-tab/__tests__/bracket-agent-bridge.test.tsx`.

**Build.**

- [ ] Create client-only `src/features/dashboard/lib/tournament/bracket-agent-bridge.ts` (`"use client"`) that creates the singleton `@ui-sdk/react/agent` bridge via `createAgent({ allow })`, re-exports `agentTools` for in-app LLM tool routing, and exports `mountBracketAgentTools(onConfirm)` which calls `registerTools(agent, { allow: () => true })` for WebMCP (`document.modelContext`) and returns the unregister cleanup.
- [ ] Add `data-agent-confirm` attributes with plain human-facing descriptions on destructive controls in `BracketToolbar` and `MatchDetailPanel` (`Regenerate bracket`, `Reset bracket`, `Delete custom match`, and status downgrade confirm button) and ensure confirm buttons have distinct labels from their triggers. Mark decorative or internal regions with `aria-hidden="true"` or `data-agent-hidden` so `agent.snapshot()` has zero unnamed entries.
- [ ] Ensure every agent-usable control in `BracketsTab` (layout toggle, zoom/fit/screenshot/fullscreen buttons, bracket slots and lock toggles, toolbar actions, and match detail actions) is a `@ui-sdk/react` component or custom `bracketPrimitive` part with a unique accessible name.
- [ ] Mount `AgentConfirmDialog` and `mountBracketAgentTools` in `BracketsTab` (`brackets-tab/index.tsx`) so any `data-agent-confirm` step pauses for operator approval or denial via `allow(step, { signal })`.
- [ ] Write `bracket-agent-bridge.test.tsx` (jsdom with `src/test/ui-sdk-setup.ts`) implementing the full `ui-sdk` agent-readiness test suite. Assert every non-offPage entry in `agent.snapshot()` has a non-empty `label`, assert all expected controls appear in `labels`, execute `agent.act({ steps })` for layout switching (`one-sided` and `two-sided`), selecting a match, toggling a slot lock, assigning/swapping athletes, and zooming/fitting, assert `data-agent-confirm` steps fail when `allow` returns `false` and succeed when `allow` returns `true`, and test `registerTools` against a mocked `document.modelContext`.

**You see.**

- [ ] `bun run test src/features/dashboard/components/tournament/builder/brackets-tab/__tests__/bracket-agent-bridge.test.tsx` exits with code 0.
- [ ] Calling `agent.snapshot()` on the live Brackets tab returns a complete, uniquely named list of bracket controls and match items with zero `"actions": []` on `bracketPrimitive` and zero unnamed entries.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `bracket-agent-bridge.test.tsx` verifies `agent.snapshot()` label completeness, `agent.query()`, `agent.act()` across 1-sided and 2-sided layouts, `details.source === 'agent'` handling, `data-agent-confirm` refusal and approval, and WebMCP `registerTools` registration and cleanup. Run `bun run test && bun run typecheck && bun run lint`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `claudeAgent/claude-opus-5-5-medium` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Load the Brackets tab on trunk and head and confirm normal human clicks, drags, and toolbar actions work identically. Trunk lacks the agent bridge; record that fact and verify head registers the bridge without delaying initial paint. Save `lane-1-regression-human-flow.png`. Pass when human interactions match trunk and `agent.snapshot()` returns a non-empty array on head.
- [ ] Lane 2. Run `agent.snapshot()` on a 16-athlete `two-sided` division and inspect every returned entry. Save `lane-2-snapshot-audit.png`. Pass when zero entries have an empty `label` and `bracketPrimitive` lists all declared actions.
- [ ] Lane 3. Run `agent.act` to switch layout from `two-sided` to `one-sided` and back. Save `lane-3-agent-layout-switch.png`. Pass when the `<canvas>` visually repaints into `one-sided` and then `two-sided` layout and `result.ok` is true.
- [ ] Lane 4. Run `agent.act` to select a match by its label from `agent.query({ within: 'Tournament bracket' })`. Save `lane-4-agent-select-match.png`. Pass when `MatchDetailPanel` opens for that exact match.
- [ ] Lane 5. Run `agent.act` to toggle a slot lock on a round-0 match. Save `lane-5-agent-lock-slot.png`. Pass when the lock state persists to the server and the canvas lock icon updates to amber.
- [ ] Lane 6. Run `agent.act` to assign an athlete to an open round-0 slot and then swap two unlocked slots. Save `lane-6-agent-assign-swap.png`. Pass when the canvas repaints the assigned and swapped athletes and server state matches.
- [ ] Lane 7. Run `agent.act` to zoom in, zoom out, and fit bracket to view. Save `lane-7-agent-zoom-fit.png`. Pass when the canvas viewport transforms update and `fitView` centers the bracket.
- [ ] Lane 8. Run `agent.act` targeting `Regenerate bracket` (`data-agent-confirm`) and click Cancel in `AgentConfirmDialog`. Save `lane-8-agent-confirm-deny.png`. Pass when `act` resolves with `ok: false` and no matches are regenerated.
- [ ] Lane 9. Run `agent.act` targeting `Reset bracket` (`data-agent-confirm`) and click Approve in `AgentConfirmDialog`. Save `lane-9-agent-confirm-approve.png`. Pass when `act` resolves with `ok: true` and the bracket resets.
- [ ] Lane 10. Inject a `document.modelContext` spy before mount and verify `registerTools` registers `snapshot`, `query`, and `act`, executes a tool call, and unregisters on unmount. Save `lane-10-webmcp-register.png`. Pass when all three tools register, `snapshot` returns an array, and unmount cleans up every tool.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. `agent.snapshot()` execution time (ms) and `agent.act()` single-step dispatch latency (ms) on a 64-athlete division, plus Brackets tab mount time delta against trunk.
- [ ] Probe. Run an interleaved browser script measuring Brackets tab mount time at trunk and head, then execute 50 `agent.snapshot()` calls and 20 `agent.act()` calls on head.
- [ ] Baseline. Record trunk Brackets tab mount time first and note that trunk lacks `agent.snapshot()` and `agent.act()`.
- [ ] Rule. Brackets tab mount time regression must stay under 20 ms. On a 64-athlete division, `agent.snapshot()` p95 must stay under 15 ms and `agent.act()` non-network step p95 must stay under 30 ms.

**Review gate.** The operator reviews before merge.

- [ ] Copy lane 2, lane 3, lane 6, and lane 8 screenshots into `/tmp/review-media/PR-5-review-snapshot.png`, `/tmp/review-media/PR-5-review-layout.png`, `/tmp/review-media/PR-5-review-assign.png`, and `/tmp/review-media/PR-5-review-confirm.png`.
- [ ] Record a 30 to 60 second video of an AI agent inspecting the bracket via `snapshot()`, switching layouts, selecting and locking matches, assigning athletes, and hitting the human confirmation dialog on a lane VM. Save it as `/tmp/review-media/PR-5-review.mp4`.
- [ ] Post the screenshots and the video in chat. Stop at merge-ready. Wait for the operator's click.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto `PR-4` after the verdict, patch-id unchanged.
- [ ] The root appends `PR-5` on top of `PR-4` in the base-branch stack.

## Close the program

- [ ] Every box above is checked with its evidence.
- [ ] Reply to the operator with the report the execution playbook names.

## Appendix A. Prototype evidence

No prototypes have been run yet because `@ui-sdk/core` and `@ui-sdk/react` are not installed in `package.json`. Two open technical questions stay unproven until `PR-2` and `PR-3` land.

1. Exact `@dnd-kit/core` pointer sensor interaction with a `<canvas>` element layered behind or beside a visually-hidden semantic slot overlay when dragging from `PanelAthleteRow` onto a zoomed canvas. If `@dnd-kit` droppable rects drift under pan and zoom, `PR-4` will use a single canvas-level droppable combined with `hitTestBracket` world coordinates instead of per-slot DOM droppables.
2. Whether `agent.snapshot()` stays under the 100-component page cap on a 64-athlete division (64 matches times 2 slots equals 128 slots). If slot-level parts exceed the 100-entry snapshot budget, `bracketPrimitive` should expose matches as `agent.items` on the root primitive and keep individual slots discoverable through `agent.query({ within: 'Tournament bracket' })` so the snapshot stays compact.

## Appendix B. Alternatives rejected

1. **Keep the HTML/SVG DOM bracket and wrap it in `@ui-sdk/react` only.** Rejected because the user specifically requested a canvas-based component, DOM pan/zoom scales poorly on 64-athlete brackets, and `html-to-image` iframe cloning is brittle against CSS class refactors.
2. **Pure `<canvas>` with zero semantic DOM parts.** Rejected because `@ui-sdk/react/agent` (`snapshot()`, `query()`, `act()`), screen readers, and keyboard roving focus require `definePrimitive` slots bound to DOM elements. Keeping `<canvas aria-hidden="true">` paired with lightweight semantic parts satisfies both 60 fps canvas rendering and full accessibility plus agent bridge support.
3. **Rewrite the bracket layout math inside the canvas renderer.** Rejected because `src/lib/tournament/bracket/bracket-layout/*` is already pure TypeScript, unit-tested for both `one-sided` and `two-sided` layouts, and emits SVG `d` paths that `new Path2D(d)` consumes directly.
4. **Ship `PR-4` with a compatibility toggle keeping both the old DOM bracket and the new canvas bracket.** Rejected under the migrate-callers-then-delete-legacy-apis principle. `BracketCanvas` is the only external caller of `Bracket` in the repository, so migrating it and deleting the legacy DOM files in `PR-4` avoids split maintenance.

## Appendix C. Risks

1. **Theme drift between Tailwind v4 tokens and Canvas 2D colors (`PR-3`).** Canvas does not automatically repaint when `.dark` toggles on `document.documentElement`. The owner watches `canvas-theme.ts` with a `MutationObserver` on the root class attribute and triggers a dirty repaint on change.
2. **High-DPI text blur or font-loading race in PNG export (`PR-3`, `PR-4`).** `renderBracketToPng` can render fallback fonts if Geist has not finished loading. The owner awaits `document.fonts.ready` before drawing the export canvas.
3. **Snapshot bloat on large divisions (`PR-2`, `PR-5`).** `@ui-sdk/react/agent` caps `snapshot()` at 100 components before appending a `more` entry. The owner models the bracket as one root primitive with `agent.items` and tests a 64-athlete snapshot explicitly in `PR-5`.
4. **Cross-panel DnD coordinate mismatch under pan and zoom (`PR-4`).** Screen pointer coordinates must invert the current `{ x, y, scale }` camera transform before calling `hitTestBracket`. The owner verifies round-0 drop accuracy at `0.5x`, `1.0x`, and `1.75x` zoom in `PR-4` unit and live lanes.
5. **Control skill availability on local Windows host (`All PRs`).** Live verification lanes assume cloud VMs running `control-ui` from `cursor-team-kit`. If a local run lacks `control-ui`, the operator uses T3 Code `preview_*` tools to drive the same 10 lane scenarios and records the substitution.

## Appendix D. Links and reading list

Read these before editing any file in the stack.

- `GLOSSARY.md` for Kyorbit domain terms (`Bracket canvas`, `Wing`, `Canvas layout`, `Third-Place Match`, `Corner swap`, `Bracket screenshot`, `Bracket fullscreen`).
- `.claude/rules/bun-package-manager.md`, `.claude/rules/concise-naming.md`, `.claude/rules/react-composition.md`, and `.claude/rules/tanstack-query.md`.
- `node_modules/@ui-sdk/react/docs/llms.txt`, `docs/core.md` (overview, Build a Component, Compose Behaviors), `docs/rendering.md`, and `docs/agents.md` after `PR-1` installs the packages.
- `src/lib/tournament/bracket/bracket-layout/index.ts`, `coords.ts`, `connectors.ts`, and `labels.ts` for the shared `one-sided` and `two-sided` geometry engine.
- `PR-2` and `PR-5` get `pstack/skills/how/SKILL.md` and `pstack/skills/interrogate/SKILL.md` before implementation because they define the primitive API and agent security boundary.
- Keep the program decision trail per `pstack/skills/show-me-your-work/SKILL.md`.
