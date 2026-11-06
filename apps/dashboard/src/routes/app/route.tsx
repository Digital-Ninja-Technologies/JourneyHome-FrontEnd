import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@journeyhome/ui/components/sidebar";
import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { CatchBoundary } from "@/components/catch-boundary";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { setPendingVerificationEmail } from "@/modules/auth/api";
import { sessionQueryOptions } from "@/modules/auth/query-options";
import { clearStoredSelectedPackage } from "@/modules/onboarding/storage";
import { setOnboardingPlan } from "@/modules/payments/checkout";

export const Route = createFileRoute("/app")({
  beforeLoad: async ({ context, location }) => {
    const session = await context.queryClient.query(sessionQueryOptions());
    if (!session?.user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
    return { session, user: session.user };
  },
  component: AppLayout,
  errorComponent: CatchBoundary,
});

function getSidebarStateFromCookie(): boolean {
  if (typeof document === "undefined") return true;
  const match = document.cookie.match(/sidebar_state=([^;]+)/);
  if (!match) return true;
  return match[1] === "true";
}

function AppLayout() {
  useEffect(() => {
    clearStoredSelectedPackage();
    setOnboardingPlan(null);
    setPendingVerificationEmail(null);
  }, []);

  return (
    <SidebarProvider
      defaultOpen={getSidebarStateFromCookie()}
      className="min-w-0 max-w-full"
    >
      <AppSidebar />
      <SidebarInset className="min-w-0 max-w-full overflow-x-hidden flex flex-1 flex-col bg-canvas">
        {/* Mobile sticky header with SidebarTrigger and Logo */}
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-canvas px-4 py-3.5 md:hidden">
          <SidebarTrigger className="-ml-1.5 text-foreground md:hidden" />
          <Link
            to="/app"
            className="flex items-center gap-2"
            aria-label="Journey Home"
          >
            <svg width="24" height="24" viewBox="0 0 64 64" aria-hidden>
              <path
                d="M16 56 V30 A16 16 0 0 1 48 30 V56"
                fill="none"
                stroke="#0F2420"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              <circle cx="32" cy="40" r="6" fill="#D4A55A" />
              <line
                x1="8"
                y1="56"
                x2="56"
                y2="56"
                stroke="#0F2420"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
            </svg>
            <span className="font-serif text-lg text-foreground">
              Journey <span className="italic text-link">Home</span>
            </span>
          </Link>
        </header>

        <div className="page-wrapper flex flex-1 flex-col min-w-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
