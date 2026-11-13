import { Button } from "@journeyhome/ui/components/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@journeyhome/ui/components/sidebar";
import { cn } from "@journeyhome/ui/lib/utils";
import type { LinkProps } from "@tanstack/react-router";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Bell,
  Camera,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings,
  Users,
  X,
} from "lucide-react";
import * as React from "react";
import { initials } from "@/lib/format";
import { useLogoutMutation } from "@/modules/auth/mutations";
import { useAdminUser } from "@/modules/auth/query-options";
import { useUnreadNotificationCount } from "@/modules/notifications/query-options";

export const NAV: {
  to: LinkProps["to"];
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
}[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/users", label: "Users", icon: Users },
  { to: "/plans", label: "Plans", icon: FileText },
  { to: "/service-requests", label: "Service requests", icon: Camera },
  { to: "/payments", label: "Payments", icon: CreditCard },
  { to: "/contact", label: "Contact messages", icon: Mail },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/audit-log", label: "Audit log", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 64 64"
      aria-hidden
      className={cn("shrink-0", className)}
    >
      <path
        d="M16 56 V30 A16 16 0 0 1 48 30 V56"
        fill="none"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <circle cx="32" cy="40" r="6" fill="#D4A55A" />
      <line
        x1="8"
        y1="56"
        x2="56"
        y2="56"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const itemClass =
  "flex h-11 w-full items-center gap-3 whitespace-nowrap rounded-xl px-3.5 text-sm font-semibold text-canvas/70 transition-colors hover:bg-canvas/10 hover:text-canvas";
const collapsedItemClass =
  "md:h-11 md:w-11 md:justify-center md:px-0 md:mx-auto";

export function AppSidebar({
  className,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { pathname } = useLocation();
  const { isMobile, openMobile, setOpenMobile, toggleSidebar, state } =
    useSidebar();
  const user = useAdminUser();
  const logoutMutation = useLogoutMutation();
  const unread = useUnreadNotificationCount();
  const isCollapsed = state === "collapsed";

  // Close the mobile drawer on navigation.
  // biome-ignore lint/correctness/useExhaustiveDependencies: depends on pathname
  React.useEffect(() => {
    if (isMobile && openMobile) setOpenMobile(false);
  }, [pathname]);

  return (
    <Sidebar
      collapsible="icon"
      className={cn("border-r-0 bg-sidebar text-canvas", className)}
      {...props}
    >
      <SidebarHeader
        className={cn(
          "p-5 pb-3 transition-[padding] duration-200",
          isCollapsed && "md:items-center md:px-3 md:pb-2",
        )}
      >
        <div
          className={cn(
            "flex w-full items-center",
            isCollapsed ? "md:flex-col md:gap-3.5" : "justify-between",
          )}
        >
          <Link
            to="/"
            aria-label="Journey Home admin console"
            className={cn(
              "flex flex-col gap-1 focus-visible:outline-none",
              isCollapsed && "md:items-center",
            )}
          >
            <span className="flex items-center gap-2.5">
              <Logo className="text-canvas" />
              {!isCollapsed && (
                <span className="whitespace-nowrap font-serif text-[22px] tracking-tight text-canvas">
                  Journey <span className="italic text-accent">Home</span>
                </span>
              )}
            </span>
            {!isCollapsed && (
              <span className="pl-[38px] text-[10px] font-bold uppercase tracking-[2px] text-accent">
                Admin console
              </span>
            )}
          </Link>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={toggleSidebar}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden text-canvas/60 hover:bg-canvas/10 hover:text-canvas md:inline-flex"
          >
            {isCollapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </Button>

          {isMobile && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setOpenMobile(false)}
              aria-label="Close menu"
              className="text-canvas/60 hover:bg-canvas/10 hover:text-canvas md:hidden"
            >
              <X className="size-5" />
            </Button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent
        className={cn("px-5 py-2", isCollapsed && "md:items-center md:px-3")}
      >
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {NAV.map(({ to, label, icon: Icon, end }) => (
                <SidebarMenuItem
                  key={to}
                  className={cn(
                    "w-full",
                    isCollapsed && "md:flex md:justify-center",
                  )}
                >
                  <SidebarMenuButton
                    tooltip={label}
                    className={cn(itemClass, isCollapsed && collapsedItemClass)}
                    render={
                      <Link
                        to={to}
                        activeOptions={{ exact: end }}
                        activeProps={{
                          className:
                            "bg-canvas/10 text-canvas hover:bg-canvas/10 hover:text-canvas [&_svg]:text-accent",
                        }}
                      />
                    }
                  >
                    <span className="relative shrink-0">
                      <Icon className="size-[18px]" />
                      {to === "/notifications" && unread > 0 && isCollapsed && (
                        <span className="absolute -right-1 -top-1 hidden size-2 rounded-full bg-accent md:block" />
                      )}
                    </span>
                    <span className={cn(isCollapsed && "md:hidden")}>
                      {label}
                    </span>
                    {to === "/notifications" && unread > 0 && (
                      <span
                        className={cn(
                          "ml-auto rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold tabular-nums text-sidebar",
                          isCollapsed && "md:hidden",
                        )}
                      >
                        {unread > 99 ? "99+" : unread}
                        <span className="sr-only"> unread</span>
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter
        className={cn(
          "flex flex-col gap-2 p-5 pt-2",
          isCollapsed && "md:items-center md:px-3 md:pb-5",
        )}
      >
        {user && (
          <div
            className={cn(
              "flex items-center gap-3 border-t border-canvas/10 pt-4",
              isCollapsed && "md:justify-center md:border-0 md:pt-0",
            )}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-canvas/10 text-xs font-bold text-accent">
              {initials(user.name)}
            </span>
            <div className={cn("min-w-0 text-sm", isCollapsed && "md:hidden")}>
              <div className="truncate font-semibold">{user.name}</div>
              <div className="truncate text-xs text-canvas/60">
                {user.isSuperAdmin ? "Super admin" : "Admin"}
              </div>
            </div>
          </div>
        )}
        <SidebarMenu className="gap-1">
          <SidebarMenuItem
            className={cn("w-full", isCollapsed && "md:flex md:justify-center")}
          >
            <SidebarMenuButton
              tooltip="Sign out"
              disabled={logoutMutation.isPending}
              className={cn(
                itemClass,
                "h-10",
                isCollapsed && collapsedItemClass,
              )}
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="size-[18px] shrink-0" />
              <span className={cn(isCollapsed && "md:hidden")}>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
