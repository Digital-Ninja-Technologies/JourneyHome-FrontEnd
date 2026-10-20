# Backend contract for the screens that had no backend

These endpoints don't exist on the backend yet. The frontend is already built against the shapes below, so
implementing them as written makes the screens work without frontend changes. Until then:

- **Demo mode** (`VITE_USE_MOCKS`, on by default in `pnpm dev`, off in production builds) simulates them in the
  browser so the screens can be clicked through. Screens show a "Demo mode" notice when it's on.
- With demo mode off, a `404/405/501` from any of these shows a clear "not available on the server yet" message
  instead of failing silently or faking success.

All responses use the backend's existing envelope: `{ "success": true, "message": "...", "data": ... }`;
errors are `{ "success": false, "message": "..." }` with a useful HTTP status (the message is shown to users).
All endpoints below except the first two groups require the usual `Authorization: Bearer <jwt>`.

## Customer app (`apps/dashboard`)

### Signup extras
- `POST /auth/signup` — body may now include an optional `phone` string (store it on the user).

### Verification code (onboarding step 2)
- `POST /auth/verification/send` — sends a 6-digit code to the signed-in user's email. Rate-limit it (the UI waits 30s
  before offering "Resend"). `200`.
- `POST /auth/verification/confirm` — body `{ "code": "123456" }`. `200` when valid; `400` with a message such as
  `"That code is incorrect or has expired."` otherwise.

### Password reset (public, no auth)
- `POST /auth/forgot-password` — body `{ "email": "..." }`. Always `200` (don't reveal whether the account exists).
  Email a link to `<dashboard origin>/reset-password?token=<token>`.
- `POST /auth/reset-password` — body `{ "token": "...", "password": "..." }` (min 6 chars). `200`; `400`
  `"This reset link is invalid or has expired."` for a bad/expired token.

### Profile & settings
- `GET /auth/me` → `{ id, name, email, phone?, createdAt, preferences: { paymentReminders, deficitAlerts, serviceUpdates, productNews } }` (booleans).
- `PATCH /auth/me` — body any of `{ name, phone, email }` → updated user. (Changing `email` should re-verify.)
- `PATCH /auth/me/password` — body `{ currentPassword, newPassword }`; `400` `"Your current password is incorrect."` on mismatch.
- `PATCH /auth/me/preferences` — body any subset of the four booleans → full preferences object.
- `DELETE /auth/me` — closes the account (the UI asks the user to type CLOSE).
- `GET /payments/methods` → `[{ _id, brand, last4, expMonth, expYear, isDefault }]` (saved Paystack authorizations; never expose codes).
- `POST /payments/methods/initialize` → `{ authorizationUrl }` — starts a Paystack card-saving checkout; Paystack
  should return to `<dashboard origin>/app/profile?card_added=1`.
- `DELETE /payments/methods/:id` — removes a saved card.

## Admin console (`apps/admin`)

- `GET /payments/admin` (admin) → every payment:
  `[{ _id, owner, plan, reference, amountMinor, currency, purpose, status, createdAt, processedAt?, ownerName?, planName? }]`
  (`ownerName`/`planName` are optional conveniences; without them the UI looks owners up from the customers list).
- `GET /audit-logs` (admin) → `[{ _id, actor?, actorName?, action, resourceType, resourceId, resourceLabel?, createdAt }]`,
  newest first. These are the events the backend already records (`service_request.*`); `actorName` and
  `resourceLabel` (for example `"Adaeze Nwosu's service request"`) are optional conveniences.
- `GET /auth/me` and `PATCH /auth/me/preferences` also serve admin preferences:
  `preferences: { newServiceRequest, paymentFailed, weeklyDigest }` (booleans).
- `POST /auth/sessions/revoke-others` — invalidates the caller's other sessions (needs token versioning or a
  session store).

## Still not covered (designed but needs data-model decisions)

Suspend account, send password reset from the admin, deficit tracking and the deficit filters, identity-document
upload on plans, plan payment history/activity feed on the admin plan page.
