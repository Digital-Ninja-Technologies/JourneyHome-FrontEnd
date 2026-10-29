import { cn } from "@journeyhome/ui/lib/utils";
import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import {
  Camera,
  CheckSquare,
  CreditCard,
  FileText,
  LayoutDashboard,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { CatchBoundary } from "@/components/catch-boundary";
import { initials } from "@/lib/format";
import {
  adminSessionQueryOptions,
  useAdminLogoutMutation,
  useAdminUser,
} from "@/modules/auth";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/users", label: "Users", icon: Users },
  { to: "/plans", label: "Plans", icon: FileText },
  { to: "/service-requests", label: "Service requests", icon: Camera },
  { to: "/payments", label: "Payments", icon: CreditCard },
  { to: "/audit-log", label: "Audit log", icon: CheckSquare },
  { to: "/settings", label: "Settings", icon: Settings },
];

export const Route = createFileRoute("/_protected")({
  beforeLoad: async ({ context, location }) => {
    const session = await context.queryClient.query(
      adminSessionQueryOptions(),
    );
    if (!session?.user) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
    return { session, user: session.user };
  },
  component: ProtectedLayout,
  errorComponent: CatchBoundary,
});

function ProtectedLayout() {
  const user = useAdminUser();
  const logoutMutation = useAdminLogoutMutation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Mobile backdrop overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-foreground/50 md:hidden"
        />
      )}

      {/* Sidebar: off-canvas drawer on mobile, sticky sidebar on desktop */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col gap-6 bg-sidebar p-5 text-canvas transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:sticky md:top-0 md:translate-x-0 md:w-60",
        )}
      >
        <div className="flex items-center justify-between">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="flex flex-col gap-1.5 px-1"
            aria-label="Journey Home admin console"
          >
            <span className="flex items-center gap-2.5">
              <svg width="26" height="26" viewBox="0 0 64 64" aria-hidden>
                <path
                  d="M16 56 V30 A16 16 0 0 1 48 30 V56"
                  fill="none"
                  stroke="#FBF9F4"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
                <circle cx="32" cy="40" r="6" fill="#D4A55A" />
                <line
                  x1="8"
                  y1="56"
                  x2="56"
                  y2="56"
                  stroke="#FBF9F4"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
              </svg>
              <span className="font-serif text-[22px]">Journey Home</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[2px] text-accent">
              Admin console
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="rounded-md p-1.5 text-canvas/60 hover:text-canvas md:hidden cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav aria-label="Main" className="flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <Link
              key={to}
              to={to as any}
              activeOptions={{ exact: end }}
              activeProps={{ className: "bg-[#2a2216] text-canvas" }}
              inactiveProps={{ className: "text-canvas/70 hover:text-canvas" }}
              onClick={() => setMobileOpen(false)}
              className="flex h-10 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold"
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn("size-[17px]", isActive && "text-accent")}
                  />
                  {label}
                </>
              )}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-3 border-t border-canvas/10 pt-4">
          <span className="grid size-9 place-items-center rounded-full bg-[#2a2216] text-xs font-bold text-accent">
            {user ? initials(user.name) : ""}
          </span>
          <div className="min-w-0 text-sm">
            <div className="truncate font-semibold">{user?.name}</div>
            <button
              type="button"
              onClick={() => logoutMutation.mutate()}
              className="text-xs text-canvas/60 underline"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area with mobile top header */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-canvas px-4 py-3.5 md:hidden">
          <Link
            to="/"
            className="flex items-center gap-2"
            aria-label="Journey Home admin"
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
            <span className="rounded bg-accent/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-link">
              Admin
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="rounded-md p-2 text-foreground cursor-pointer"
          >
            <Menu className="size-5" />
          </button>
        </header>

        <Outlet />
      </div>
    </div>
  );
}
