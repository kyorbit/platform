# button

2026-10-13. Golden pair via CLI fetch (radix-vega vs base-vega), replay local variants. Migrated. Uses real `@base-ui/react/button`.

## Changed

Parent review: typecheck and production build passed. The full suite passed with 72 suites and 428 tests before the additional rendered-link check, which also passed. The 17 focused checks and applicable table, navigation, overlay, and settings browser checks passed. Browser scripts and screenshots are kept outside the repository.

- `src/components/ui/button.tsx`: `ButtonPrimitive` from `@base-ui/react/button`. Kept local variants (`primary`, `xl`, gradient `default`) and `data-variant`/`data-size`. `asChild`/`Slot` gone; consumers use `render`.
- `asChild` → `render` + `nativeButton={false}` for non-button targets (Link/`a`/Label):
  - `src/features/dashboard/components/tournament/builder/builder-shell/builder-header.tsx:59` (`<a>`)
  - `src/features/dashboard/components/tournament/command-center/divisions-overview.tsx:62`
  - `src/features/dashboard/components/tournament/command-center/index.tsx:92`
  - `src/features/dashboard/components/tournament/builder/builder-shell/builder-footer.tsx:175`
  - `src/features/dashboard/components/tournament/builder/divisions-tab/add-athletes-sheet/add-athletes-list.tsx:55`
  - `src/features/dashboard/components/dashboard-route-error.tsx:58,100,124`
  - `src/features/dashboard/components/home/status-pipeline.tsx:257,283`
  - `src/features/dashboard/components/home/kpi-strip.tsx:63`
  - `src/features/dashboard/components/tournament/command-center/setup-checklist.tsx:173`
  - `src/routes/_auth.tsx:55`
  - `src/features/app/components/settings/unauthorized.tsx:24`
  - `src/components/not-found.tsx:31`
  - `src/features/app/components/settings/tabs/standard-settings.tsx:102` (Label file-picker)
- `src/components/ui/combobox.tsx:81-84`: `InputGroupButton` `asChild` → `render={<ComboboxTrigger />}`. Trigger is a button, so `nativeButton` stays default true.
- `src/components/ui/action-bar.tsx:416-573`: ActionBarItem forwards Button events. Typed callbacks as Base UI events (`preventBaseUIHandler`) so composition still typechecks. Not a full action-bar migration (#289).

Leftover scan on `button.tsx`: no `radix-ui`, `@radix-ui`, or `IconPlaceholder`.

## Left alone

- Overlay `asChild` on Dialog/Sheet/Popover/Tooltip/DropdownMenu/Sidebar (#288).
- Vaul `DrawerTrigger asChild` (retained).
- Sortable/action-bar own `asChild` Slot APIs (#289), aside from the Button event-type adapt above.
- `src/components/ui/calendar.tsx`, `copy-button.tsx`, `input-group.tsx`: Button usage without `asChild`.
- Ordinary `<Button>` submit/reset/click sites: no contract change.

## Behavior changes

None intended. Link buttons use `nativeButton={false}` so they navigate. Disabled still `pointer-events-none`. `type` still defaults through the primitive (`type="button"` unless passed). Submit buttons that already set `type="submit"` are unchanged.

## Verify by hand

- Link-styled buttons (not-found, unauthorized, auth, KPI/status pipeline, setup checklist, command-center, builder header GitHub, add-athletes list): click navigates.
- Disabled buttons do not activate.
- Dialog/form submit buttons submit once; ordinary buttons inside forms do not newly submit.
- Combobox trigger still opens the list.
- Action bar items still click, focus, and keyboard-move.
