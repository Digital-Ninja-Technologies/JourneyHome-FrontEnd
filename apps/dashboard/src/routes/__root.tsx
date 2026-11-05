import { RouteProgress } from "@journeyhome/ui/components/route-progress";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { CatchBoundary } from "@/components/catch-boundary";
import { Loader2 } from "lucide-react";

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  errorComponent: CatchBoundary,
  pendingComponent: () => (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="animate-spin h-4 w-4 text-brand" />
    </div>
  ),
});

function RootComponent() {
  return (
    <>
      <RouteProgress />
      <Outlet />
    </>
  );
}
