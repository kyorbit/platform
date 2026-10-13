# breadcrumb

2026-10-13. Golden pair via CLI fetch, replay Tabler `IconChevronRight`/`IconDots`. Migrated. `BreadcrumbLink` uses `useRender` + `mergeProps`.

## Changed

Parent review: typecheck and production build passed. The full suite passed with 72 suites and 428 tests before the additional rendered-link check, which also passed. The 17 focused checks and applicable table, navigation, overlay, and settings browser checks passed. Browser scripts and screenshots are kept outside the repository.

- `src/components/ui/breadcrumb.tsx`: Link `asChild` → `render`. Icons stay Tabler.
- Production consumer `src/features/dashboard/components/sidebar/site-header.tsx` uses Breadcrumb/List/Item/Separator only (title + action). No `BreadcrumbLink`, no `asChild`. No call-site edit.

Leftover scan on `breadcrumb.tsx`: no `radix-ui`, `@radix-ui`, or `IconPlaceholder`.

## Left alone

- Sidebar trigger next to the breadcrumb (#288).
- cmdk/vaul/sonner/calendar/chart/sortable.

## Behavior changes

None. `BreadcrumbLink` default tag is `<a>`. No link consumers exist today.

## Verify by hand

- Dashboard site header: title and optional action still read as a breadcrumb trail with the chevron when `action` is set.
