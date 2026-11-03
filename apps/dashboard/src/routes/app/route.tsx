import { Button } from "@journeyhome/ui/components/button";
import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";
import { CatchBoundary } from "@/components/catch-boundary";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { sessionQueryOptions } from "@/modules/auth";

const COLLAPSE_KEY = "jh_nav_collapsed";

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === "1";
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/app")({
  beforeLoad: async ({ context, location }) => {
    const session = await context.queryClient.query(
      sessionQueryOptions(),
    );
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

function AppLayout() {
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  function toggle() {
    setCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, c ? "0" : "1");
      } catch {
        /* ignore */
      }
      return !c;
    });
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={toggle}
        onCloseMobile={closeMobile}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-canvas px-4 py-3.5 md:hidden">
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
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="text-foreground md:hidden"
          >
            <Menu className="size-5" />
          </Button>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
