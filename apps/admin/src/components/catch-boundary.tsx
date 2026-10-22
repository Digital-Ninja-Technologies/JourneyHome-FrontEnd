import type { ErrorComponentProps } from "@tanstack/react-router";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@journeyhome/ui/components/button";

export function CatchBoundary({ error, reset }: ErrorComponentProps) {
  const message =
    error instanceof Error ? error.message : "An unexpected error occurred.";

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-status-cancelled-bg text-status-cancelled">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h1 className="mt-4 font-sans text-2xl font-bold tracking-tight text-foreground">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{message}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {reset && (
          <Button
            type="button"
            onClick={() => reset()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        )}
        <a
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          Return to console
        </a>
      </div>
    </main>
  );
}
