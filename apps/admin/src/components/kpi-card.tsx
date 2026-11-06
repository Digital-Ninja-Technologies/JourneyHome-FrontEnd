import { cn } from "@journeyhome/ui/lib/utils";

export function KpiCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: "due" | "danger" | "muted";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 rounded-[20px] p-5 sm:p-6",
        tone === "due" ? "bg-cream" : "bg-white shadow-sm",
      )}
    >
      <div
        className={cn(
          "text-[11px] font-semibold uppercase tracking-[2px]",
          tone === "due" ? "text-status-due" : "text-muted-foreground",
        )}
      >
        {label}
      </div>
      <div
        className={cn(
          "font-serif text-[30px] leading-tight tabular-nums",
          tone === "danger" && "text-status-cancelled",
          tone === "muted" && "text-muted-foreground",
        )}
      >
        {value}
      </div>
      {sub && <div className="text-[13px] text-muted-foreground">{sub}</div>}
    </div>
  );
}
