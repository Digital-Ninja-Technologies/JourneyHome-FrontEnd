import { AlertCircle, RefreshCw } from "lucide-react";
import React, { Component, Suspense, type ReactNode } from "react";
import { Button } from "@journeyhome/ui/components/button";

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
        Your admin session has expired. Please sign in again to continue.
      </p>
      <a
        href="/login"
        className="mt-4 inline-flex items-center justify-center rounded-lg bg-link px-4 py-2 text-sm font-semibold text-canvas transition-colors hover:bg-link/90"
      >
        Sign in
      </a>
    </div>
  );
}

export function DefaultLoadingFallback() {
  return (
    <div
      className="flex min-h-[140px] items-center justify-center p-8"
      aria-label="Loading..."
    >
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-link border-t-transparent" />
    </div>
  );
}

export interface AsyncBoundaryProps {
  children: ReactNode;
  loadingFallback?: ReactNode;
  errorFallback?: ReactNode | ((props: FallbackProps) => ReactNode);
  onReset?: () => void;
}

export function AsyncBoundary({
  children,
  loadingFallback = <DefaultLoadingFallback />,
  errorFallback,
  onReset,
}: AsyncBoundaryProps) {
  return (
    <ErrorBoundary
      onReset={onReset}
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
