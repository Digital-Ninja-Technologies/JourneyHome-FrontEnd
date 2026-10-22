import { cn } from "@journeyhome/ui/lib/utils";
import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bell,
  Camera,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/auth/auth-context";

const NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/plans", label: "My plans", icon: FileText },
  { to: "/app/payments", label: "Payments", icon: CreditCard },
  { to: "/app/service-requests", label: "Service requests", icon: Camera },
  { to: "/app/notifications", label: "Notifications", icon: Bell },
  { to: "/app/profile", label: "Profile & settings", icon: User },
];

const COLLAPSE_KEY = "jh_nav_collapsed";

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === "1";
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/app")({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAuth();

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
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-foreground/50 md:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen w-[248px] shrink-0 flex-col gap-6 bg-foreground p-5 text-canvas transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:sticky md:top-0 md:translate-x-0 md:transition-[width]",
          collapsed ? "md:w-[72px] md:items-center md:px-3" : "md:w-[248px]",
        )}
      >
        <div
          className={cn(
            "flex items-center",
            collapsed ? "md:flex-col md:gap-3.5" : "justify-between",
          )}
        >
          <Link
            to="/app"
            className="flex items-center gap-2.5"
            aria-label="Journey Home"
            onClick={closeMobile}
          >
            <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden>
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
            {!(collapsed && !mobileOpen) && (
              <span
                className={cn(
                  "font-serif text-[22px]",
                  collapsed && "hidden md:inline",
                )}
              >
                Journey <span className="italic text-accent">Home</span>
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden rounded-md p-1 text-canvas/60 hover:text-canvas md:inline-flex"
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </button>
          <button
            type="button"
            onClick={closeMobile}
            aria-label="Close menu"
            className="rounded-md p-1 text-canvas/60 hover:text-canvas md:hidden"
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
              activeProps={{ className: "bg-canvas/10 text-canvas" }}
              inactiveProps={{ className: "text-canvas/70 hover:text-canvas" }}
              onClick={closeMobile}
              title={collapsed ? label : undefined}
              className={cn(
                "flex h-11 items-center gap-3 whitespace-nowrap rounded-xl px-3.5 text-sm font-semibold",
                collapsed && "md:justify-center md:px-0",
              )}
            >
              <Icon className="size-[18px] shrink-0" />
              <span className={cn(collapsed && "md:hidden")}>{label}</span>
            </Link>
          ))}
        </nav>

        <div
          className={cn(
            "mt-auto flex flex-col gap-3 rounded-2xl border border-canvas/20 p-5",
            collapsed && "md:hidden",
          )}
        >
          <div className="font-serif text-lg leading-snug">
            When the time comes,{" "}
            <span className="italic text-accent">we&rsquo;re here.</span>
          </div>
          <div className="text-xs leading-relaxed text-canvas/70">
            Submit documents and we&rsquo;ll coordinate everything, with care.
          </div>
          <Link
            to="/app/service-requests/new"
            onClick={closeMobile}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-accent text-sm font-bold text-foreground"
          >
            Request service
          </Link>
        </div>
        <div
          className={cn(
            "flex flex-col gap-1",
            collapsed && "md:mt-auto md:items-center",
          )}
        >
          <a
            href={import.meta.env.VITE_MARKETING_URL ?? "/"}
            title={collapsed ? "Back to site" : undefined}
            className={cn(
              "flex h-10 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold text-canvas/70 hover:text-canvas",
              collapsed && "md:justify-center md:px-0",
            )}
          >
            <ArrowLeft className="size-[18px] shrink-0" />
            <span className={cn(collapsed && "md:hidden")}>Back to site</span>
          </a>
          <button
            onClick={logout}
            title={collapsed ? "Log out" : undefined}
            className={cn(
              "flex h-10 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold text-canvas/70 hover:text-canvas",
              collapsed && "md:justify-center md:px-0",
            )}
          >
            <LogOut className="size-[18px] shrink-0" />
            <span className={cn(collapsed && "md:hidden")}>Log out</span>
          </button>
        </div>
      </aside>

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
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="rounded-md p-2 text-foreground"
          >
            <Menu className="size-5" />
          </button>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
