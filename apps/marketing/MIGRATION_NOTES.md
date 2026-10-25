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

### Stage 3 & 4: Feature Modularization & Query Architecture
- Created vertical slices under `src/modules/`:
  - `modules/packages/`:
    - `api.ts`: typed fetch for live packages using `@journeyhome/api-client` and `@journeyhome/schemas`.
    - `query-options.ts`: `packagesQueryOptions()` with 5min `staleTime` and fallback dummy packages.
- Wired TanStack Start SSR prefetching in routes:
  - `src/routes/index.tsx`: `loader: ({ context }) => void context.queryClient.ensureQueryData(packagesQueryOptions())`.
  - `src/routes/pricing.tsx`: `loader: ({ context }) => void context.queryClient.ensureQueryData(packagesQueryOptions())` and consumed via `useSuspenseQuery(packagesQueryOptions())`.

### Stage 5: TanStack Start SSR Query Integration
- Created `src/lib/query-client.ts`:
  - `makeQueryClient()` configuring 5min `staleTime` and 30min `gcTime`.
- Wired into TanStack Start in `src/router.tsx`:
  - Context setup: `context: { queryClient }`.
  - `setupRouterSsrQueryIntegration({ router, queryClient })` for transparent dehydration/hydration during Nitro SSR.
  - Included `ReactQueryDevtools` in development mode.

### Stage 6: Error Boundaries & Catch Boundaries
- Created class-based `ErrorBoundary` and `AsyncBoundary` in `src/components/async-boundary.tsx`.
- Created `CatchBoundary` in `src/components/catch-boundary.tsx` wired into `__root.tsx`.

### Stage 7: Build & Type Safety
- Verified zero build or TypeScript errors across the SSR bundle.


