# Admin Migration Notes: React Router to TanStack Router

## Baseline

- Workspace app: `apps/admin`
- Typecheck (`tsc --noEmit`): PASSED (clean, 0 errors)
- Build (`vite build`): PASSED (dist output: HTML 0.40 kB, CSS 25.33 kB, JS 389.27 kB in single bundle)
- Port: 5174
- SPA rewrite: `vercel.json` rewrites `/(.*)` -> `/index.html` (maintained unchanged)
- Sessions: `sessionStorage` key `jh_admin_session` (tab-scoped, no `localStorage`)

## Stage 1: Install and Configure

- Installed `@tanstack/react-router` (^1.170.45) in `apps/admin`.
- Installed devDependencies `@tanstack/router-plugin` (^1.168.47) and `@tanstack/react-router-devtools` (^1.167.2).
- Configured `apps/admin/vite.config.ts`:
  - Added `tanstackRouter({ target: 'react', autoCodeSplitting: true })` BEFORE `@vitejs/plugin-react` and `@tailwindcss/vite`.
  - Added `@/` alias pointing to `src`.
- Configured `apps/admin/tsconfig.json`:
  - Added `"paths": { "@/*": ["./src/*"] }`.
- Normalized all existing filenames in `apps/admin/src` to lowercase kebab-case:
  - `App.tsx` -> `app.tsx`
  - `AdminShell.tsx` -> `admin-shell.tsx`
  - `DemoNotice.tsx` -> `demo-notice.tsx`
  - `RequireAuth.tsx` -> `require-auth.tsx`
  - `AuthContext.tsx` -> `auth-context.tsx`
  - `AuditLog.tsx` -> `audit-log.tsx`
  - `Dashboard.tsx` -> `dashboard.tsx`
  - `Login.tsx` -> `login.tsx`
  - `Payments.tsx` -> `payments.tsx`
  - `PlanDetail.tsx` -> `plan-detail.tsx`
  - `Plans.tsx` -> `plans.tsx`
  - `ServiceRequestDetail.tsx` -> `service-request-detail.tsx`
  - `ServiceRequests.tsx` -> `service-requests.tsx`
  - `Settings.tsx` -> `settings.tsx`
  - `UserDetail.tsx` -> `user-detail.tsx`
  - `Users.tsx` -> `users.tsx`
- Converted all internal relative imports in `apps/admin/src` to `@/...`.
- Created `apps/admin/src/routes` directory for TanStack Router generator.
- Verified: `tsc --noEmit` and `vite build` pass with 0 errors.

## Stage 2: Root Route, Router Instance, and Providers

- Created `src/routes/__root.tsx` with `createRootRouteWithContext<RouterContext>()`:
  - Typed context includes `queryClient: QueryClient` and `auth: { user: User | null; isSuperAdmin: boolean; logout: () => void }`.
  - Added `<Outlet />` component.
- Created `src/router.tsx`:
  - Configured `createRouter` with `routeTree`, context defaults, `defaultPreload: 'intent'`, `scrollRestoration: true`, and `defaultNotFoundComponent: () => <Navigate to="/" replace />`.
  - Added global module augmentation `Register { router: typeof router }`.
- Updated `src/main.tsx` and `src/app.tsx`:
  - Removed `BrowserRouter` from `main.tsx`.
  - Mounted `<RouterProvider router={router} context={{ queryClient, auth: { user, isSuperAdmin, logout } }} />` inside `QueryClientProvider` and `AuthProvider`.
  - In `app.tsx`, connected `router.invalidate()` to `user` state changes to ensure immediate re-evaluation on auth transitions.
- Verified: `tsc --noEmit` and `vite build` pass cleanly with 0 errors.

## Stage 3: File-based Routes & Zod Search Schemas

- Created `src/lib/search-schemas.ts` with reusable Zod schemas:
  - `redirectSearchSchema = z.object({ redirect: z.string().startsWith("/").refine(v => !v.startsWith("//")).optional() })`
  - `querySearchSchema = z.object({ q: z.string().optional(), filter: z.string().optional() })`
- Created all 13 route files according to the route contract:
  - `/login` (`src/routes/login.tsx`): validated search `redirect?: string`, guest guard redirecting authenticated users to `redirect` param or `/`.
  - `/_authenticated` (`src/routes/_authenticated.tsx`): pathless layout route enforcing auth guard in `beforeLoad` (redirecting to `/login?redirect=...`) and rendering `AdminShell`.
  - `/` (`src/routes/_authenticated/index.tsx`): `Dashboard`
  - `/users/` (`src/routes/_protected/users/index.tsx`): `Users`
  - `/users/$id` (`src/routes/_protected/users/$id.tsx`): `UserDetail` with dynamic param `$id`
  - `/plans/` (`src/routes/_protected/plans/index.tsx`): `Plans`
  - `/plans/$id` (`src/routes/_protected/plans/$id.tsx`): `PlanDetail` with dynamic param `$id`
  - `/service-requests/` (`src/routes/_protected/service-requests/index.tsx`): `ServiceRequests`
  - `/service-requests/$id` (`src/routes/_protected/service-requests/$id.tsx`): `ServiceRequestDetail` with dynamic param `$id`
  - `/payments` (`src/routes/_protected/payments.tsx`): `Payments`
  - `/audit-log` (`src/routes/_protected/audit-log.tsx`): `AuditLog`
  - `/settings` (`src/routes/_protected/settings.tsx`): `Settings`
  - `/$` (`src/routes/$.tsx`): wildcard splat route redirecting to `/`
- Generated typed `src/routeTree.gen.ts` with all 13 route nodes.
- Verified: `tsc --noEmit` and `vite build` pass with 0 errors.

## Stage 4: Migrate Codebase (Components, Hooks, Pages)

- Replaced all `react-router-dom` imports across all components and pages with `@tanstack/react-router`:
  - `src/components/admin-shell.tsx`: Replaced `Link`, `NavLink`, and `Outlet` with `@tanstack/react-router` `Link` (with `activeProps`, `inactiveProps`, `activeOptions={{ exact: end }}`) and `Outlet`.
  - Deleted dead file `src/components/require-auth.tsx` (replaced by route `beforeLoad` guards).
  - `src/pages/login.tsx`: Migrated to `useNavigate` and `useSearch({ from: "/login" })`, navigating to validated `redirect` query parameter on submit.
  - `src/pages/dashboard.tsx`: Migrated `Link` to `@tanstack/react-router` with typed `to="/service-requests/$id" params={{ id: r._id }}`.
  - `src/pages/users.tsx`: Migrated `Link` to `@tanstack/react-router` with typed `to="/users/$id" params={{ id: c._id }}`.
  - `src/pages/user-detail.tsx`: Migrated `Link` and `useParams({ from: "/_protected/users/$id" })` to `@tanstack/react-router`, with typed links to `/plans/$id` and `/service-requests/$id`.
  - `src/pages/plans.tsx`: Migrated `Link` to `@tanstack/react-router` with typed `to="/users/$id"` and `to="/plans/$id"`.
  - `src/pages/plan-detail.tsx`: Migrated `Link` and `useParams({ from: "/_protected/plans/$id" })` to `@tanstack/react-router` with typed `to="/users/$id"`.
  - `src/pages/service-requests.tsx`: Migrated `Link` to `@tanstack/react-router` with typed `to="/service-requests/$id"`.
  - `src/pages/service-request-detail.tsx`: Migrated `Link` and `useParams({ from: "/_protected/service-requests/$id" })` to `@tanstack/react-router` with typed `to="/users/$id"`.
  - `src/pages/payments.tsx`: Migrated `Link` to `@tanstack/react-router` with typed `to="/users/$id"` and `to="/plans/$id"`.
  - `src/pages/audit-log.tsx`: Migrated `Link` to `@tanstack/react-router` with typed `to="/service-requests/$id"`.
- Zero imports of `react-router-dom` remain in `apps/admin/src`.
- Verified: `tsc --noEmit` and `vite build` succeed with 0 errors.

## Stage 5: Dependency Cleanup

- Removed `react-router-dom` dependency from `apps/admin/package.json`.
- Ran `pnpm install` and updated lockfile.
- Verified: `apps/admin/src` contains zero references to `react-router-dom`, `NavLink`, or `useLocation`.
- Ran `pnpm --filter @journeyhome/admin typecheck` and `build`: PASSED with 0 errors.

## Stage 6: Verification & Automated Smoke Tests

- Bundle size comparison:
  - **Stage 0 Baseline:**
    - HTML: 0.40 kB (gzip: 0.27 kB)
    - CSS: 25.33 kB (gzip: 5.63 kB)
    - JS: 389.27 kB (gzip: 118.31 kB) in a single monolithic bundle.
  - **Stage 6 TanStack Router:**
    - HTML: 0.73 kB (gzip: 0.35 kB)
    - CSS: 25.84 kB (gzip: 5.70 kB)
    - JS: Code-split across 28 chunks.
    - Initial page load bundle (`index-*.js`): ~341 kB (gzip: ~105 kB) — **~48 kB reduction in initial payload**.
    - Individual route chunks (0.09 kB to 8.6 kB) are prefetched and lazy-loaded on intent.
- Added Playwright test suite (`apps/admin/tests/admin.spec.ts`) with 9 automated smoke tests covering all required flows:
  1. `Login page loads without console errors` (clean console, visible sign-in form).
  2. `Auth-guard redirects unauthenticated user to /login with redirect param` (verified on `/`, `/users`, `/plans`, `/service-requests`, `/payments`, `/audit-log`, `/settings`).
  3. `Guest-guard redirects authenticated user away from /login` (redirects to `/` or preserved `redirect` query parameter).
  4. `Navigation between key pages works for authenticated staff in AdminShell` (verified sidebar links, page headers, tables, chips, and content on `/`, `/users`, `/plans`, `/service-requests`, `/payments`, `/audit-log`, `/settings`).
  5. `Dynamic route loads with param (/users/$id)` (verified customer name, email, plans count).
  6. `Dynamic route loads with param (/plans/$id)` (verified covered person, balance, status transition dropdown).
  7. `Dynamic route loads with param (/service-requests/$id)` (verified requester, venue, documents review).
  8. `Wildcard / unknown route redirects to /` (verified fallback catch-all).
  9. `Login submission navigates to redirect target` (verified form submission with return redirect).
- Test execution: All 9 smoke tests PASSED (8.9s).
- Typecheck & Build: `tsc --noEmit` 0 errors, `vite build` 100% green.

---

## ROUTE CONTRACT (Verification Checklist)

| #   | URL                    | Screen / Page          | Layout / Wrapper | Auth Required? | Params / Query Validated | Expected Behavior / Verification                                                                                   |
| --- | ---------------------- | ---------------------- | ---------------- | -------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| 1   | `/login`               | `Login`                | Root (no shell)  | Guest-only     | `redirect?: string`      | Direct load shows sign-in form; if logged in redirects to `/`; on successful login navigates to `redirect` or `/`. |
| 2   | `/`                    | `Dashboard`            | `AdminShell`     | Yes            | None                     | Direct load redirects to `/login` if signed out; operations overview, KPI cards, recent review queue items.        |
| 3   | `/users`               | `Users`                | `AdminShell`     | Yes            | None                     | Direct load redirects to `/login` if signed out; users table, search by name/email, chips filter, pagination.      |
| 4   | `/users/$id`           | `UserDetail`           | `AdminShell`     | Yes            | `$id: string` (path)     | Direct load redirects to `/login` if signed out; customer overview, linked plans, linked service requests.         |
| 5   | `/plans`               | `Plans`                | `AdminShell`     | Yes            | None                     | Direct load redirects to `/login` if signed out; plans table, filter by status, search by owner or covered person. |
| 6   | `/plans/$id`           | `PlanDetail`           | `AdminShell`     | Yes            | `$id: string` (path)     | Direct load redirects to `/login` if signed out; plan details, covered person, status transition dropdown & save.  |
| 7   | `/service-requests`    | `ServiceRequests`      | `AdminShell`     | Yes            | None                     | Direct load redirects to `/login` if signed out; service requests grouped by status chips, links to detail.        |
| 8   | `/service-requests/$id`| `ServiceRequestDetail` | `AdminShell`     | Yes            | `$id: string` (path)     | Direct load redirects to `/login` if signed out; request details, document review & verification, status actions.  |
| 9   | `/payments`            | `Payments`             | `AdminShell`     | Yes            | None                     | Direct load redirects to `/login` if signed out; payment transactions table, monthly KPIs, CSV export.             |
| 10  | `/audit-log`           | `AuditLog`             | `AdminShell`     | Yes            | None                     | Direct load redirects to `/login` if signed out; audit events stream, filters for admin/action, CSV export.        |
| 11  | `/settings`            | `Settings`             | `AdminShell`     | Yes            | None                     | Direct load redirects to `/login` if signed out; package prices, notifications, session revoke, admin team (super).|
| 12  | `/*` (wildcard)         | Fallback / Not Found   | Root             | No             | None                     | Any unrecognized path redirects to `/` (which guards to `/login` if unauthenticated).                              |

---

## Stage 0: Inventory & Route Contract

### 1. Routes & Nesting Structure

Routes live at the ROOT (`/`), not under `/app`:
- Guest route: `/login` (no sidebar).
- Authenticated routes: Wrapped in `AdminShell` with sidebar navigation:
  - `/` (Dashboard)
  - `/users`
  - `/users/:id`
  - `/plans`
  - `/plans/:id`
  - `/service-requests`
  - `/service-requests/:id`
  - `/payments`
  - `/audit-log`
  - `/settings`
- Wildcard fallback: `*` redirects to `/`.

### 2. Route Guards & Auth Context

- Storage mechanism: `sessionStorage` key `jh_admin_session` (strictly tab-scoped, no `localStorage`).
- User session type:
  ```ts
  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    isSuperAdmin: boolean;
  }
  interface Session {
    user: User;
    token: string;
  }
  ```
- Super admin privilege check: `session.user.isSuperAdmin || session.user.role === "super_admin"`.
- Guard behavior:
  - React Router used `<RequireAuth />` and `<GuestOnly />`.
  - In TanStack Router:
    - Root route passes `{ auth: { user, isSuperAdmin, logout } }` in router context.
    - Pathless layout route `_authenticated` checks `auth.user` in `beforeLoad` and redirects unauthenticated users to `/login?redirect=...`.
    - Guest route `/login` checks `auth.user` in `beforeLoad` and redirects authenticated users to `/` (or `redirect` query parameter).
    - `api.ts` invokes `onUnauthorized()` which clears `sessionStorage` and triggers `router.invalidate()` so routes re-evaluate immediately.

### 3. Search Parameters & Validation

- Use reusable Zod search schemas in `src/lib/search-schemas.ts`:
  - `redirectSearchSchema = z.object({ redirect: z.string().optional() })`
  - Shared across routes requiring redirection validation.

### 4. File Naming Normalization (kebab-case) & Path Alias

- Normalize all filenames in `apps/admin/src` to lowercase kebab-case:
  - `AdminShell.tsx` -> `admin-shell.tsx`
  - `AuthContext.tsx` -> `auth-context.tsx`
  - `DemoNotice.tsx` -> `demo-notice.tsx`
  - `RequireAuth.tsx` -> removed after migration
  - `AuditLog.tsx` -> `audit-log.tsx`
  - `Dashboard.tsx` -> `dashboard.tsx`
  - `Login.tsx` -> `login.tsx`
  - `Payments.tsx` -> `payments.tsx`
  - `PlanDetail.tsx` -> `plan-detail.tsx`
  - `Plans.tsx` -> `plans.tsx`
  - `ServiceRequestDetail.tsx` -> `service-request-detail.tsx`
  - `ServiceRequests.tsx` -> `service-requests.tsx`
  - `Settings.tsx` -> `settings.tsx`
  - `UserDetail.tsx` -> `user-detail.tsx`
  - `Users.tsx` -> `users.tsx`
  - `App.tsx` -> `app.tsx`
- Configure `@/` path alias in `apps/admin/tsconfig.json` and `apps/admin/vite.config.ts`.

### 5. React Router API Usage Inventory (14 files)

1. `src/main.tsx`: `BrowserRouter`
2. `src/App.tsx`: `Routes`, `Route`, `Navigate`
3. `src/components/AdminShell.tsx`: `Link`, `NavLink`, `Outlet`
4. `src/components/RequireAuth.tsx`: `Navigate`, `Outlet`, `useLocation`
5. `src/pages/Login.tsx`: `useNavigate`, `useLocation`
6. `src/pages/Dashboard.tsx`: `Link`
7. `src/pages/Users.tsx`: `Link`
8. `src/pages/UserDetail.tsx`: `Link`, `useParams`
9. `src/pages/Plans.tsx`: `Link`
10. `src/pages/PlanDetail.tsx`: `Link`, `useParams`
11. `src/pages/ServiceRequests.tsx`: `Link`
12. `src/pages/ServiceRequestDetail.tsx`: `Link`, `useParams`
13. `src/pages/Payments.tsx`: `Link`
14. `src/pages/AuditLog.tsx`: `Link`
