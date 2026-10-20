import { useRef } from "react";
import { cn } from "@journeyhome/ui/lib/utils";

/** Six single-digit boxes with auto-advance, backspace and paste support. */
export function OtpInput({ value, onChange, length = 6, invalid }: { value: string; onChange: (v: string) => void; length?: number; invalid?: boolean }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  function set(i: number, d: string) {
    const next = digits.slice();
    next[i] = d;
    onChange(next.join("").slice(0, length));
  }

  return (
    <div className="flex justify-center gap-2.5" role="group" aria-label="Verification code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          value={d}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={invalid}
          onChange={(e) => {
            const ch = e.target.value.replace(/\D/g, "").slice(-1);
            set(i, ch);
            if (ch) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !d) refs.current[i - 1]?.focus();
            if (e.key === "ArrowLeft") refs.current[i - 1]?.focus();
            if (e.key === "ArrowRight") refs.current[i + 1]?.focus();
          }}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
            if (!pasted) return;
            e.preventDefault();
            onChange(pasted);
            refs.current[Math.min(pasted.length, length - 1)]?.focus();
          }}
          onFocus={(e) => e.target.select()}
          className={cn(
            "size-[54px] rounded-xl border bg-canvas text-center text-xl font-bold focus-visible:border-foreground focus-visible:outline-none",
            invalid ? "border-status-cancelled" : "border-border",
          )}
        />
      ))}
    </div>
  );
}
