import { env } from "#/env/client";
import { Logo } from "@journeyhome/ui/components/logo";
import { cn } from "@journeyhome/ui/lib/utils";
import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { Check } from "lucide-react";

const MARKETING_URL = env.VITE_MARKETING_URL;
const STEPS = ["Account", "Verify", "First plan", "Payment"];

function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-start" aria-label="Setup progress">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li
            key={label}
            className="flex items-start"
            aria-current={active ? "step" : undefined}
          >
            <div className="flex w-16 flex-col items-center gap-2">
              <span
                className={cn(
                  "grid size-[30px] place-items-center rounded-full text-xs font-bold",
                  done || active
                    ? "bg-foreground text-accent"
                    : "bg-sand text-muted",
                )}
              >
                {done ? <Check className="size-3.5" /> : n}
              </span>
              <span
                className={cn(
                  "text-[11px] font-semibold",
                  n > current && "text-muted",
                )}
              >
                {label}
              </span>
            </div>
            {n < STEPS.length && (
              <span
                className={cn(
                  "mt-[15px] h-px w-10",
                  done ? "bg-foreground" : "bg-border",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function getStep(pathname: string) {
  if (pathname.includes("/verify")) return 2;
  if (pathname.includes("/plan")) return 3;
  if (pathname.includes("/payment")) return 4;
  return 1;
}

export const Route = createFileRoute("/signup")({
  component: SignupLayout,
});

function SignupLayout() {
  const { pathname } = useLocation();
  const step = getStep(pathname);
  const exitTo = step > 1 ? "/app" : undefined;

  return (
    <div className="flex min-h-screen flex-col items-center bg-canvas px-6 pb-20 pt-9">
      <div className="mb-10 flex w-full max-w-[1200px] items-center justify-between">
        <a href={MARKETING_URL}>
          <Logo />
        </a>
        {exitTo ? (
          <Link
            to={exitTo as any}
            className="text-[13px] font-semibold text-muted"
          >
            Exit setup
          </Link>
        ) : (
          <a
            href={MARKETING_URL}
            className="text-[13px] font-semibold text-muted"
          >
            Exit setup
          </a>
        )}
      </div>
      <div className="flex w-full flex-col items-center gap-8">
        <Stepper current={step} />
        <Outlet />
      </div>
    </div>
  );
}
