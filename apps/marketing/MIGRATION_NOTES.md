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

### Stage 2: Environment Validation with t3-env
- Installed `@t3-oss/env-core`.
- Created `src/env/server.ts` for SSR / Nitro server-only execution:
  - `APP_URL`: default `http://localhost:5173`
  - `SITE_URL`: default `https://journeyhome.ng`
  - `LOG_LEVEL`: default `info`
- Created `src/env/client.ts` with prefix `"VITE_"`, validating:
  - `VITE_API_BASE_URL`: URL default `http://localhost:4000/api/v1` (replacing `VITE_API_URL` and `NEXT_PUBLIC_API_URL`).
  - `VITE_APP_URL`: URL default `http://localhost:5173`.
  - `VITE_SITE_URL`: URL default `https://journeyhome.ng`.
- Added `#/` alias to `tsconfig.json` and `vite.config.ts`.
- Removed legacy `src/lib/env.ts` and updated `src/lib/config.ts` and `src/routes/sitemap[.]xml.ts`.
- Updated `.env.example`, `.env`, root `turbo.json` with `globalEnv` and task env passthrough, and `README.md` Vercel deployment documentation.

