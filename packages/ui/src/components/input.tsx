import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "../lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <InputPrimitive
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-xl border border-border bg-background px-3.5 text-sm text-foreground placeholder:text-foreground/40 transition-colors outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-600",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
