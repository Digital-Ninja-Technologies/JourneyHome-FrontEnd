# Marketing Migration Notes

## Modularization & Query Architecture

### Stage 1: Shared Packages
- Created `@journeyhome/api-client`:
  - `createApiClient({ baseUrl, getAuthToken, onUnauthorized })` factory returning typed `apiClient<T>(endpoint, options)`.
  - Added JSON headers, `AbortSignal.timeout(60000)` default, safe 204/empty response handling, Bearer token injection, structured JSON / text error parsing, 401 callback dispatch.
  - Added 7 unit tests covering success, 204, JSON errors, HTML errors, network failure, 401 callback, and timeout signals.
- Created `@journeyhome/schemas`:
  - Enforced exact backend domain status enums (`PlanStatus`, `PaymentStatus`, `ServiceRequestStatus`, `DocumentType`, `DocumentVerificationStatus`, `UserRole`, `PaymentPurpose`).
  - Added Zod schemas for packages, pricing tiers, contact, and `apiResponseSchema` envelope.
- Added `@journeyhome/ui/lib/format` exporting shared currency and date formatters.
- Added `@journeyhome/api-client` and `@journeyhome/schemas` dependencies to `apps/marketing/package.json`.
