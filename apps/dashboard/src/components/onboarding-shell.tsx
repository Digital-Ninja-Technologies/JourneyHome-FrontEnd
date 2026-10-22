import { Logo } from "@journeyhome/ui/components/logo";
import { cn } from "@journeyhome/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

const MARKETING_URL = import.meta.env.VITE_MARKETING_URL ?? "/";
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

export function OnboardingShell({
  step,
  title,
  accent,
  subtitle,
  exitTo,
  children,
  width = "max-w-[560px]",
}: {
  step: number;
  title: string;
  accent: string;
  subtitle: string;
  exitTo?: string;
  children: React.ReactNode;
  width?: string;
}) {
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
      <div className={cn("flex w-full flex-col items-center gap-8", width)}>
        <Stepper current={step} />
        <div className="flex flex-col gap-2 text-center">
          <h1 className="font-sans text-4xl font-extrabold leading-[1.1] tracking-tight">
            {title}{" "}
            <span className="font-serif font-normal italic text-link">
              {accent}
            </span>
          </h1>
          <p className="text-sm leading-relaxed text-muted">{subtitle}</p>
        </div>
        <div className="flex w-full flex-col gap-6">{children}</div>
      </div>
    </div>
  );
}
