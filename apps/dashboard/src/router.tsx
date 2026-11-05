import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { createRouter, Navigate } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { queryClient } from "./lib/query";
import { routeTree } from "./routeTree.gen";

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPendingMs: 300,
  defaultPendingMinMs: 300,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
  defaultNotFoundComponent: () => <Navigate to="/app" replace />,
  Wrap: ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}

      <TanStackDevtools
        config={{
          position: "bottom-left",
        }}
        plugins={[
          {
            name: "Tanstack Router",
            render: <TanStackRouterDevtoolsPanel router={router} />,
          },
          {
            name: "Tanstack Query",
            render: <ReactQueryDevtoolsPanel />,
          },
        ]}
      />
    </QueryClientProvider>
  ),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
