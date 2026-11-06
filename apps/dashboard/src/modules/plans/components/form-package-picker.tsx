import { FieldError } from "@journeyhome/ui/components/field";
import { cn } from "@journeyhome/ui/lib/utils";
import { type Control, useController } from "react-hook-form";
import { AsyncBoundary } from "@/components/async-boundary";
import { PackageChoiceSkeleton } from "@/components/skeletons";
import { formatMoney } from "@/lib/format";
import { usePackages } from "@/modules/packages/query-options";
import type { PlanFormValues } from "@/modules/plans/plan-form";

/**
 * Radio-card package chooser bound to the `packageId` form field.
 * Compact one-line rows on small screens, cards from `sm` up.
 */
export function FormPackagePicker({
  control,
  onChange,
}: {
  control: Control<PlanFormValues>;
  /** Called after the form value changes (e.g. to remember the choice). */
  onChange?: (id: string) => void;
}) {
  const packagesQ = usePackages();
  const { field, fieldState } = useController({ name: "packageId", control });

  return (
    <fieldset className="flex min-w-0 flex-col gap-3">
      <legend className="mb-3 text-sm font-bold sm:text-base">
        Choose a package
      </legend>
      <AsyncBoundary
        isLoading={packagesQ.isPending}
        isError={packagesQ.isError}
        error={packagesQ.error}
        onReset={() => void packagesQ.refetch()}
        loadingFallback={<PackageChoiceSkeleton count={3} />}
      >
        <div className="grid gap-2.5 sm:grid-cols-3 sm:gap-3">
          {packagesQ.data?.map((p) => {
            const checked = field.value === p._id;
            return (
              <label
                key={p._id}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-3.5 transition-colors",
                  "has-focus-visible:ring-2 has-focus-visible:ring-accent/40",
                  "sm:flex-col sm:items-stretch sm:gap-2 sm:p-4",
                  checked
                    ? "border-foreground bg-cream/50 ring-1 ring-foreground"
                    : "border-border bg-white hover:border-foreground/40",
                )}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <input
                    type="radio"
                    className="sr-only"
                    name={field.name}
                    value={p._id}
                    checked={checked}
                    onChange={() => {
                      field.onChange(p._id);
                      onChange?.(p._id);
                    }}
                    onBlur={field.onBlur}
                  />
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-[18px] shrink-0 place-items-center rounded-full border",
                      checked ? "border-foreground" : "border-border",
                    )}
                  >
                    {checked && (
                      <span className="size-2 rounded-full bg-foreground" />
                    )}
                  </span>
                  <span className="truncate text-sm font-bold">{p.name}</span>
                </span>
                <span className="shrink-0 text-base font-bold tracking-tight sm:text-xl">
                  {formatMoney(p.amount, p.currency)}
                  <span className="text-xs font-normal text-muted-foreground">
                    /mo
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </AsyncBoundary>
      <FieldError>{fieldState.error?.message}</FieldError>
    </fieldset>
  );
}
