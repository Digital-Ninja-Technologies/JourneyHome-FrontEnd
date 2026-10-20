import * as React from "react";
import { cn } from "../lib/utils";

export const Label = ({ className, ...props }: React.ComponentProps<"label">) => (
  <label
    className={cn("text-xs font-bold uppercase tracking-wider text-status-paused", className)}
    {...props}
  />
);
