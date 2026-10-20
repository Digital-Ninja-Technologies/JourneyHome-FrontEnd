# Journey Home — Frontend Build Handoff

This repo is a **build brief for Claude Code**, not a finished app. It packages the
approved UX/visual design (as clickable HTML/CSS mockups) plus the product spec and
the live backend API, so a fresh build can start from a clear, agreed-upon source of
truth instead of guessing at layout or scope.

## What's in here

- `/mockups/*.dc.html` — 35 static HTML/CSS mockups exported from the approved Claude
  Design canvas. Each file is one screen, fully styled (fonts, colors, spacing,
  component states) and cross-linked with plain `<a href="OtherScreen.dc.html">` tags
  so you can click through the flow in a browser. **These are visual/UX reference
  only** — markup and inline styles, no real data binding, no auth, no API calls.
  Treat them as the pixel- and copy-accurate spec for each screen, not as code to
  lift verbatim.
- `/docs/Journey_Home_PRD_v1.0.pdf` — the product requirements doc. Source of truth
  for scope, field lists, and the status enums below.

## What to build

A production web app (recommend **React + TypeScript + Vite**, or Next.js if SSR/SEO
matters for the marketing pages) implementing the screens in `/mockups`, wired to the
existing backend:

- **Backend repo:** `Digital-Ninja-Technologies/journey_home_backend`
  (Express + TypeScript + PostgreSQL/Prisma + JWT auth, REST at `/api/v1`). Its
  `README.md` documents every endpoint (auth, packages, plans, payments/Paystack,
  billing, notifications, service requests, admin). Read it before wiring any screen.
- Auth: `POST /auth/signup`, `POST /auth/login`, `POST /auth/admin/login` (admin
  console and web app are separate login flows — see `AdminLogin.dc.html` vs
  `Login.dc.html`).
- Payments go through Paystack (`/payments/plans/:planId/initialize-initial`, webhook
  verification) — don't build a custom payment form; follow the backend's Paystack
  flow.

## Sitemap

### Web app (`app`) — authenticated customer app
| Mockup | Suggested route | Notes |
|---|---|---|
| Dashboard.dc.html | `/app` | Overview, active plan summary |
| Plans.dc.html | `/app/plans` | List + create-plan modal (includes covered-person "Home address" field — PRD §6.4) |
| PlanDetail.dc.html | `/app/plans/:id` | Open-ended savings — no "N of 24" framing, plans have no fixed end date |
| Payments.dc.html | `/app/payments` | History; statuses: Pending/Successful/Failed/Refunded/Cancelled (PRD §7.2) |
| MakePayment.dc.html | `/app/payments/new` | |
| ServiceRequests.dc.html | `/app/service-requests` | |
| RequestService.dc.html | `/app/service-requests/new` | |
| Notifications.dc.html | `/app/notifications` | |
| Profile.dc.html | `/app/profile` | |

### Onboarding
| Mockup | Suggested route |
|---|---|
| Login.dc.html | `/login` |
| ForgotPassword.dc.html | `/forgot-password` |
| ResetPassword.dc.html | `/reset-password` |
| OnboardingSignup.dc.html | `/signup` |
| OnboardingVerify.dc.html | `/signup/verify` |
| OnboardingPlan.dc.html | `/signup/plan` |
| OnboardingPayment.dc.html | `/signup/payment` |
| OnboardingWelcome.dc.html | `/welcome` |

### Admin console (`admin`) — internal ops tool, separate login
| Mockup | Suggested route | Notes |
|---|---|---|
| AdminLogin.dc.html | `/admin/login` | No 2FA field (removed by design decision) |
| AdminDashboard.dc.html | `/admin` | KPIs cover PRD §9.1 in full: users, plans, service requests, payments |
| AdminUsers.dc.html / AdminUserDetail.dc.html | `/admin/users`, `/admin/users/:id` | |
| AdminPlans.dc.html / AdminPlanDetail.dc.html | `/admin/plans`, `/admin/plans/:id` | |
| AdminServiceRequests.dc.html / AdminServiceRequestDetail.dc.html | `/admin/service-requests`, `/admin/service-requests/:id` | **No provider/photographer-videographer assignment UI** — see Known scope decision below |
| AdminPayments.dc.html | `/admin/payments` | |
| AdminAuditLog.dc.html | `/admin/audit-log` | |
| AdminSettings.dc.html | `/admin/settings` | |

### Marketing site (`web`) — public, unauthenticated
| Mockup | Suggested route |
|---|---|
| Home.dc.html | `/` |
| HowItWorks.dc.html | `/how-it-works` |
| Pricing.dc.html | `/pricing` |
| FAQ.dc.html | `/faq` |
| Contact.dc.html | `/contact` |
| Terms.dc.html | `/terms` |
| Privacy.dc.html | `/privacy` |

## Known scope decision (flag if this needs revisiting)

The PRD (§8.3, §8.4, §9.2, §13 #8, §14) specifies that admins assign a named
photographer/videographer to an approved service request. That UI was **deliberately
removed** from the admin console design per an explicit product decision, and the
backend's service-request endpoints (see its README) have no provider-assignment
route either — so backend and frontend design agree on current scope. If provider
assignment is still wanted for v1, it needs a backend endpoint added before the
frontend can support it. Don't silently re-add it to the UI without that.

## Design tokens (quick reference, pulled from the mockups)

- Background `#F3EFE7`, ink `#0F2420`, sidebar/dark `#15110B` / `#0F2420`
- Accent gold `#D4A55A`, link `#8A6224` (hover `#5C3B0C`)
- Status colors: Active/Completed green (`#E3EFE7` / `#1F5A40`); Payment due/Deficit
  amber (`#F6EAD3` / `#7A4F10`); Under review blue (`#E3EEF5` / `#2C5F7A`); Approved
  purple (`#EDE3F5` / `#5B3B8A`); Paused/No active plan grey (`#EEE9DF` / `#5A6660`);
  Suspended/Cancelled red (`#F5E3E1` / `#8E3322`)
- Fonts: Instrument Serif (headings), Manrope (body/UI) — both loaded from Google
  Fonts in every mockup's `<head>`
- Each mockup has a `<script src="./support.js">` tag — that's a design-tool preview
  helper with no content; ignore it, it's not part of the build.

## Suggested build order

1. Set up the app shell (routing, auth context hitting `/auth/login` + `/auth/signup`)
   using Login/Signup/Verify mockups as the spec.
2. Web app core: Dashboard → Plans → PlanDetail → Payments/MakePayment, wired to the
   matching backend endpoints.
3. Service requests flow (submit → list → detail, including document upload via the
   backend's presigned-URL endpoints).
4. Admin console, same pattern, hitting the `/admin`-scoped backend routes.
5. Marketing site last — static content, lowest risk, can be done in parallel by
   anyone.

## Repo layout (monorepo)

pnpm workspaces + Turborepo.

```
apps/
  dashboard/   # Vite + React + React Router — customer app + onboarding (port 5173)
  admin/       # Vite + React + React Router — internal admin console (port 5174)
  marketing/   # Next.js — public marketing site (port 3000)
packages/
  ui/          # @journeyhome/ui — shared shadcn-style components + Tailwind v4 theme tokens
```

Commands: `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm typecheck`.
Add a shadcn component from `packages/ui` with `pnpm dlx shadcn@latest add <name>`.

### Marketing site (`apps/marketing`)

All seven public pages are built (Home, How it works, Pricing, FAQ, Contact, Terms, Privacy).
Copy `.env.example`: `NEXT_PUBLIC_API_URL` (backend, used for live package pricing on Home and
Pricing, revalidated every 5 minutes) and `NEXT_PUBLIC_APP_URL` (the dashboard, for Log in /
Get started links).

- **Photos:** the mockups reference design-tool blob URLs that aren't in this repo, so photos
  render as tinted placeholders. Add files to `apps/marketing/public/images/` and set the paths
  in `apps/marketing/lib/images.ts`.
- **Contact form:** there is no contact endpoint on the backend, so "Send message" opens the
  visitor's email client addressed to `hello@journeyhome.ng`.

### Payments (dashboard)

- Only a plan's **first contribution** can be started by the customer (`POST /payments/plans/:id/initialize-initial`,
  Pending plans only). Every later contribution is charged automatically by the backend's billing job, so "Make a
  payment" explains that instead of offering a manual payment. A manual pay endpoint would need to be added to the
  backend first.
- **Paystack return URL:** the backend does not send a `callback_url` when it initializes checkout, so Paystack sends
  customers to the callback URL set in the **Paystack dashboard**. Set it to `<dashboard origin>/app/payments/callback`
  (the page verifies the payment via `POST /payments/verify/:reference`).

### Service requests (dashboard)

- Documents upload straight from the browser to private storage via a presigned `PUT` (the backend's
  `/service-requests/:id/documents/upload-url` + `/complete` flow), so the **storage bucket's CORS rules must allow
  `PUT` from the dashboard origin** or uploads will fail with a network error.
- Request statuses come from the backend (`Submitted`, `Under_Review`, `More_Info_Required`, `Docs_Verified`,
  `Approved`, `Rejected`, `Cancelled`); "Scheduled" and "Completed" are read from the linked plan's status.
- Provider (photographer/videographer) assignment is intentionally not shown — see "Known scope decision" above.

### Admin console (`apps/admin`)

Separate app on its own origin, so routes are at the root (`/users`, `/plans`, `/service-requests`, …) rather than
under `/admin`. Sessions live in `sessionStorage` (tab only). Copy `.env.example` (`VITE_API_URL`, `VITE_MARKETING_URL`).

Built against the backend's admin endpoints: login, customers, all plans (+ status changes using the backend's
transition rules), the full service-request review workflow (start review, approve/flag documents, mark verified,
approve, request more info, reject), package pricing, and admin-team management (super admins only).

Built on top of endpoints the backend doesn't have yet (Payments, Audit log, notification preferences, revoke
sessions): they run in **demo mode** with simulated data, and show a "not available on the server yet" message when
the real server lacks them. See `docs/BACKEND_CONTRACT.md` for the exact shapes to implement.

Still not built because they need data-model decisions: suspend account, send password reset from the admin, deficit
tracking/filters, identity documents on plans, plan payment history and activity feed.

Also not surfaced (not in the design): creating packages and the billing policy / "run due billing" endpoints.

### Notifications (dashboard)

The backend's `GET /notifications` returns event records only (event type, plan, timestamp) — no message text and no
read/unread state. The dashboard composes the title/body from the event type and the plan (see
`apps/dashboard/src/lib/notifications.ts`) and tracks "read" per device in `localStorage`, so it won't sync across
browsers. A `read` flag and a mark-as-read endpoint on the backend would let this be shared.

### Onboarding (dashboard)

Signup → Verify (`/signup/verify`) → First plan (`/signup/plan`) → Payment (`/signup/payment`) → Welcome (`/welcome`).

- The Verify step uses the verification-code endpoints from `docs/BACKEND_CONTRACT.md` (demo mode until they exist). If the
  server doesn't have them, the page says so and lets the user continue.
- The plan step also asks for date of birth and home address, which `POST /plans` requires (the mockup's form omitted them).
- The mockup's card-number form can't be built (card details are collected on Paystack's hosted page), so the payment
  step redirects to Paystack, same as "Make a payment". A plan can't be edited once created, so there is no "Back"
  from payment; "Skip for now" leaves a Pending plan that can be paid later from My plans.
- After Paystack, the return page (`/app/payments/callback`) sends new customers to the welcome screen using a
  `sessionStorage` flag set at the payment step; any other first payment shows the normal "Payment received" page.

### Demo mode (works with no backend)

Both apps ship with a complete **simulated backend** (`packages/mock-api`) that runs in the browser and keeps its data in
`localStorage`. With it on, every screen works end to end — sign up, verify (code `123456`), create plans, pay through a
simulated Paystack page, request a service and upload documents, and, in the admin console, review requests, change plan
statuses, edit pricing and manage admins. It is seeded with sample data:

- Customer app: sign in as **demo@journeyhome.ng / demo1234** (or create a new account).
- Admin console: sign in as **ops@journeyhome.ng / admin123**.
- Password reset link: `/reset-password?token=demo-token`. Use "Reset demo data" on the sign-in page to start over.

Demo mode is **on** in `pnpm dev` and in the Vercel builds (via the committed `apps/*/.env.production`), and nothing talks to a
server. To use a real backend instead, set `VITE_USE_MOCKS=false` and `VITE_API_URL` (dashboard/admin) and
`NEXT_PUBLIC_API_URL` (marketing) in the hosting environment — those override the committed defaults — and redeploy. The
real-backend contract for endpoints that don't exist yet is in `docs/BACKEND_CONTRACT.md`; a real server that returns 404 for
one of them gets a clear "not available yet" message.

The marketing site shows sample packages and prices when no API is configured.

## Deploying to Vercel

Three Vercel projects, one per app, all linked to this repo with a different **Root Directory**:

| Project | Root Directory | Framework |
|---|---|---|
| `journeyhome-marketing` | `apps/marketing` | Next.js |
| `journeyhome-dashboard` | `apps/dashboard` | Vite (SPA rewrite in `vercel.json`) |
| `journeyhome-admin` | `apps/admin` | Vite (SPA rewrite in `vercel.json`) |

Environment variables are baked in at build time, so **redeploy after changing them**:

- marketing: `NEXT_PUBLIC_API_URL` (backend, ending in `/api/v1`), `NEXT_PUBLIC_APP_URL` (dashboard URL)
- dashboard: `VITE_API_URL`, `VITE_MARKETING_URL`
- admin: `VITE_API_URL`, `VITE_MARKETING_URL`

These builds run in demo mode by default (see above); setting `VITE_USE_MOCKS=false` + `VITE_API_URL` switches them to a real backend.
