import { Button } from "@journeyhome/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@journeyhome/ui/components/dialog";
import { LoaderCircleIcon } from "lucide-react";

/** Yes/no confirmation; replaces `window.confirm`. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  isPending = false,
  destructive = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  isPending?: boolean;
  destructive?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !isPending && onOpenChange(o)}>
      <DialogContent className="max-w-[calc(100%-1.5rem)] rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-normal">
            {title}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter className="flex-row justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "accent"}
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending && <LoaderCircleIcon className="animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
