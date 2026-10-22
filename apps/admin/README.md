# @journeyhome/admin

The internal operations and staff console for Journey Home.

## Technology Stack

- **Framework:** React 19 + Vite (Client-side SPA)
- **Routing:** TanStack Router (`@tanstack/react-router` with Vite plugin `@tanstack/router-plugin`)
- **State & Data Fetching:** TanStack Query (`@tanstack/react-query`)
- **Validation:** Zod (`zod`) for route search parameter validation
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`) + `@journeyhome/ui`
- **Testing:** Playwright (`@playwright/test`)
- **Sessions:** Tab-scoped `sessionStorage` (`jh_admin_session`)

---

## Routing Guide

Routing is powered by **TanStack Router** using file-based routing under `src/routes/`.

### Route Structure Overview

- `src/routes/__root.tsx`: Root route wrapping the application with typed router context (`queryClient`, `auth`), `<ScrollRestoration />`, and `<Outlet />`.
- `src/routes/login.tsx`: Operations sign-in page with guest guard (redirects authenticated staff to preserved `redirect` target or `/`).
- `src/routes/_protected/route.tsx`: Protected pathless layout route enforcing authentication in `beforeLoad` and rendering the admin shell layout with sidebar navigation and `<Outlet />`.
- `src/routes/_protected/`: Authenticated staff pages:
  - `index.tsx`: Operations dashboard overview (`/`)
  - `users/index.tsx`: Customer directory list (`/users`)
  - `users/$id.tsx`: Customer detail view (`/users/:id`)
  - `plans/index.tsx`: Plans management list (`/plans`)
  - `plans/$id.tsx`: Plan detail and status transition editor (`/plans/:id`)
  - `service-requests/index.tsx`: Service requests queue (`/service-requests`)
  - `service-requests/$id.tsx`: Service request review, document verification, and status decisions (`/service-requests/:id`)
  - `payments.tsx`: Financial transactions table, KPIs, and CSV export (`/payments`)
  - `audit-log.tsx`: System and staff audit events stream with filters and CSV export (`/audit-log`)
  - `settings.tsx`: Plan pricing, notification preferences, session revocation, and admin team management (`/settings`)
- `src/routes/$.tsx`: Wildcard splat route redirecting all unknown paths to `/`.

---

### How to Add a New Route

1. **Create a route file** in `src/routes/`:
   - For an unnested/guest route, e.g. `/help`: create `src/routes/help.tsx`.
   - For an authenticated admin route, e.g. `/analytics`: create `src/routes/_protected/analytics.tsx`.
   - For a dynamic route, e.g. `/audit-log/:id`: create `src/routes/_protected/audit-log/$id.tsx`.

2. **Define the route definition**:

   ```tsx
   import { createFileRoute } from "@tanstack/react-router";
   import AnalyticsPage from "@/pages/analytics";

   export const Route = createFileRoute("/_protected/analytics")({
     component: AnalyticsPage,
   });
   ```

3. **Auto-generate the Route Tree**:
   - The Vite dev server (`pnpm dev`) automatically watches `src/routes/` and updates `src/routeTree.gen.ts`.
   - You can also run `pnpm build` or `vite build` which automatically regenerates `src/routeTree.gen.ts`.

---

### Authentication Guards (`beforeLoad` & Context)

Auth state is provided to TanStack Router via RouterContext in `src/router.tsx` and dynamically supplied in `src/app.tsx`:

```tsx
<RouterProvider
  router={router}
  context={{ queryClient, auth: { user, isSuperAdmin, logout } }}
/>
```

- When `user` state transitions (e.g. sign in or sign out), `app.tsx` calls `router.invalidate()` so active routes re-evaluate `beforeLoad`.
- **Protected Layout (`src/routes/_protected/route.tsx`)**:

  ```tsx
  export const Route = createFileRoute("/_protected")({
    beforeLoad: ({ context, location }) => {
      if (!context.auth.user) {
        throw redirect({
          to: "/login",
          search: { redirect: location.href },
        });
      }
    },
    component: AdminShell,
  });
  ```

- **Guest-Only Route (`src/routes/login.tsx`)**:

  ```tsx
  export const Route = createFileRoute("/login")({
    validateSearch: (search) => redirectSearchSchema.parse(search),
    beforeLoad: ({ context, search }) => {
      if (context.auth.user) {
        throw redirect({ to: search.redirect || "/" });
      }
    },
    component: Login,
  });
  ```

---

### Search Parameters (Zod Validation)

Search parameter validation uses reusable Zod schemas defined in `src/lib/search-schemas.ts`:

```tsx
import { redirectSearchSchema } from "@/lib/search-schemas";

export const Route = createFileRoute("/login")({
  validateSearch: (search) => redirectSearchSchema.parse(search),
  // ...
});
```

Components use typed hooks:
- **Read search params**: `const search = useSearch({ from: "/login" });`
- **Navigate with search params**:
  ```tsx
  navigate({ to: "/login", search: { redirect: "/settings" } });
  ```

---

### Navigation & Links

- **Sidebar Active Links**:

  ```tsx
  <Link
    to="/"
    activeOptions={{ exact: true }}
    activeProps={{ className: "bg-[#2a2216] text-canvas" }}
    inactiveProps={{ className: "text-canvas/70 hover:text-canvas" }}
    className="flex h-10 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold"
  >
    {({ isActive }) => (
      <>
        <Icon className={cn("size-[17px]", isActive && "text-accent")} />
        Dashboard
      </>
    )}
  </Link>
  ```

- **Dynamic Param Links**:

  ```tsx
  <Link to="/users/$id" params={{ id: customer._id }}>View</Link>
  <Link to="/plans/$id" params={{ id: plan._id }}>View</Link>
  <Link to="/service-requests/$id" params={{ id: request._id }}>View</Link>
  ```

---

## File Naming Conventions

All source files in `src/` use lowercase kebab-case naming:
- `routes/_protected/route.tsx`
- `components/demo-notice.tsx`
- `auth/auth-context.tsx`
- `pages/service-request-detail.tsx`
- `lib/search-schemas.ts`

---

## Development & Testing

```bash
# Start dev server on port 5174
pnpm dev

# Type check
pnpm typecheck

# Production build
pnpm build

# Run automated smoke test suite (Playwright)
pnpm test
```
