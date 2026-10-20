import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Bell, ChevronLeft, ChevronRight, CreditCard, Camera, FileText, LayoutDashboard, User } from "lucide-react";
import { cn } from "@journeyhome/ui/lib/utils";

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

export function AppShell() {
  const [collapsed, setCollapsed] = useState(readCollapsed);

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

  return (
    <div className="flex min-h-screen">
      <aside
        className={cn(
          "sticky top-0 flex h-screen shrink-0 flex-col gap-6 bg-foreground p-5 text-canvas transition-[width] duration-200",
          collapsed ? "w-[72px] items-center px-3" : "w-[248px]",
        )}
      >
        <div className={cn("flex items-center", collapsed ? "flex-col gap-3.5" : "justify-between")}>
          <Link to="/app" className="flex items-center gap-2.5" aria-label="Journey Home">
            <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden>
              <path d="M16 56 V30 A16 16 0 0 1 48 30 V56" fill="none" stroke="#FBF9F4" strokeWidth="4.5" strokeLinecap="round" />
              <circle cx="32" cy="40" r="6" fill="#D4A55A" />
              <line x1="8" y1="56" x2="56" y2="56" stroke="#FBF9F4" strokeWidth="4.5" strokeLinecap="round" />
            </svg>
            {!collapsed && (
              <span className="font-serif text-[22px]">
                Journey <span className="italic text-accent">Home</span>
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="rounded-md p-1 text-canvas/60 hover:text-canvas"
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        </div>

        <nav aria-label="Main" className="flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                cn(
                  "flex h-11 items-center gap-3 whitespace-nowrap rounded-xl px-3.5 text-sm font-semibold",
                  collapsed && "justify-center px-0",
                  isActive ? "bg-canvas/10 text-canvas" : "text-canvas/70 hover:text-canvas",
                )
              }
            >
              <Icon className="size-[18px] shrink-0" />
              {!collapsed && label}
            </NavLink>
          ))}
        </nav>

        {!collapsed && (
          <div className="mt-auto flex flex-col gap-3 rounded-2xl border border-canvas/20 p-5">
            <div className="font-serif text-lg leading-snug">
              When the time comes, <span className="italic text-accent">we&rsquo;re here.</span>
            </div>
            <div className="text-xs leading-relaxed text-canvas/70">
              Submit documents and we&rsquo;ll coordinate everything, with care.
            </div>
            <Link
              to="/app/service-requests/new"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-accent text-sm font-bold text-foreground"
            >
              Request service
            </Link>
          </div>
        )}
      </aside>
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
