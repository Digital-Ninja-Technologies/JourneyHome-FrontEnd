import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRouter, Navigate } from "@tanstack/react-router";
import { makeQueryClient } from "./lib/query-client";
import { routeTree } from "./routeTree.gen";

export const queryClient = makeQueryClient();

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  Wrap: ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  ),
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultNotFoundComponent: () => <Navigate to="/app" replace />,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
