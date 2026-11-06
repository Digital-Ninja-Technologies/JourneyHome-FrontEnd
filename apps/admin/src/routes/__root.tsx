import { RouteProgress } from "@journeyhome/ui/components/route-progress";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { CatchBoundary } from "@/components/catch-boundary";

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  errorComponent: CatchBoundary,
  pendingComponent: () => (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="size-4 animate-spin text-brand" />
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
