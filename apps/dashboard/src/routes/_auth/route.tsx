import { env } from "#/env/client";
import { Logo } from "@journeyhome/ui/components/logo";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-canvas px-6 pb-20 pt-9">
      <div className="mb-16 flex w-full max-w-[1200px] items-center justify-between">
        <a href={env.VITE_MARKETING_URL}>
          <Logo />
        </a>
        <a
          href={env.VITE_MARKETING_URL}
          className="text-[13px] font-semibold text-status-paused"
        >
          Back to site
        </a>
      </div>
      <div className="flex w-full max-w-[440px] flex-col gap-8">
        <Outlet />
      </div>
    </div>
  );
}
