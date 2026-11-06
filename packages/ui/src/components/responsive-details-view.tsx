import type * as React from "react";
import { useIsMobile } from "../hooks/use-mobile";
import { cn } from "../lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./sheet";

export interface ResponsiveDetailsViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  side?: "right" | "left" | "bottom";
}

export function ResponsiveDetailsView({
  open,
  onOpenChange,
  title,
  description,
  headerExtra,
  children,
  footer,
  className,
  contentClassName,
  side = "right",
}: ResponsiveDetailsViewProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className={cn(
            "max-h-[90vh] rounded-t-[28px] border-t p-0 flex flex-col gap-0 bg-card text-card-foreground shadow-2xl focus:outline-hidden",
            className,
          )}
        >
          {/* Mobile Drag Handle */}
          <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-muted-foreground/20 shrink-0" />

          {(title || description || headerExtra) && (
            <SheetHeader className="shrink-0 border-b border-border/40 px-6 py-4">
              {headerExtra && <div className="mb-2">{headerExtra}</div>}
              {title && (
                <SheetTitle className="text-left font-serif text-lg font-normal">
                  {title}
                </SheetTitle>
              )}
              {description && (
                <SheetDescription className="text-left text-xs text-muted-foreground">
                  {description}
                </SheetDescription>
              )}
            </SheetHeader>
          )}

          <div
            className={cn(
              "flex-1 overflow-y-auto px-6 py-4 space-y-4",
              contentClassName,
            )}
          >
            {children}
          </div>

          {footer && (
            <div className="shrink-0 border-t border-border/40 p-4 bg-muted/10">
              {footer}
            </div>
          )}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={cn(
          "sm:max-w-md md:max-w-lg lg:max-w-xl w-full p-0 flex flex-col gap-0 border-l bg-card",
          className,
        )}
      >
        {(title || description || headerExtra) && (
          <SheetHeader className="shrink-0 border-b border-border/40 p-6 pb-4 bg-muted/5">
            {headerExtra && <div className="mb-2">{headerExtra}</div>}
            {title && (
              <SheetTitle className="text-left font-serif text-xl font-normal">
                {title}
              </SheetTitle>
            )}
            {description && (
              <SheetDescription className="text-left text-xs text-muted-foreground">
                {description}
              </SheetDescription>
            )}
          </SheetHeader>
        )}

        <div
          className={cn(
            "flex-1 overflow-y-auto p-6 space-y-4",
            contentClassName,
          )}
        >
          {children}
        </div>

        {footer && (
          <div className="shrink-0 border-t border-border/40 p-6 pt-4 bg-muted/10">
            {footer}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
