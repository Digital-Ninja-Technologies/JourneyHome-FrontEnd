# JourneyHome Marketing: Next.js to TanStack Start Migration Notes

## Stage 0: Baseline & Inventory

### 1. Route Inventory
| Route Path | Source File | Status | Revalidate | Layouts / Wrappers | Dynamic Segments | Notes |
|------------|-------------|--------|------------|---------------------|------------------|-------|
| `/` | `app/page.tsx` | 200 | 300s | `app/layout.tsx` | None | Live packages fetched via `getPackages()`, Bento grid, Testimonials, CTA |
| `/how-it-works` | `app/how-it-works/page.tsx` | 200 | Static | `app/layout.tsx` | None | 4-step walkthrough, steps & panels |
| `/pricing` | `app/pricing/page.tsx` | 200 | 300s | `app/layout.tsx` | None | Live packages fetched via `getPackages()`, comparison matrix table |
| `/about` | `app/about/page.tsx` | 200 | Static | `app/layout.tsx` | None | Origin story, mission, 5 values, milestones |
| `/faq` | `app/faq/page.tsx` | 200 | Static | `app/layout.tsx` | None | `<details>/<summary>` accordion, help CTA |
| `/contact` | `app/contact/page.tsx` | 200 | Static | `app/layout.tsx` | None | Contact form with topic selector + contact details cards |
| `/terms` | `app/terms/page.tsx` | 200 | Static | `app/layout.tsx` | None | Plan terms & conditions via `LegalPage` |
| `/privacy` | `app/privacy/page.tsx` | 200 | Static | `app/layout.tsx` | None | Privacy policy via `LegalPage` |
| `_not-found` | Built-in Next.js | 404 | Dynamic | `app/layout.tsx` | None | Returns `404: This page could not be found.` with `robots: noindex` |

*Note on Route Count:* The task description noted 7 pages, but the codebase and build inventory confirm 8 public routes (`/`, `/how-it-works`, `/pricing`, `/about`, `/faq`, `/contact`, `/terms`, `/privacy`).

### 2. Next.js Imports Inventory
- `next/link`:
  - `apps/marketing/app/page.tsx` (lines 1, 48, 154, 182)
  - `apps/marketing/components/SiteHeader.tsx` (lines 4, 30, 37, 81)
  - `apps/marketing/components/SiteFooter.tsx` (lines 1, 24)
  - `apps/marketing/app/terms/page.tsx` (lines 2, 24)
  - `apps/marketing/app/privacy/page.tsx` (lines 2, 24)
- `next/navigation`:
  - `apps/marketing/components/SiteHeader.tsx` (line 5: `usePathname`)
- `next/image`:
  - **None**. `apps/marketing/components/Photo.tsx` uses native `<img>` elements with `object-cover`. No Next.js image optimization is used.
- `next/font`:
  - **None**. Web fonts (Instrument Serif and Manrope) are loaded via Google Fonts `@import url(...)` in `@journeyhome/ui/src/styles/globals.css`.
- `next/head`, `next/script`, `next/headers`:
  - **None**.
- `next` (types):
  - `apps/marketing/app/layout.tsx` (`Metadata`)
  - `apps/marketing/app/about/page.tsx` (`Metadata`)
  - `apps/marketing/app/contact/page.tsx` (`Metadata`)
  - `apps/marketing/app/faq/page.tsx` (`Metadata`)
  - `apps/marketing/app/how-it-works/page.tsx` (`Metadata`)
  - `apps/marketing/app/pricing/page.tsx` (`Metadata`)
  - `apps/marketing/app/privacy/page.tsx` (`Metadata`)
  - `apps/marketing/app/terms/page.tsx` (`Metadata`)
  - `apps/marketing/next.config.ts` (`NextConfig`)

### 3. Metadata & SEO Exports
- Root Layout (`app/layout.tsx`):
  - `title`: `{ default: "Journey Home — Save ahead. Prepare with dignity.", template: "%s · Journey Home" }`
  - `description`: `"Families save a little each month toward professional photography and videography for a loved one's burial."`
- Page Titles:
  - `/`: `Journey Home — Save ahead. Prepare with dignity.` (default title)
  - `/how-it-works`: `How it works · Journey Home`
  - `/pricing`: `Pricing · Journey Home`
  - `/about`: `About us · Journey Home`
  - `/faq`: `FAQ · Journey Home`
  - `/contact`: `Contact · Journey Home`
  - `/terms`: `Plan terms & conditions · Journey Home`
  - `/privacy`: `Privacy policy · Journey Home`
- Canonical / Open Graph / Twitter / Robots:
  - Not explicitly specified in the Next.js pages (except default robots on 404). In Stage 5, these will be explicitly configured on TanStack Start routes with canonical URLs, Open Graph, Twitter cards, and robots meta.

### 4. Special Files
- `apps/marketing/app/icon.svg`: Favicon SVG (393 bytes)
- `apps/marketing/app/apple-icon.png`: Apple touch icon PNG (3,988 bytes)
- `sitemap.xml`: Absent in Next.js baseline (404); will be created in Stage 5.
- `robots.txt`: Absent in Next.js baseline (404); will be created in Stage 5.
- `manifest`: None.
- `not-found`: Implicit default in Next.js; will have explicit `notFoundComponent` in Start.
- `error`: Implicit default in Next.js; will have explicit `errorComponent` in Start.
- `loading`: None.

### 5. Data Fetching & Caching
- `apps/marketing/lib/packages.ts`:
  - `getPackages()`: Async function returning `Package[] | null`.
  - Currently returns static mockup tiers (`Basic`, `Standard`, `Premium`) sorted by `monthlyContributionMinor`.
  - Ready for backend integration via `NEXT_PUBLIC_API_URL` / `VITE_API_URL` (`/api/v1`).
- Revalidation:
  - `app/page.tsx` and `app/pricing/page.tsx` export `revalidate = 300` (5 minutes).
  - Production Next.js server sends `Cache-Control: s-maxage=300, stale-while-revalidate=31535700`.
  - Static pages send `Cache-Control: s-maxage=31536000`.

### 6. Server vs Client Components
- `'use client'` files:
  - `apps/marketing/components/SiteHeader.tsx`: Needs state for mobile navigation dropdown drawer (`open`), pathname detection to highlight active nav link and close drawer.
  - `apps/marketing/components/ContactForm.tsx`: Needs state for topic selection pill buttons (`topic`) and `onSubmit` mailto handler.
- `'use server'` files:
  - **None**.
- Server-rendered / static components:
  - All pages and layouts are server rendered. No server-only secrets or private database queries exist in the marketing app.

### 7. Environment Variables & Next.js Configuration
- Env Vars:
  - `NEXT_PUBLIC_API_URL`: Backend URL (default: `http://localhost:3043/api/v1`).
  - `NEXT_PUBLIC_APP_URL`: Customer web app / dashboard URL (default: `http://localhost:5173`).
  - Used in `apps/marketing/lib/config.ts` for `SIGNUP_URL` (`${APP_URL}/signup`) and `LOGIN_URL` (`${APP_URL}/login`).
- `next.config.ts`:
  - `transpilePackages: ["@journeyhome/ui"]`
  - No redirects, rewrites, or custom headers in `next.config.ts`.
  - Next.js default redirects trailing slashes to non-trailing slashes via 308 (e.g. `/how-it-works/` -> `/how-it-works`).

### 8. Contact Form & Image Handling
- Contact Form:
  - No backend POST endpoint exists in backend specs.
  - Submitting composes a `mailto:hello@journeyhome.ng` link with subject and encoded body (`message`, `name`, `phone`, `email`), then opens visitor's default email client via `window.location.href`.
- Images:
  - Stored in `apps/marketing/public/images/`: `hero.webp`, `how-step-1.webp`, `photographer.webp`, `testimonial.webp`, `team-1.webp`, `how-step-4.webp`, `team-2.webp`, `how-it-works.webp`.
  - Mapped via `apps/marketing/lib/images.ts`.
  - Rendered via `Photo.tsx` with fallback placeholder when null.

### 9. Styling & Theme Tokens
- Tailwind CSS v4 is used across the monorepo.
- `apps/marketing/app/globals.css` imports `@journeyhome/ui/styles/globals.css` and sets `@source "../../../packages/ui/src"`.
- Typography:
  - Sans: `Manrope`
  - Serif: `Instrument Serif`
  - Loaded via Google Fonts CSS `@import` in `packages/ui/src/styles/globals.css`.
- Theme colors defined in Tailwind v4 `@theme`:
  - Canvas: `#fbf9f4`, Background: `#f3efe7`, Foreground: `#0f2420`
  - Accent: `#d4a55a`, Link: `#8a6224`, Link-hover: `#5c3b0c`
  - Sand: `#f0eadc`, Cream: `#f6e8d0`, Muted: `#5a6660`, Forest: `#1b2f2a`
  - Status tokens: active, due, review, approved, paused, cancelled

---

## Behavior Contract (Empirical Baseline)

| URL Path | Status | Target `<title>` | Target Meta Description | Target Robots | Target Cache-Control | Canonical |
|----------|--------|------------------|-------------------------|---------------|----------------------|-----------|
| `/` | 200 | `Journey Home — Save ahead. Prepare with dignity.` | Families save a little each month toward professional photography and videography for a loved one's burial. | `index, follow` (default) | `s-maxage=300, stale-while-revalidate=31535700` | Self (`https://journeyhome.ng/`) |
| `/how-it-works` | 200 | `How it works · Journey Home` | Families save a little each month toward professional photography and videography for a loved one's burial. | `index, follow` (default) | `s-maxage=31536000` | Self (`https://journeyhome.ng/how-it-works`) |
| `/pricing` | 200 | `Pricing · Journey Home` | Families save a little each month toward professional photography and videography for a loved one's burial. | `index, follow` (default) | `s-maxage=300, stale-while-revalidate=31535700` | Self (`https://journeyhome.ng/pricing`) |
| `/about` | 200 | `About us · Journey Home` | Families save a little each month toward professional photography and videography for a loved one's burial. | `index, follow` (default) | `s-maxage=31536000` | Self (`https://journeyhome.ng/about`) |
| `/faq` | 200 | `FAQ · Journey Home` | Families save a little each month toward professional photography and videography for a loved one's burial. | `index, follow` (default) | `s-maxage=31536000` | Self (`https://journeyhome.ng/faq`) |
| `/contact` | 200 | `Contact · Journey Home` | Families save a little each month toward professional photography and videography for a loved one's burial. | `index, follow` (default) | `s-maxage=31536000` | Self (`https://journeyhome.ng/contact`) |
| `/terms` | 200 | `Plan terms & conditions · Journey Home` | Families save a little each month toward professional photography and videography for a loved one's burial. | `index, follow` (default) | `s-maxage=31536000` | Self (`https://journeyhome.ng/terms`) |
| `/privacy` | 200 | `Privacy policy · Journey Home` | Families save a little each month toward professional photography and videography for a loved one's burial. | `index, follow` (default) | `s-maxage=31536000` | Self (`https://journeyhome.ng/privacy`) |
| `/non-existent` | 404 | `404: This page could not be found.` | Inherited | `noindex` | `private, no-cache, no-store, max-age=0` | None |
| `<path>/` | 308 | N/A (Redirect to `<path>`) | N/A | N/A | N/A | N/A |

### Special Endpoints
- `/icon.svg`: 200 OK (`image/svg+xml`)
- `/apple-icon.png`: 200 OK (`image/png`)
- `/sitemap.xml`: 200 OK (`application/xml`), includes all 8 public routes (to be added in Stage 5)
- `/robots.txt`: 200 OK (`text/plain`), allows indexing, points to sitemap (to be added in Stage 5)

---

## Stage 1 Implementation: Scaffold TanStack Start
- Installed `@tanstack/react-start` (`^1.169.3`), `@tanstack/react-router` (`^1.170.45`), `nitro` (`3.0.260903-beta`), `vite` (`^8.3.4`), `@vitejs/plugin-react` (`^6.1.2`), `@tailwindcss/vite` (`^4.3.3`).
- Created `apps/marketing/vite.config.ts` configuring TanStack Start, Nitro, React, Tailwind v4, and `@/` path alias.
- Created `src/styles/globals.css` with `@journeyhome/ui` styling and tokens.
- Created `src/routes/__root.tsx` document shell with `<HeadContent />`, `<Scripts />`, Google Fonts links, `<SiteHeader />`, and `<SiteFooter />`.
- Created placeholder `src/routes/index.tsx` and configured `src/router.tsx` (`createRouter`, `getRouter`).
- Verified `routeTree.gen.ts` generation and dev server boot on port 3001.

---

## Stage 2 Implementation: Shared Infrastructure
- **Env vars (`src/lib/env.ts`):** Created typed environment access mapping `VITE_API_URL` (fallback `NEXT_PUBLIC_API_URL`), `VITE_APP_URL` (fallback `NEXT_PUBLIC_APP_URL`), and `VITE_SITE_ORIGIN` (fallback `NEXT_PUBLIC_SITE_ORIGIN`). Dual keys added to `.env.example`.
- **Helpers (`src/lib/`):** Ported `images.ts`, `packages.ts`, and updated `config.ts`.
- **Components (`src/components/`):** Ported `Photo.tsx`, `Section.tsx`, `PackageCards.tsx`, `LegalPage.tsx`, `ContactForm.tsx`.
- **Images:** Plain `<img>` elements used with `loading="lazy"` where applicable and `object-cover`. Static WebP assets served from `public/images/`.
- **Fonts:** Added `<link rel="preconnect">` and Google Fonts `<link rel="stylesheet">` directly into root document head in `src/routes/__root.tsx`.
- **Link usage convention:** TanStack Router `<Link to="...">` used for all internal routing; plain `<a href="...">` used for external links (dashboard login/signup, mailto).
- Verified whole-monorepo `pnpm typecheck` and `pnpm --filter @journeyhome/marketing build` (Next.js baseline remains fully runnable).
