# Project: Journey Home Production Refactoring

## Architecture
Monorepo using Turborepo and pnpm workspaces:
- `@journeyhome/ui`: Shared UI component library using `@base-ui/react`, Tailwind CSS v4 (`base-luma` taupe theme), and Shadcn primitives. Provides standardized form fields (`FormInput`, `FormPasswordInput`, `FormTextarea`, `FormCheckbox`, `FormOtpInput`, `FormSelect`, `FormDatePicker`).
- `@journeyhome/schemas`: Shared Zod schemas and TypeScript types defining entities, API contracts, auth, plans, payments, subscriptions, and notifications.
- `@journeyhome/api-client`: Unified HTTP client wrapping `fetch` with Bearer auth injection and response envelope handling.
- `@journeyhome/dashboard`: React 19 application using TanStack Router and TanStack Query connecting to the live backend API at `https://journey-home.onrender.com/api/v1`.
- `@journeyhome/marketing`: Next.js marketing application with package selection links pointing to signup.

## Feature Inventory
Every feature identified during the Survey phase mapped to its assigned milestone:
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | UI Primitive Addition | Add required primitives (`checkbox`, `input-otp`, `popover`, `calendar`, `badge`, `empty`) via `pnpm shadcn@latest add` | M1 | Survey / R1 |
| 2 | Pure Base-UI Select | Pure `@base-ui/react/select` with trigger, popup, items; remove native `<select>` fallback and `NativeSelect` | M1 | Survey / R1 |
| 3 | Popover Calendar DatePicker | `FormDatePicker` with Popover Calendar and Month & Year Select dropdowns | M1 | Survey / R1 |
| 4 | Password Input Component | `PasswordInput` and `FormPasswordInput` with eye toggle and criteria checklist | M1 | Survey / R1 |
| 5 | Shared Form Field Library | `form-fields.tsx` abstractions for `react-hook-form` + `@hookform/resolvers/zod` | M1 | Survey / R1 |
| 6 | Schemas Phone Removal | Remove `phone` from `sessionUserSchema`, `signupSchema`, `customerMeSchema`, `updateProfileSchema` | M1 | Survey / R2 |
| 7 | Schemas SelectedPackage Removal | Remove `signupSearchSchema` and `resolveSelectedPackage()` from schemas | M1 | Survey / R2 |
| 8 | New Schemas Alignment | Add/update schemas for `verifyEmail`, `resendVerification`, `deleteAccount`, `customerPreferences`, `paginatedNotifications`, `dashboardSummary`, `subscription` | M1 | Survey / R2, R3 |
| 9 | Schemas Unit Tests | Update Vitest suite in `@journeyhome/schemas` covering new/updated schemas | M1 | Survey / R4 |
| 10 | Onboarding SelectedPackage Removal | Delete `onboarding/storage.ts` and remove all `getStoredSelectedPackage` references in dashboard & marketing | M2 | Survey / R2 |
| 11 | Onboarding Skip Link Placement | Relocate "Skip for now" link in `onboarding-plan-view.tsx` to the top of the view | M2 | Survey / R2 |
| 12 | Temporary Storage Lifecycle | Manage `jh_pending_verification_email`, clear `jh_onboarding_plan` on skip/completion, purge `jh_notifications_seen_*` | M2 | Survey / R2 |
| 13 | Signup Form Migration | Migrate `signup-form.tsx` to use standardized `FormInput`, `FormPasswordInput`, `FormCheckbox`, remove `phone` and `selectedPackage` | M2 | Survey / R1, R2 |
| 14 | Auth Tokenless Signup Integration | `POST /auth/signup` handling no-token response, storing pending email, navigating to `/signup/verify` | M3 | Survey / R3 |
| 15 | Auth Login & Unverified Interception | `POST /auth/login` handling successful session and 401 unverified redirect to `/signup/verify` | M3 | Survey / R3 |
| 16 | Auth Email Verification Route | `POST /auth/verify-email` consuming token from query or input and clearing pending email | M3 | Survey / R3 |
| 17 | Auth Resend Verification | `POST /auth/resend-verification` passing email from storage | M3 | Survey / R3 |
| 18 | Auth Forgot & Reset Password | `POST /auth/forgot-password` and `POST /auth/reset-password` using `{ token, newPassword }` | M3 | Survey / R3 |
| 19 | Auth Profile & Preferences | `GET /auth/me`, `PATCH /auth/change-password`, and `PATCH /auth/notification-preferences` with correct keys | M3 | Survey / R3 |
| 20 | Auth Account Deletion | `DELETE /auth/me` passing `{ password }` in body, destroying session and redirecting | M3 | Survey / R3 |
| 21 | Packages Listing | `GET /packages` consuming live backend packages | M4 | Survey / R3 |
| 22 | Plans Dashboard Summary | `GET /plans/dashboard` feeding metrics to `DashboardView` | M4 | Survey / R3 |
| 23 | Plan Creation Integration | `POST /plans` sending `{ packageId, coveredPerson }` using `FormSelect` and `FormDatePicker` | M4 | Survey / R1, R3 |
| 24 | Plans Listing & Details | `GET /plans` (unwrapping pagination) and `GET /plans/:id` | M4 | Survey / R3 |
| 25 | Form Select & DatePicker Migration | Replace native `<select>` and `<input type="date">` in `plan-form-parts.tsx` and `request-service-view.tsx` | M4 | Survey / R1 |
| 26 | Payments Initialization & Verify | `POST /payments/plans/:planId/initialize-initial` and `POST /payments/verify/:reference` | M4 | Survey / R3 |
| 27 | Payments Listing & Detail | `GET /payments` (with query filtering & pagination unwrapping) and `GET /payments/:id` | M4 | Survey / R3 |
| 28 | Subscriptions Listing & Detail | `GET /subscriptions` and `GET /subscriptions/:id` replacing legacy payment methods | M4 | Survey / R3 |
| 29 | Notifications Listing & Counts | `GET /notifications` fetching paginated notifications and unread counts | M5 | Survey / R3 |
| 30 | Notification Read & Delete | `PATCH /notifications/:id/read` and `DELETE /notifications/:id` | M5 | Survey / R3 |
| 31 | Notifications UI Integration | Bell icon, drawer/list unread badge, optimistic cache updates, removing local storage sync | M5 | Survey / R3 |
| 32 | E2E Test Suite Tiers 1-4 Pass | 100% pass of requirement-driven test suite published by E2E track in `TEST_READY.md` | M6 | Survey / R4 |
| 33 | Adversarial Coverage Hardening | White-box stress testing and gap closure with Challengers (Tier 5) | M6 | Survey / R4 |
| 34 | Monorepo Verification & Biome | Typecheck ui/schemas/dashboard, Vitest schemas test pass, Biome check clean | M6 | Survey / R4 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | UI & Schemas Foundation | `@journeyhome/ui` primitives addition, pure Base-UI Select, Popover Calendar DatePicker, FormFields; `@journeyhome/schemas` cleanup & alignment | none | DONE |
| M2 | Onboarding Cleanup & Storage | Relocate "Skip for now" link, delete `onboarding/storage.ts`, clean temporary storage keys, refactor signup form | M1 | IN_PROGRESS |
| M3 | Auth & Profile API Integration | Live backend integration for all auth endpoints (signup tokenless, login, verify-email, resend, reset-password, change-password, preferences, delete-account) | M1, M2 | PLANNED |
| M4 | Packages, Plans & Payments Integration | Live backend integration for packages, plans dashboard, plan creation, payments checkout/verify, subscriptions, and form select/datepicker replacement | M1, M2 | PLANNED |
| M5 | Notifications Integration & Polish | Live backend integration for notifications listing, marking read, deleting; cleanup local tracking | M3, M4 | PLANNED |
| M6 | Final Verification & Adversarial Hardening | Pass 100% E2E test suite (Tiers 1-4) from `TEST_READY.md`, Tier 5 adversarial hardening, monorepo typecheck, Biome format/lint | M1, M2, M3, M4, M5 | PLANNED |

## Interface Contracts

### `@journeyhome/ui` ↔ `@journeyhome/dashboard`
- `FormSelect`:
  ```tsx
  <FormSelect
    control={control}
    name={fieldName}
    label={label}
    description={description}
    placeholder={placeholder}
    items={[{ label: string, value: string }]}
  />
  ```
- `FormDatePicker`:
  ```tsx
  <FormDatePicker
    control={control}
    name={fieldName}
    label={label}
    description={description}
    placeholder={placeholder}
    fromYear={1920}
    toYear={new Date().getFullYear() + 5}
    minDate={minDate}
    maxDate={maxDate}
  />
  ```
- `FormPasswordInput`:
  ```tsx
  <FormPasswordInput
    control={control}
    name={fieldName}
    label={label}
    showCriteria={boolean}
  />
  ```

### `@journeyhome/schemas` ↔ `@journeyhome/dashboard`
- `signupSchema`: `{ name: string, email: string, password: string, role: "customer" | "covered_person" }` (NO phone, NO selectedPackage)
- `verifyEmailSchema`: `{ token: string }`
- `resendVerificationSchema`: `{ email: string }`
- `resetPasswordSchema`: `{ token: string, newPassword: string }`
- `deleteAccountSchema`: `{ password: string }`
- `customerPreferencesSchema`: `{ paymentReminders: boolean, deficitAlerts: boolean, serviceRequestUpdates: boolean, productNewsOffers: boolean }`
- `createPlanSchema`: `{ packageId: string, coveredPerson: { fullName: string, dateOfBirth?: string, gender?: string, relationship: string, address: string, phoneNumber?: string } }`

### Dashboard ↔ Live Backend (`https://journey-home.onrender.com/api/v1`)
- Standard Envelope: `{ success: boolean, message?: string, data?: T }`
- Authorization: `Authorization: Bearer <token>`
- Tokenless Signup: `POST /auth/signup` returns `{ success: true, message: string }`, requiring email verification.
- Account Deletion: `DELETE /auth/me` requires `{ password: string }` in request body.

## Code Layout
- `packages/ui/src/components/`: UI components and primitives (`form-fields.tsx`, `select.tsx`, `date-picker.tsx`, `popover.tsx`, etc.)
- `packages/schemas/src/`: Zod schemas (`auth.ts`, `plan.ts`, `payment.ts`, `notification.ts`, `user.ts`, `search.ts`)
- `apps/dashboard/src/lib/api/`: API client request wrapper, endpoints, mocks
- `apps/dashboard/src/modules/`: Feature modules (`auth`, `onboarding`, `plans`, `packages`, `payments`, `notifications`, `profile`, `service-requests`)
- `apps/dashboard/src/routes/`: TanStack Router file-based route definitions
