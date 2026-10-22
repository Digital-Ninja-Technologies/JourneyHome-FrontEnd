import { createRouter, Navigate } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";
import type { RouterContext } from "./routes/__root";

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
    },
  },
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultNotFoundComponent: () => <Navigate to="/app" replace />,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
