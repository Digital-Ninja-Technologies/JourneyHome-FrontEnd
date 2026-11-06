import { Button } from "@journeyhome/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@journeyhome/ui/components/dialog";
import { useIsMobile } from "@journeyhome/ui/hooks/use-mobile";
import { cn } from "@journeyhome/ui/lib/utils";
import { LoaderCircleIcon } from "lucide-react";

/**
 * Dialog shell for a react-hook-form form. Put the `<form id={formId}>` in
 * `children`; the footer's submit button targets it by id, so the actions
 * stay pinned while the body scrolls.
 */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  formId,
  submitLabel,
  pendingLabel = "Saving…",
  isPending = false,
  submitVariant = "accent",
  className,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  formId: string;
  submitLabel: string;
  pendingLabel?: string;
  isPending?: boolean;
  submitVariant?: "accent" | "default" | "destructive";
  className?: string;
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();

  return (
    <Dialog open={open} onOpenChange={(o) => !isPending && onOpenChange(o)}>
      <DialogContent
        initialFocus={!isMobile}
        className={cn(
          "flex max-h-[calc(100dvh-1.5rem)] max-w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-lg",
          className,
        )}
      >
        <DialogHeader className="shrink-0 gap-1 border-b border-border/60 px-6 py-5 pr-14">
          <DialogTitle className="font-serif text-2xl font-normal leading-tight">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-sm">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5">
          {children}
        </div>

        <DialogFooter className="shrink-0 flex-row items-center justify-end gap-3 border-t border-border/60 bg-popover px-6 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            variant={submitVariant}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <LoaderCircleIcon className="animate-spin" />
                {pendingLabel}
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
