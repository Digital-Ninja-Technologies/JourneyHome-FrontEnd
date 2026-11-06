import { cn } from "@journeyhome/ui/lib/utils";

/** Label + value pair for detail screens. Empty values render an em dash. */
export function DetailItem({
  label,
  children,
  className,
}: {
  label: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-[11px] font-semibold uppercase tracking-[2px] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 break-words text-[15px] font-medium">
        {children || "—"}
      </dd>
    </div>
  );
}

export function DetailGrid({
  className,
  ...props
}: React.ComponentProps<"dl">) {
  return (
    <dl
      className={cn(
        "grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
      {...props}
    />
  );
}
