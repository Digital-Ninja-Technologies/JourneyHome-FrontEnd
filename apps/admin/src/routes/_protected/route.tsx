import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@journeyhome/ui/components/sidebar";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { CatchBoundary } from "@/components/catch-boundary";
import { AppSidebar, Logo } from "@/components/layout/app-sidebar";
import { sessionQueryOptions } from "@/modules/auth/query-options";

export const Route = createFileRoute("/_protected")({
  beforeLoad: async ({ context, location }) => {
    const session = await context.queryClient.query(sessionQueryOptions());
    if (!session?.user) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
    return { session, user: session.user };
  },
  component: ProtectedLayout,
  errorComponent: CatchBoundary,
});

function getSidebarStateFromCookie(): boolean {
  if (typeof document === "undefined") return true;
  const match = document.cookie.match(/sidebar_state=([^;]+)/);
  return match ? match[1] === "true" : true;
}

function ProtectedLayout() {
  return (
    <SidebarProvider
      defaultOpen={getSidebarStateFromCookie()}
      className="min-w-0 max-w-full"
    >
      <AppSidebar />
      <SidebarInset className="flex min-w-0 max-w-full flex-1 flex-col overflow-x-hidden bg-canvas">
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-canvas px-4 py-3.5 md:hidden">
          <SidebarTrigger className="-ml-1.5 text-foreground md:hidden" />
          <Link
            to="/"
            className="flex items-center gap-2"
            aria-label="Journey Home admin"
          >
            <Logo className="size-6 text-foreground" />
            <span className="font-serif text-lg text-foreground">
              Journey <span className="italic text-link">Home</span>
            </span>
            <span className="rounded bg-accent/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-link">
              Admin
            </span>
          </Link>
        </header>

        <div className="page-wrapper flex min-w-0 flex-1 flex-col">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
