/** biome-ignore-all lint/suspicious/noArrayIndexKey: false positive */
import { Check, Eye, EyeOff, X } from "lucide-react";
import React, { useState } from "react";
import { cn } from "../lib/utils";
import { Button } from "./button";
import { Input } from "./input";

export interface PasswordCriterion {
  label: string;
  regex: RegExp;
}

const DEFAULT_CRITERIA: PasswordCriterion[] = [
  { label: "At least 8 characters", regex: /^.{8,}$/ },
  { label: "At least one uppercase letter", regex: /[A-Z]/ },
  //   { label: "At least one number", regex: /[0-9]/ },
  //   { label: "At least one special character", regex: /[^A-Za-z0-9]/ },
];

export interface PasswordInputProps extends React.ComponentProps<typeof Input> {
  criteria?: PasswordCriterion[];
  showCriteria?: boolean;
}

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(
  (
    {
      className,
      criteria = DEFAULT_CRITERIA,
      showCriteria = false,
      value,
      onChange,
      ...props
    },
    ref,
  ) => {
    const [show, setShow] = useState(false);
    const currentVal = String(value ?? "");

    return (
      <div className="space-y-2">
        <div className="relative">
          <Input
            type={show ? "text" : "password"}
            className={cn("pr-11", className)}
            ref={ref}
            value={value}
            onChange={onChange}
            {...props}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            tabIndex={-1}
            className="absolute right-1 top-1/2 size-9 -translate-y-1/2 rounded-lg text-muted-foreground hover:bg-transparent hover:text-foreground"
            onClick={() => setShow((prev) => !prev)}
          >
            {show ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="sr-only">Toggle password visibility</span>
          </Button>
        </div>

        {showCriteria && criteria.length > 0 && (
          <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 text-xs pt-1">
            {criteria.map((item, index) => {
              const isMet = item.regex.test(currentVal);
              const isEmpty = currentVal.length === 0;

              return (
                <li
                  key={`${index + 1}-${item.label}`}
                  className={cn(
                    "flex items-center gap-1.5 transition-colors duration-150",
                    isEmpty
                      ? "text-muted-foreground"
                      : isMet
                        ? "text-emerald-600 dark:text-emerald-400 font-medium"
                        : "text-destructive font-medium",
                  )}
                >
                  {isEmpty ? (
                    <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/40 shrink-0" />
                  ) : isMet ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-destructive shrink-0" />
                  )}
                  <span>{item.label}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";
