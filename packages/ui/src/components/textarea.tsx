import * as React from "react";
import { cn } from "../lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        "flex min-h-[120px] w-full resize-none rounded-xl border border-border bg-background p-3.5 text-sm text-foreground transition-colors outline-none placeholder:text-foreground/40 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-600",
        className,
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";
