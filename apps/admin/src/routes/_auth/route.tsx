import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Logo } from "@/components/layout/app-sidebar";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-sidebar px-6 pb-20 pt-16 text-canvas">
      <div className="flex flex-col items-center gap-3">
        <span className="flex items-center gap-2.5">
          <Logo className="text-canvas" />
          <span className="text-xl font-extrabold tracking-tight">
            Journey Home
          </span>
        </span>
        <span className="rounded-full border border-accent/50 px-3 py-1 text-[11px] font-bold uppercase tracking-[2px] text-accent">
          Admin console
        </span>
      </div>
      <div className="mt-10 flex w-full max-w-[420px] flex-col">
        <Outlet />
      </div>
    </div>
  );
}
