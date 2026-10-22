import { QueryClient } from "@tanstack/react-query";
import { createRouter, Navigate } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
    auth: {
      user: null,
      isSuperAdmin: false,
      logout: () => {},
    },
  },
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultNotFoundComponent: () => <Navigate to="/" replace />,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
