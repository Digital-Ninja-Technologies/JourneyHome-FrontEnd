# Dashboard Migration Notes: React Router to TanStack Router

## Baseline

- Workspace app: `apps/dashboard`
- Typecheck (`tsc --noEmit`): PASSED (clean, 0 errors)
- Build (`vite build`): PASSED (dist output: HTML 0.39 kB, CSS 31.10 kB, JS 485.87 kB)
- Port: 5173
- SPA rewrite: `vercel.json` rewrites `/(.*)` -> `/index.html` (maintained unchanged)

## Stage 1: Install and Configure

- Installed `@tanstack/react-router` (^1.170.45) in `apps/dashboard`.
- Installed devDependencies `@tanstack/router-plugin` (^1.168.47) and `@tanstack/react-router-devtools` (^1.167.2).
- Configured `apps/dashboard/vite.config.ts`:
  - Added `tanstackRouter({ target: 'react', autoCodeSplitting: true })` BEFORE `@vitejs/plugin-react`.
  - Retained `@tailwindcss/vite` and existing Vite setup.
- Created `apps/dashboard/src/routes` directory for file-based routing.
- Verified TypeScript include configuration (`tsconfig.json` includes `src`, which contains generated `routeTree.gen.ts`).

## Stage 2: Root Route, Router Instance, and Providers

- Created `src/routes/__root.tsx` with `createRootRouteWithContext<RouterContext>()`:
  - Typed context includes `queryClient: QueryClient` and `auth: { user: User | null }`.
  - Added `<ScrollRestoration />` and `<Outlet />`.
- Created `src/router.tsx`:
  - Configured `createRouter` with `routeTree`, context defaults, `defaultPreload: 'intent'`, `scrollRestoration: true`, and `defaultNotFoundComponent`.
  - Added global module augmentation `Register { router: typeof router }`.
- Updated `src/main.tsx` and `src/App.tsx`:
  - Removed `BrowserRouter` and React Router `<Routes>` from `main.tsx`.
  - Nested `<RouterProvider router={router} context={{ queryClient, auth: { user } }} />` inside `QueryClientProvider` and `AuthProvider`.
  - In `App.tsx`, hooked `router.invalidate()` to `user` state changes so auth transitions automatically trigger route re-evaluation.
- Verified: App boots to root route with providers intact, dev server runs without errors.

## Stage 3: Create the Routes

- Created all 19 route files according to the route contract:
  - `/` (`src/routes/index.tsx`): redirects to `/app`
  - `/login` (`src/routes/login.tsx`): validated search `redirect?: string`, guest guard redirecting to `redirect` param or `/app`
  - `/forgot-password` (`src/routes/forgot-password.tsx`): guest guard redirecting to `/app`
  - `/reset-password` (`src/routes/reset-password.tsx`): validated search `token?: string`, guest guard redirecting to `/app`
  - `/signup/` (`src/routes/signup/index.tsx`): guest guard redirecting to `/app`
  - `/signup/verify` (`src/routes/signup/verify.tsx`): auth guard redirecting to `/login` with redirect search param
  - `/signup/plan` (`src/routes/signup/plan.tsx`): auth guard redirecting to `/login` with redirect search param
  - `/signup/payment` (`src/routes/signup/payment.tsx`): validated search `plan?: string`, auth guard
  - `/welcome` (`src/routes/welcome.tsx`): validated search `plan?: string`, auth guard
  - `/app` layout (`src/routes/app/route.tsx`): renders `AppShell` with `<Outlet />`, enforces auth guard on all nested `/app/*` routes
  - `/app/` (`src/routes/app/index.tsx`): `Dashboard`
  - `/app/plans/` (`src/routes/app/plans/index.tsx`): `Plans`, validated search `new?: string`
  - `/app/plans/$id` (`src/routes/app/plans/$id.tsx`): `PlanDetail` with dynamic param `$id`
  - `/app/service-requests/` (`src/routes/app/service-requests/index.tsx`): `ServiceRequests`
  - `/app/service-requests/new` (`src/routes/app/service-requests/new.tsx`): `RequestService`, validated search `plan?: string`
  - `/app/notifications` (`src/routes/app/notifications.tsx`): `Notifications`
  - `/app/payments/` (`src/routes/app/payments/index.tsx`): `Payments`, validated search `plan?: string`
  - `/app/payments/new` (`src/routes/app/payments/new.tsx`): `MakePayment`, validated search `plan?: string`
  - `/app/payments/callback` (`src/routes/app/payments/callback.tsx`): `PaymentCallback`, validated search `reference?: string`, `trxref?: string`
  - `/app/profile` (`src/routes/app/profile.tsx`): `Profile`, validated search `card_added?: string`
- Generated `src/routeTree.gen.ts` with all 19 route nodes and full type safety.
- Verified: `pnpm --filter @journeyhome/dashboard typecheck` and `build` succeed with 0 errors.

## Stage 4: Migrate Codebase (Components, Hooks, Pages)

- Replaced all `react-router-dom` imports across all components and pages with `@tanstack/react-router`:
  - `src/components/AppShell.tsx`: Replaced `NavLink` with TanStack `Link` using `activeProps` / `inactiveProps` and `activeOptions={{ exact: end }}`. Replaced `Outlet`.
  - `src/components/OnboardingShell.tsx`: Replaced `Link`.
  - `src/components/CreatePlanDialog.tsx`: Replaced `useNavigate`.
  - Removed dead file `src/components/RequireAuth.tsx`.
  - `src/pages/Login.tsx`: Replaced `Link`, `useNavigate`, `useSearchParams` (using `useSearch({ from: "/login" })`).
  - `src/pages/ForgotPassword.tsx`: Replaced `Link`.
  - `src/pages/ResetPassword.tsx`: Replaced `Link`, `useSearchParams` (using `useSearch({ from: "/reset-password" })`).
  - `src/pages/Signup.tsx`: Replaced `Link`, `useNavigate`, `Navigate`.
  - `src/pages/VerifyCode.tsx`: Replaced `Link`, `useNavigate`.
  - `src/pages/OnboardingPlan.tsx`: Replaced `Link`, `useNavigate`.
  - `src/pages/OnboardingPayment.tsx`: Replaced `Link`, `Navigate`, `useSearchParams` (using `useSearch({ from: "/signup/payment" })`).
  - `src/pages/Welcome.tsx`: Replaced `Link`, `useSearchParams` (using `useSearch({ from: "/welcome" })`).
  - `src/pages/Dashboard.tsx`: Replaced `Link`.
  - `src/pages/Plans.tsx`: Replaced `Link`, `useNavigate({ from: "/app/plans/" })`, `useSearch({ from: "/app/plans/" })`.
  - `src/pages/PlanDetail.tsx`: Replaced `Link`, `useParams({ from: "/app/plans/$id" })`.
  - `src/pages/ServiceRequests.tsx`: Replaced `Link`.
  - `src/pages/RequestService.tsx`: Replaced `Link`, `useNavigate`, `useSearch({ from: "/app/service-requests/new" })`.
  - `src/pages/Notifications.tsx`: Replaced `Link`.
  - `src/pages/Payments.tsx`: Replaced `Link`, `useNavigate({ from: "/app/payments/" })`, `useSearch({ from: "/app/payments/" })`.
  - `src/pages/MakePayment.tsx`: Replaced `Link`, `useNavigate`, `useSearch({ from: "/app/payments/new" })`.
  - `src/pages/PaymentCallback.tsx`: Replaced `Link`, `Navigate`, `useSearch({ from: "/app/payments/callback" })`.
  - `src/pages/Profile.tsx`: Replaced `Link`, `useNavigate({ from: "/app/profile" })`, `useSearch({ from: "/app/profile" })`.
- Zero imports of `react-router-dom` remain in `apps/dashboard/src`.
- Verified: `pnpm --filter @journeyhome/dashboard typecheck` and `pnpm --filter @journeyhome/dashboard build` succeed with 0 errors.

## Stage 5: Dependency Cleanup

- Removed `react-router-dom` dependency from `apps/dashboard/package.json`.
- Ran `pnpm install` / update lockfile.
- Verified: `apps/dashboard/src` contains zero references to `react-router-dom`, `useSearchParams`, or `NavLink`.
- Ran `pnpm --filter @journeyhome/dashboard typecheck` and `build`: PASSED with 0 errors.

## Stage 6: Verification & Automated Smoke Tests

- Bundle size comparison:
  - **Stage 0 Baseline:**
    - HTML: 0.39 kB (gzip: 0.27 kB)
    - CSS: 31.10 kB (gzip: 6.50 kB)
    - JS: 485.87 kB (gzip: 153.94 kB) in a single monolithic bundle.
  - **Stage 6 TanStack Router:**
    - HTML: 0.55 kB (gzip: 0.31 kB)
    - CSS: 31.10 kB (gzip: 6.50 kB)
    - JS: Code-split across 51 chunks.
    - Initial page load bundle (`index` + `link` + `utils`): ~358 kB (gzip: ~115 kB) — **~127 kB reduction in initial payload**.
    - Individual route chunks (0.5 kB to 12 kB) are prefetched and lazy-loaded on intent.
    - Total size across all chunks combined: ~482 kB (gzip: ~152 kB).
- Search parameter validator robustness:
  - Upgraded all `validateSearch` functions to coerce string/number parameters safely using `search.param != null ? String(search.param) : undefined` across all routes.
- Added Playwright test suite (`apps/dashboard/tests/dashboard.spec.ts`) with 8 automated smoke tests covering all required flows:
  1. `Login page loads without console errors` (clean console, no runtime errors).
  2. `Auth-guard redirects unauthenticated user to /login` (preserves redirect return target).
  3. `Navigation between key pages works for authenticated user` (`/app`, `/app/plans`, `/app/payments`, `/app/service-requests`, `/app/profile`) with active navigation styles and verified content rendering.
  4. `Dynamic route loads with param (/app/plans/$id)` (verified `$id` param resolution).
  5. `Route with search params preserves and updates them` (verified `card_added=1` search param banner, param dismissal, and `/app/payments?plan=...` filter).
  6. `Onboarding step-through works for authenticated user` (verified `/signup/verify`, `/signup/plan`, `/signup/payment?plan=...`, and `/welcome?plan=...`).
  7. `Paystack callback route handles query params without crashing` (verified `reference` and `trxref` handling).
  8. `Wildcard / unknown route redirects to /app or /login` (verified catch-all redirect).
- Test execution: All 8 smoke tests PASSED (19.2s).
- Typecheck & Build: `tsc --noEmit` 0 errors, `vite build` 100% green.

## Stage 7: Documentation & Final Wrap-up

- Created `apps/dashboard/README.md` documenting:
  - Routing architecture (file-based routing via `@tanstack/react-router` and `@tanstack/router-plugin`).
  - Route tree generation and conventions.
  - Authentication guard pattern (`beforeLoad`, RouterContext, `router.invalidate()`).
  - Search parameters validation (`validateSearch`, type safety).
  - Navigation patterns (`Link`, `useNavigate`).
  - Development and Playwright testing commands.
- Summary of Trade-offs and Intentional Deviations:
  - **Automatic code-splitting:** Route components are split into lazy chunks (`autoCodeSplitting: true`), significantly reducing initial page load bundle size while preserving seamless client-side navigation and preloading on intent.
  - **Search params coercion:** To guard against query parameter serialization differences between strings and unquoted numeric primitives (e.g. `?new=1`, `?card_added=1`), `validateSearch` normalizes non-null values with `String(val)`.
  - **Dynamic redirect target casting:** Where arbitrary redirect URL strings are returned post-login, type assertion `to: redirectUrl as any` is used to permit dynamic string targets while maintaining strict typing across the rest of the application.

## Stage 0: Inventory & Route Contract

### 1. Routes & Nesting Structure (Verified)

| Path                        | Layout / Wrapper | Component           | Guard / Condition                                    | Search Params / Dynamic Params          | Status       |
| --------------------------- | ---------------- | ------------------- | ---------------------------------------------------- | --------------------------------------- | ------------ |
| `/login`                    | Root             | `Login`             | Guest-only (redirects to `/app` or `redirect` param) | `redirect?: string`                     | Verified [x] |
| `/forgot-password`          | Root             | `ForgotPassword`    | Guest-only (redirects to `/app` if logged in)        | None                                    | Verified [x] |
| `/reset-password`           | Root             | `ResetPassword`     | Guest-only (redirects to `/app` if logged in)        | `token?: string`                        | Verified [x] |
| `/signup`                   | Root             | `Signup`            | Guest-only (redirects to `/app` if logged in)        | None                                    | Verified [x] |
| `/signup/verify`            | Root             | `VerifyCode`        | Requires Auth                                        | None                                    | Verified [x] |
| `/signup/plan`              | Root             | `OnboardingPlan`    | Requires Auth                                        | None                                    | Verified [x] |
| `/signup/payment`           | Root             | `OnboardingPayment` | Requires Auth                                        | `plan?: string`                         | Verified [x] |
| `/welcome`                  | Root             | `Welcome`           | Requires Auth                                        | `plan?: string`                         | Verified [x] |
| `/app`                      | `AppShell`       | `Dashboard` (index) | Requires Auth                                        | None                                    | Verified [x] |
| `/app/plans`                | `AppShell`       | `Plans`             | Requires Auth                                        | `new?: string` (`"1"` opens dialog)     | Verified [x] |
| `/app/plans/$id`            | `AppShell`       | `PlanDetail`        | Requires Auth                                        | `$id` (path param)                      | Verified [x] |
| `/app/service-requests`     | `AppShell`       | `ServiceRequests`   | Requires Auth                                        | None                                    | Verified [x] |
| `/app/service-requests/new` | `AppShell`       | `RequestService`    | Requires Auth                                        | `plan?: string`                         | Verified [x] |
| `/app/notifications`        | `AppShell`       | `Notifications`     | Requires Auth                                        | None                                    | Verified [x] |
| `/app/payments`             | `AppShell`       | `Payments`          | Requires Auth                                        | `plan?: string`                         | Verified [x] |
| `/app/payments/new`         | `AppShell`       | `MakePayment`       | Requires Auth                                        | `plan?: string`                         | Verified [x] |
| `/app/payments/callback`    | `AppShell`       | `PaymentCallback`   | Requires Auth                                        | `reference?: string`, `trxref?: string` | Verified [x] |
| `/app/profile`              | `AppShell`       | `Profile`           | Requires Auth                                        | `card_added?: string`                   | Verified [x] |
| `*` (wildcard)              | Root             | Redirect            | N/A                                                  | Redirects to `/app`                     | Verified [x] |     |

### 2. Route Guards & Auth Context

- Storage mechanism: `jh_session` key in `localStorage` (if remember is checked) or `sessionStorage`.
- User session type: `{ user: User; token: string; remember: boolean }`.
- Customer role assertion: `user.role === 'customer'` (admins/super_admins are rejected).
- Protected route behavior:
  - In React Router: `<RequireAuth />` redirects unauthenticated users to `/login` with `from` state; `<GuestOnly />` redirects authenticated users to `/app`.
  - In TanStack Router:
    - Root route passes `{ auth: { user, logout } }` in router context.
    - Protected routes (`/app`, `/welcome`, `/signup/verify`, `/signup/plan`, `/signup/payment`) check auth in `beforeLoad` and redirect to `/login?redirect=...`.
    - Guest-only routes (`/login`, `/forgot-password`, `/reset-password`, `/signup`) check auth in `beforeLoad` and redirect to `/app` (or `redirect` search param).
    - Session expiration/401: `api.ts` invokes `onUnauthorized()` which clears the session. Router will invalidate (`router.invalidate()`) on auth change to trigger `beforeLoad` redirection.

### 3. React Router API Usage Inventory

Total 23 files importing `react-router-dom`:
- **`BrowserRouter`**: `src/main.tsx`
- **`Routes`, `Route`**: `src/App.tsx`
- **`Navigate`**:
  - `src/App.tsx` (wildcard fallback to `/app`)
  - `src/components/RequireAuth.tsx` (auth redirects)
  - `src/pages/Signup.tsx` (redirect to `/app` if already logged in)
  - `src/pages/OnboardingPayment.tsx` (redirect to `/welcome?plan=...` if plan not pending)
  - `src/pages/PaymentCallback.tsx` (redirect to `/welcome?plan=...` if onboarding plan verified)
- **`Outlet`**:
  - `src/components/RequireAuth.tsx`
  - `src/components/AppShell.tsx`
- **`Link`**:
  - `src/components/AppShell.tsx`
  - `src/components/OnboardingShell.tsx`
  - `src/pages/Dashboard.tsx`
  - `src/pages/ForgotPassword.tsx`
  - `src/pages/Login.tsx`
  - `src/pages/MakePayment.tsx`
  - `src/pages/Notifications.tsx`
  - `src/pages/OnboardingPayment.tsx`
  - `src/pages/OnboardingPlan.tsx`
  - `src/pages/PaymentCallback.tsx`
  - `src/pages/Payments.tsx`
  - `src/pages/PlanDetail.tsx`
  - `src/pages/Plans.tsx`
  - `src/pages/Profile.tsx`
  - `src/pages/RequestService.tsx`
  - `src/pages/ResetPassword.tsx`
  - `src/pages/ServiceRequests.tsx`
  - `src/pages/Signup.tsx`
  - `src/pages/VerifyCode.tsx`
  - `src/pages/Welcome.tsx`
- **`NavLink`**:
  - `src/components/AppShell.tsx` (main navigation items)
- **`useNavigate`**:
  - `src/components/CreatePlanDialog.tsx` (navigate to `/app/plans/:id`)
  - `src/pages/Login.tsx` (navigate to redirect target or `/app`)
  - `src/pages/MakePayment.tsx` (navigate to `/app/plans` on cancel)
  - `src/pages/OnboardingPlan.tsx` (navigate to `/signup/payment?plan=:id`)
  - `src/pages/Profile.tsx` (navigate to `/login` after account deletion)
  - `src/pages/RequestService.tsx` (navigate to `/app/service-requests`)
  - `src/pages/Signup.tsx` (navigate to `/signup/verify`)
  - `src/pages/VerifyCode.tsx` (navigate to `/signup/plan`)
- **`useParams`**:
  - `src/pages/PlanDetail.tsx` (`id`)
- **`useSearchParams`**:
  - `src/pages/MakePayment.tsx` (`plan`)
  - `src/pages/OnboardingPayment.tsx` (`plan`)
  - `src/pages/PaymentCallback.tsx` (`reference`, `trxref`)
  - `src/pages/Payments.tsx` (`plan`)
  - `src/pages/Plans.tsx` (`new`)
  - `src/pages/Profile.tsx` (`card_added`)
  - `src/pages/RequestService.tsx` (`plan`)
  - `src/pages/ResetPassword.tsx` (`token`)
  - `src/pages/Welcome.tsx` (`plan`)
- **`useLocation`**:
  - `src/components/RequireAuth.tsx` (capturing `location.pathname`)
  - `src/pages/Login.tsx` (reading `location.state.from`)

### 4. String-Built URLs & External Handoffs

- **Paystack checkout flow (`src/lib/checkout.ts`)**:
  - Initiates checkout via `POST /payments/plans/:id/initialize-initial`
  - Onboarding stores plan ID in `sessionStorage.getItem("jh_onboarding_plan")`
  - Browser redirected via `window.location.assign(authorizationUrl)`
  - Paystack return redirect: `<dashboard origin>/app/payments/callback?reference=...&trxref=...`
- **Onboarding chain**:
  - `/signup` -> `/signup/verify` -> `/signup/plan` -> `/signup/payment?plan=<id>` -> Paystack -> `/app/payments/callback` -> `/welcome?plan=<id>` (clears onboarding session flag) -> `/app`
- **Password reset flow**:
  - `/forgot-password` -> demo link `/reset-password?token=demo-token`
  - `/reset-password?token=...` -> calls `POST /auth/reset-password`
- **Mock server URLs (`src/mocks/index.ts`)**:
  - Save card return: `${window.location.origin}/app/profile?card_added=1`
- **Notification generated links (`src/lib/notifications.ts`)**:
  - `/app/plans/:id`, `/app/payments`, `/app/payments/new?plan=:id`, `/app/service-requests`
- **External marketing links**:
  - `${VITE_MARKETING_URL}/terms`, `${VITE_MARKETING_URL}/privacy`, `${VITE_MARKETING_URL}/pricing` (rendered as standard `<a href="...">` tags)

### 5. Providers & Bootstrap

- `QueryClientProvider` with `queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } })`
- `AuthProvider` wraps the application, exposing `user`, `login`, `signup`, `logout`, `updateUser`.
- `api.ts` configures `getToken` and `onUnauthorized` callbacks to synchronize with auth session.
- `USE_MOCKS` enables demo mode in dev (`import.meta.env.DEV` or `VITE_USE_MOCKS=true`).

---

## ROUTE CONTRACT (Verification Checklist)

| #   | URL                         | Screen / Page        | Auth Required?             | Params / Query Validated                | Expected Behavior / Verification                                                                                                |
| --- | --------------------------- | -------------------- | -------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `/login`                    | `Login`              | Guest-only                 | `redirect?: string`                     | Direct load works; redirects to `/app` if signed in; on login navigates to `redirect` param or `/app`.                          |
| 2   | `/forgot-password`          | `ForgotPassword`     | Guest-only                 | None                                    | Direct load works; redirects to `/app` if signed in; submitting sends reset email (or demo token link in dev).                  |
| 3   | `/reset-password`           | `ResetPassword`      | Guest-only                 | `token?: string`                        | Direct load with `?token=demo-token` shows new password form; missing token shows invalid link warning.                         |
| 4   | `/signup`                   | `Signup`             | Guest-only (when not busy) | None                                    | Direct load works; redirects to `/app` if signed in; submitting creates account and proceeds to `/signup/verify`.               |
| 5   | `/signup/verify`            | `VerifyCode`         | Yes                        | None                                    | Direct load redirects to `/login` if signed out; demo code `123456` verifies and proceeds to `/signup/plan`.                    |
| 6   | `/signup/plan`              | `OnboardingPlan`     | Yes                        | None                                    | Direct load redirects to `/login` if signed out; selecting package and submitting proceeds to `/signup/payment?plan=<id>`.      |
| 7   | `/signup/payment`           | `OnboardingPayment`  | Yes                        | `plan?: string`                         | Direct load redirects to `/login` if signed out; shows plan checkout summary; clicking pay triggers Paystack checkout.          |
| 8   | `/welcome`                  | `Welcome`            | Yes                        | `plan?: string`                         | Direct load redirects to `/login` if signed out; shows welcome summary; clears onboarding flag; links to dashboard.             |
| 9   | `/app`                      | `Dashboard`          | Yes                        | None                                    | Direct load redirects to `/login` if signed out; shows customer dashboard overview, plan cards, quick links.                    |
| 10  | `/app/plans`                | `Plans`              | Yes                        | `new?: string`                          | Direct load redirects to `/login` if signed out; shows plan list; `?new=1` opens Create Plan dialog.                            |
| 11  | `/app/plans/$id`            | `PlanDetail`         | Yes                        | `$id: string` (path)                    | Direct load redirects to `/login` if signed out; loads plan details by ID; shows 404 message if not found.                      |
| 12  | `/app/payments`             | `Payments`           | Yes                        | `plan?: string`                         | Direct load redirects to `/login` if signed out; shows payment history; filter buttons update `?plan=<id>` in URL.              |
| 13  | `/app/payments/new`         | `MakePayment`        | Yes                        | `plan?: string`                         | Direct load redirects to `/login` if signed out; shows first payment checkout or plan picker.                                   |
| 14  | `/app/payments/callback`    | `PaymentCallback`    | Yes                        | `reference?: string`, `trxref?: string` | Direct load redirects to `/login` if signed out; verifies reference with backend; redirects to `/welcome` if onboarding.        |
| 15  | `/app/service-requests`     | `ServiceRequests`    | Yes                        | None                                    | Direct load redirects to `/login` if signed out; displays active & past service requests with status timeline.                  |
| 16  | `/app/service-requests/new` | `RequestService`     | Yes                        | `plan?: string`                         | Direct load redirects to `/login` if signed out; displays request service form & document uploader.                             |
| 17  | `/app/notifications`        | `Notifications`      | Yes                        | None                                    | Direct load redirects to `/login` if signed out; lists event notifications with unread indicators and links.                    |
| 18  | `/app/profile`              | `Profile`            | Yes                        | `card_added?: string`                   | Direct load redirects to `/login` if signed out; profile, saved cards (`?card_added=1` banner), notifications, change password. |
| 19  | `/*` (invalid)              | Not Found / Wildcard | No                         | None                                    | Any unrecognized path redirects to `/app` (which guards to `/login` if unauthenticated).                                        |

## Modularization & Query Architecture

### Stage 1: Shared Packages
- Created `@journeyhome/api-client`:
  - `createApiClient({ baseUrl, getAuthToken, onUnauthorized })` factory returning typed `apiClient<T>(endpoint, options)`.
  - Added JSON headers, `AbortSignal.timeout(60000)` default, safe 204/empty response handling, Bearer token injection, structured JSON / text error parsing, 401 callback dispatch.
  - Added 7 unit tests covering success, 204, JSON errors, HTML errors, network failure, 401 callback, and timeout signals.
- Created `@journeyhome/schemas`:
  - Enforced exact backend domain status enums (`PlanStatus`, `PaymentStatus`, `ServiceRequestStatus`, `DocumentType`, `DocumentVerificationStatus`, `UserRole`, `PaymentPurpose`).
  - Added Zod schemas for auth, plans, payments, service requests, packages, notifications, users, search/pagination, and `apiResponseSchema` envelope.
  - Added 15 unit tests covering validation, enums, and open-redirect sanitization.
- Added `@journeyhome/ui/lib/format` exporting shared currency and date formatters.
- Consumed `@journeyhome/schemas` in `apps/dashboard/src/lib/search-schemas.ts`.

