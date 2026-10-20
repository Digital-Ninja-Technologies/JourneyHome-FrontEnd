import { cn } from "../lib/utils";

export function Switch({
  checked, onCheckedChange, label, disabled, className,
}: { checked: boolean; onCheckedChange: (checked: boolean) => void; label: string; disabled?: boolean; className?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative h-[26px] w-11 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50",
        checked ? "bg-accent" : "bg-status-paused-bg",
        className,
      )}
    >
      <span className={cn("absolute top-[3px] size-5 rounded-full bg-white shadow transition-all", checked ? "left-[21px]" : "left-[3px]")} />
    </button>
  );
}
