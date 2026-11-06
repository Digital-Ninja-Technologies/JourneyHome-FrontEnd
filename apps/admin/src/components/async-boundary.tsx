import { Button, buttonVariants } from "@journeyhome/ui/components/button";
import { Skeleton } from "@journeyhome/ui/components/skeleton";
import { cn } from "@journeyhome/ui/lib/utils";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Component, type ReactNode, Suspense } from "react";

export * from "./skeletons";

export interface FallbackProps {
  error: unknown;
  resetErrorBoundary: () => void;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackRender?: (props: FallbackProps) => ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: unknown;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  override state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, error };
  }

  resetErrorBoundary = () => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null });
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallbackRender) {
        return this.props.fallbackRender({
          error: this.state.error,
          resetErrorBoundary: this.resetErrorBoundary,
        });
      }
      return null;
    }
    return this.props.children;
  }
}

export interface ComponentErrorStateProps {
  title?: string;
  description?: string;
  error?: unknown;
  onRetry?: () => void;
}

export function ComponentErrorState({
  title = "Unable to load content",
  description,
  error,
  onRetry,
}: ComponentErrorStateProps) {
  const message =
    description ||
    (error instanceof Error ? error.message : "An unexpected error occurred.");

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card p-8 text-center shadow-sm"
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-status-cancelled-bg text-status-cancelled">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="font-sans text-base font-bold text-foreground">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button
          type="button"
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="mt-4 gap-2"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </Button>
      )}
    </div>
  );
}

export function UnauthorizedErrorState() {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card p-8 text-center shadow-sm"
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-status-cancelled-bg text-status-cancelled">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="font-sans text-base font-bold text-foreground">
        Session Expired
      </h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        Your session has ended. Please sign in again to continue.
      </p>
      <a
        href="/login"
        className={cn(buttonVariants({ variant: "default" }), "mt-4")}
      >
        Sign in
      </a>
    </div>
  );
}

export function DefaultLoadingFallback() {
  return (
    <div
      role="status"
      aria-label="Loading..."
      className="flex w-full flex-col gap-4 rounded-3xl border border-border bg-white p-6 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-1/3 rounded-lg" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="flex flex-col gap-2.5 pt-2">
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-5/6 rounded-md" />
        <Skeleton className="h-4 w-2/3 rounded-md" />
      </div>
    </div>
  );
}

export interface AsyncBoundaryProps {
  children: ReactNode;
  loadingFallback?: ReactNode;
  errorFallback?: ReactNode | ((props: FallbackProps) => ReactNode);
  onReset?: () => void;
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
}

export function AsyncBoundary({
  children,
  loadingFallback = <DefaultLoadingFallback />,
  errorFallback,
  onReset,
  isLoading,
  isError,
  error,
}: AsyncBoundaryProps) {
  const { reset } = useQueryErrorResetBoundary();

  const handleReset = () => {
    reset();
    onReset?.();
  };

  if (isLoading) {
    return <>{loadingFallback}</>;
  }

  if (isError) {
    if (typeof errorFallback === "function") {
      return <>{errorFallback({ error, resetErrorBoundary: handleReset })}</>;
    }
    if (errorFallback) {
      return <>{errorFallback}</>;
    }
    return <ComponentErrorState error={error} onRetry={handleReset} />;
  }

  return (
    <ErrorBoundary
      onReset={handleReset}
      fallbackRender={(props) => {
        if (typeof errorFallback === "function") {
          return errorFallback(props);
        }
        if (errorFallback) {
          return errorFallback;
        }
        return (
          <ComponentErrorState
            error={props.error}
            onRetry={props.resetErrorBoundary}
          />
        );
      }}
    >
      <Suspense fallback={loadingFallback}>{children}</Suspense>
    </ErrorBoundary>
  );
}
