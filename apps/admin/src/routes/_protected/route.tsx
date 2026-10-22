import { cn } from "@journeyhome/ui/lib/utils";
import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import {
  Camera,
  CheckSquare,
  CreditCard,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import { useAuth } from "@/auth/auth-context";
import { initials } from "@/lib/format";

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
  beforeLoad: ({ context, location }) => {
    if (!context.auth.user) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: ProtectedLayout,
});

function ProtectedLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col gap-6 bg-sidebar p-5 text-canvas">
        <Link
          to="/"
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
        <nav aria-label="Main" className="flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <Link
              key={to}
              to={to as any}
              activeOptions={{ exact: end }}
              activeProps={{ className: "bg-[#2a2216] text-canvas" }}
              inactiveProps={{ className: "text-canvas/70 hover:text-canvas" }}
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
              onClick={logout}
              className="text-xs text-canvas/60 underline"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
