import { Button, buttonVariants } from "@journeyhome/ui/components/button";
import { cn } from "@journeyhome/ui/lib/utils";
import { Link } from "@tanstack/react-router";
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
  User,
  X,
} from "lucide-react";
import { env } from "#/env/client";
import { useLogoutMutation } from "@/modules/auth/mutations";

export const NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/plans", label: "My plans", icon: FileText },
  { to: "/app/payments", label: "Payments", icon: CreditCard },
  { to: "/app/service-requests", label: "Service requests", icon: Camera },
  { to: "/app/notifications", label: "Notifications", icon: Bell },
  { to: "/app/profile", label: "Profile & settings", icon: User },
];

export interface AppSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggle: () => void;
  onCloseMobile: () => void;
}

export function AppSidebar({
  collapsed,
  mobileOpen,
  onToggle,
  onCloseMobile,
}: AppSidebarProps) {
  const logoutMutation = useLogoutMutation();

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={onCloseMobile}
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
            onClick={onCloseMobile}
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
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden text-canvas/60 hover:bg-canvas/10 hover:text-canvas md:inline-flex"
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onCloseMobile}
            aria-label="Close menu"
            className="text-canvas/60 hover:bg-canvas/10 hover:text-canvas md:hidden"
          >
            <X className="size-5" />
          </Button>
        </div>

        <nav aria-label="Main" className="flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <Link
              key={to}
              to={to as any}
              activeOptions={{ exact: end }}
              activeProps={{ className: "bg-canvas/10 text-canvas" }}
              inactiveProps={{ className: "text-canvas/70 hover:text-canvas" }}
              onClick={onCloseMobile}
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
            onClick={onCloseMobile}
            className={cn(buttonVariants({ variant: "accent" }), "w-full")}
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
            href={env.VITE_MARKETING_URL}
            title={collapsed ? "Back to site" : undefined}
            className={cn(
              "flex h-10 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold text-canvas/70 hover:text-canvas",
              collapsed && "md:justify-center md:px-0",
            )}
          >
            <ArrowLeft className="size-[18px] shrink-0" />
            <span className={cn(collapsed && "md:hidden")}>Back to site</span>
          </a>
          <Button
            type="button"
            variant="ghost"
            onClick={() => logoutMutation.mutate()}
            title={collapsed ? "Log out" : undefined}
            className={cn(
              "flex h-10 w-full items-center justify-start gap-3 rounded-xl px-3.5 text-sm font-semibold text-canvas/70 hover:bg-canvas/10 hover:text-canvas",
              collapsed && "md:justify-center md:px-0",
            )}
          >
            <LogOut className="size-[18px] shrink-0" />
            <span className={cn(collapsed && "md:hidden")}>Log out</span>
          </Button>
        </div>
      </aside>
    </>
  );
}
