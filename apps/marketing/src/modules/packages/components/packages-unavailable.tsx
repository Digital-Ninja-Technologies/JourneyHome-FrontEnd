import { Button } from "@journeyhome/ui/components/button";
import { Link } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";

export function PackagesUnavailable({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-white p-8 text-muted text-center">
      <p>
        Package pricing is temporarily unavailable. Please check back shortly or{" "}
        <Link to="/contact" className="font-bold text-link underline">
          contact us
        </Link>
        .
      </p>
      {onRetry && (
        <Button
          type="button"
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="gap-2 rounded-full"
        >
          <RefreshCw className="size-3.5" />
          Try again
        </Button>
      )}
    </div>
  );
}
