import { cn } from "@journeyhome/ui/lib/utils";
import { STEPS } from "@/modules/service-requests/service-requests.utils";

/** Five-step progress for a request. `step` is 1-5 (0 renders nothing). `dark` is for dark surfaces. */
export function RequestProgress({
  step,
  dark = false,
}: {
  step: number;
  dark?: boolean;
}) {
  if (step <= 0) return null;
  const current = STEPS[Math.min(step, STEPS.length) - 1];

  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid grid-cols-5 gap-2 sm:gap-3" aria-hidden>
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={cn(
              "h-1 rounded-full",
              i < step ? "bg-accent" : dark ? "bg-canvas/15" : "bg-border",
            )}
          />
        ))}
      </div>
      <p
        className={cn(
          "text-xs sm:hidden",
          dark ? "text-canvas/70" : "text-muted-foreground",
        )}
      >
        Step {step} of {STEPS.length} ·{" "}
        <span className="font-bold text-accent">{current}</span>
      </p>
      <ol className="hidden grid-cols-5 gap-3 text-xs sm:grid">
        {STEPS.map((s, i) => (
          <li
            key={s}
            aria-current={i === step - 1 ? "step" : undefined}
            className={cn(
              i === step - 1
                ? "font-bold text-accent"
                : i < step
                  ? dark
                    ? "text-accent/80"
                    : "text-foreground"
                  : dark
                    ? "text-canvas/70"
                    : "text-muted-foreground",
            )}
          >
            {s}
          </li>
        ))}
      </ol>
    </div>
  );
}
