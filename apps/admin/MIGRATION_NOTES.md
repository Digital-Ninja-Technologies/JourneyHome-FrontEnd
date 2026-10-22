# Admin Migration Notes: React Router to TanStack Router

## Baseline

- Workspace app: `apps/admin`
- Typecheck (`tsc --noEmit`): PASSED (clean, 0 errors)
- Build (`vite build`): PASSED (dist output: HTML 0.40 kB, CSS 25.33 kB, JS 389.27 kB in single bundle)
- Port: 5174
- SPA rewrite: `vercel.json` rewrites `/(.*)` -> `/index.html` (maintained unchanged)
- Sessions: `sessionStorage` key `jh_admin_session` (tab-scoped, no `localStorage`)

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
