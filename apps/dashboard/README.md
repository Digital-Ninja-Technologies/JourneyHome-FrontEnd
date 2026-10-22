# @journeyhome/dashboard

The customer web application and onboarding flow for Journey Home.

## Technology Stack

- **Framework:** React 19 + Vite (Client-side SPA)
- **Routing:** TanStack Router (`@tanstack/react-router` with Vite plugin `@tanstack/router-plugin`)
- **State & Data Fetching:** TanStack Query (`@tanstack/react-query`)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`) + `@journeyhome/ui`
- **Testing:** Playwright (`@playwright/test`)

---

## Routing Guide

Routing is powered by **TanStack Router** using file-based routing under `src/routes/`.

### Route Structure Overview

- `src/routes/__root.tsx`: The root route wrapping the entire application with router context (`queryClient`, `auth`), `<ScrollRestoration />`, and `<Outlet />`.
- `src/routes/index.tsx`: Root URL redirect (`/` redirects to `/app`).
- `src/routes/login.tsx`: Login page with guest guard.
- `src/routes/forgot-password.tsx`, `src/routes/reset-password.tsx`: Password recovery.
- `src/routes/signup/`: Onboarding flow (`index`, `verify`, `plan`, `payment`).
- `src/routes/welcome.tsx`: Post-onboarding celebration page.
- `src/routes/app/route.tsx`: Protected layout wrapping customer pages in `AppShell` with an authentication guard.
- `src/routes/app/`: Customer dashboard routes:
  - `index.tsx`: Dashboard overview
  - `plans/index.tsx`: Plans list (supports `?new=1` search param)
  - `plans/$id.tsx`: Plan detail (dynamic `$id` param)
  - `service-requests/index.tsx`: Service requests
  - `service-requests/new.tsx`: Request service (supports `?plan=...` search param)
  - `notifications.tsx`: Notifications
  - `payments/index.tsx`: Payment history (supports `?plan=...` search param)
  - `payments/new.tsx`: Make payment (supports `?plan=...` search param)
  - `payments/callback.tsx`: Paystack payment callback (supports `?reference=...&trxref=...`)
  - `profile.tsx`: Profile & settings (supports `?card_added=1`)

---

### How to Add a New Route

1. **Create a route file** in `src/routes/`:
   - For an unnested route, e.g. `/terms`: create `src/routes/terms.tsx`.
   - For a protected app route, e.g. `/app/documents`: create `src/routes/app/documents.tsx`.
   - For a dynamic route, e.g. `/app/documents/:docId`: create `src/routes/app/documents/$docId.tsx`.

2. **Define the route definition**:
   ```tsx
   import { createFileRoute } from "@tanstack/react-router";
   import MyPage from "../../pages/MyPage";

   export const Route = createFileRoute("/app/documents/$docId")({
     component: MyPage,
   });
   ```

3. **Auto-generate the Route Tree**:
   - The Vite dev server (`pnpm dev`) automatically watches `src/routes/` and updates `src/routeTree.gen.ts`.
   - You can also run `pnpm build` or `vite build` which automatically regenerates `src/routeTree.gen.ts`.

---

### Authentication Guards (`beforeLoad` & Context)

Auth state is provided to TanStack Router via RouterContext in `src/router.tsx` and updated dynamically in `src/App.tsx`:

```tsx
<RouterProvider router={router} context={{ queryClient, auth: { user } }} />
```

- When `user` state transitions, `App.tsx` calls `router.invalidate()` so that all active routes re-evaluate `beforeLoad`.
- **Protected Layout (`src/routes/app/route.tsx`)**:
  ```tsx
  export const Route = createFileRoute("/app")({
    beforeLoad: ({ context, location }) => {
      if (!context.auth.user) {
        throw redirect({
          to: "/login",
          search: { redirect: location.href },
        });
      }
    },
    component: AppShell,
  });
  ```
- **Guest-Only Routes (`/login`, `/signup`)**:
  ```tsx
  beforeLoad: ({ context, search }) => {
    if (context.auth.user) {
      throw redirect({ to: search.redirect || "/app" });
    }
  }
  ```

---

### Search Parameters (`validateSearch` & Type Safety)

All search parameters are typed and validated using `validateSearch`:

```tsx
interface PlansSearch {
  new?: string;
}

export const Route = createFileRoute("/app/plans/")({
  validateSearch: (search: Record<string, unknown>): PlansSearch => ({
    new: search.new != null ? String(search.new) : undefined,
  }),
  component: Plans,
});
```

Components use typed hooks:
- **Read search params**: `const search = useSearch({ from: "/app/plans/" });`
- **Update search params**:
  ```tsx
  const navigate = useNavigate({ from: "/app/plans/" });
  navigate({ search: { new: "1" }, replace: true });
  ```

---

### Navigation & Links

- **Active Links**:
  ```tsx
  <Link
    to="/app/plans"
    activeProps={{ className: "bg-canvas/10 text-canvas" }}
    inactiveProps={{ className: "text-canvas/70 hover:text-canvas" }}
    activeOptions={{ exact: true }}
  >
    Plans
  </Link>
  ```
- **Dynamic Param Links**:
  ```tsx
  <Link to="/app/plans/$id" params={{ id: plan._id }}>View Plan</Link>
  ```

---

## Development & Testing

```bash
# Start dev server on port 5173
pnpm dev

# Type check
pnpm typecheck

# Production build
pnpm build

# Run automated smoke test suite (Playwright)
pnpm test
```
