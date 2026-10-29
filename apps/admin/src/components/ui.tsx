import { cn } from "@journeyhome/ui/lib/utils";

export type Tone =
  | "active"
  | "due"
  | "review"
  | "approved"
  | "paused"
  | "cancelled";

const TONES: Record<Tone, string> = {
  active: "bg-status-active-bg text-status-active",
  due: "bg-status-due-bg text-status-due",
  review: "bg-status-review-bg text-status-review",
  approved: "bg-status-approved-bg text-status-approved",
  paused: "bg-status-paused-bg text-status-paused",
  cancelled: "bg-status-cancelled-bg text-status-cancelled",
};

export function Pill({
  label,
  tone,
  className,
}: {
  label: string;
  tone: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold",
        TONES[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}

export const Card = ({ className, ...p }: React.ComponentProps<"section">) => (
  <section
    className={cn("rounded-2xl sm:rounded-3xl bg-white p-5 sm:p-7", className)}
    {...p}
  />
);

export const CardTitle = ({ className, ...p }: React.ComponentProps<"h2">) => (
  <h2 className={cn("font-serif text-[26px] font-normal", className)} {...p} />
);

export const Eyebrow = ({ className, ...p }: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "text-xs font-semibold uppercase tracking-[2px] text-muted",
      className,
    )}
    {...p}
  />
);

export function Field({
  label,
  children,
}: {
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <Eyebrow className="text-[11px]">{label}</Eyebrow>
      <div className="mt-1 text-[15px] font-medium">{children || "—"}</div>
    </div>
  );
}

export function PageHeader({
  crumb,
  title,
  accent,
  aside,
}: {
  crumb?: React.ReactNode;
  title: string;
  accent?: string;
  aside?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        {crumb && <div className="text-sm text-muted">{crumb}</div>}
        <h1 className="font-serif text-[32px] font-normal leading-[1.1] sm:text-[38px] md:text-[44px]">
          {title} {accent && <span className="italic">{accent}</span>}
        </h1>
      </div>
      {aside}
    </header>
  );
}

export function Chips<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group">
      {options.map((o) => (
        <button
          key={o.id}
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-semibold",
            value === o.id
              ? "bg-foreground text-canvas"
              : "bg-white text-ink-soft hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className="h-11 w-full max-w-[320px] rounded-xl border border-border bg-white px-4 text-sm placeholder:text-foreground/40 focus-visible:outline-2 focus-visible:outline-accent"
    />
  );
}

export function QueryError({
  error,
  retry,
}: {
  error: Error;
  retry: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-4 rounded-2xl bg-status-cancelled-bg px-5 py-4 text-sm text-status-cancelled"
    >
      <span>{error.message}</span>
      <button className="font-bold underline" onClick={retry}>
        Try again
      </button>
    </div>
  );
}
