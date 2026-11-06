import { Button, buttonVariants } from "@journeyhome/ui/components/button";
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
import * as React from "react";
import { env } from "#/env/client";
import { useLogoutMutation } from "@/modules/auth/mutations";

export const NAV: {
  to: LinkProps["to"];
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
}[] = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/plans", label: "My plans", icon: FileText },
  { to: "/app/payments", label: "Payments", icon: CreditCard },
  { to: "/app/service-requests", label: "Service requests", icon: Camera },
  { to: "/app/notifications", label: "Notifications", icon: Bell },
  { to: "/app/profile", label: "Profile & settings", icon: User },
];

export function AppSidebar({
  className,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { pathname } = useLocation();
  const { isMobile, openMobile, setOpenMobile, toggleSidebar, state } =
    useSidebar();
  const logoutMutation = useLogoutMutation();
  const isCollapsed = state === "collapsed";

  // Close mobile drawer on route change
  // biome-ignore lint/correctness/useExhaustiveDependencies: <depends on pathname>
  React.useEffect(() => {
    if (isMobile && openMobile) {
      setOpenMobile(false);
    }
  }, [pathname, isMobile, openMobile, setOpenMobile]);

  return (
    <Sidebar
      collapsible="icon"
      className={cn(
        "border-r-0 bg-foreground text-canvas",
        className,
      )}
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
            to="/app"
            className={cn(
              "flex items-center gap-2.5 focus-visible:outline-none",
              isCollapsed && "md:justify-center",
            )}
            aria-label="Journey Home"
            onClick={() => isMobile && setOpenMobile(false)}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 64 64"
              aria-hidden
              className="shrink-0"
            >
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
            {!isCollapsed && (
              <span className="font-serif text-[22px] tracking-tight whitespace-nowrap text-canvas group-data-[collapsible=icon]:hidden">
                Journey <span className="italic text-accent">Home</span>
              </span>
            )}
          </Link>

          {/* Toggle buttons - BOTH ARE AT THE TOP */}
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
        className={cn(
          "px-5 py-2 flex flex-col gap-6",
          isCollapsed && "md:items-center md:px-3",
        )}
      >
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {NAV.map(({ to, label, icon: Icon, end }) => (
                <SidebarMenuItem
                  key={to}
                  className={cn("w-full", isCollapsed && "md:flex md:justify-center")}
                >
                  <SidebarMenuButton
                    tooltip={label}
                    className={cn(
                      "flex h-11 w-full items-center gap-3 whitespace-nowrap rounded-xl px-3.5 text-sm font-semibold text-canvas/70 hover:bg-canvas/10 hover:text-canvas transition-colors",
                      isCollapsed &&
                        "md:h-11 md:w-11 md:justify-center md:px-0 md:mx-auto",
                    )}
                    render={
                      <Link
                        to={to}
                        activeOptions={{ exact: end }}
                        activeProps={{
                          className:
                            "bg-canvas/10 text-canvas font-semibold hover:bg-canvas/10 hover:text-canvas",
                        }}
                        inactiveProps={{
                          className: "text-canvas/70 hover:text-canvas",
                        }}
                        onClick={() => isMobile && setOpenMobile(false)}
                      />
                    }
                  >
                    <Icon className="size-[18px] shrink-0" />
                    <span className={cn(isCollapsed && "md:hidden")}>
                      {label}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div
          className={cn(
            "mt-auto flex flex-col gap-3 rounded-2xl border border-canvas/20 p-5 text-canvas",
            isCollapsed && "md:hidden",
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
            onClick={() => isMobile && setOpenMobile(false)}
            className={cn(buttonVariants({ variant: "accent" }), "w-full")}
          >
            Request service
          </Link>
        </div>
      </SidebarContent>

      <SidebarFooter
        className={cn(
          "p-5 pt-2 flex flex-col gap-1",
          isCollapsed && "md:items-center md:px-3 md:pb-5",
        )}
      >
        <SidebarMenu className="gap-1">
          <SidebarMenuItem
            className={cn("w-full", isCollapsed && "md:flex md:justify-center")}
          >
            <SidebarMenuButton
              tooltip="Back to site"
              className={cn(
                "flex h-10 w-full items-center gap-3 rounded-xl px-3.5 text-sm font-semibold text-canvas/70 hover:bg-canvas/10 hover:text-canvas transition-colors",
                isCollapsed &&
                  "md:h-10 md:w-10 md:justify-center md:px-0 md:mx-auto",
              )}
              render={<a href={env.VITE_MARKETING_URL} />}
            >
              <ArrowLeft className="size-[18px] shrink-0" />
              <span className={cn(isCollapsed && "md:hidden")}>Back to site</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem
            className={cn("w-full", isCollapsed && "md:flex md:justify-center")}
          >
            <SidebarMenuButton
              tooltip="Log out"
              className={cn(
                "flex h-10 w-full items-center justify-start gap-3 rounded-xl px-3.5 text-sm font-semibold text-canvas/70 hover:bg-canvas/10 hover:text-canvas transition-colors",
                isCollapsed &&
                  "md:h-10 md:w-10 md:justify-center md:px-0 md:mx-auto",
              )}
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="size-[18px] shrink-0" />
              <span className={cn(isCollapsed && "md:hidden")}>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
