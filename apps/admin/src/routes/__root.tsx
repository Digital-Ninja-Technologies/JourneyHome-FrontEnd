import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import type { User } from "@/auth/auth-context";

export interface RouterContext {
  queryClient: QueryClient;
  auth: {
    user: User | null;
    isSuperAdmin: boolean;
    logout: () => void;
  };
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return <Outlet />;
}
