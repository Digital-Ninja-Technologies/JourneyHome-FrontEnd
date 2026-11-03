import { useRouterState } from "@tanstack/react-router";
import nprogress from "nprogress";
import { useEffect } from "react";

nprogress.configure({ showSpinner: false, minimum: 0.25 });

/**
 * Top-of-page progress bar driven by TanStack Router's loading state.
 * Mount once in the root route. Styles live in `styles/globals.css`.
 */
export function RouteProgress() {
  const isLoading = useRouterState({ select: (s) => s.isLoading });

  useEffect(() => {
    if (isLoading) {
      nprogress.start();
    } else {
      nprogress.done();
    }
  }, [isLoading]);

  return null;
}
