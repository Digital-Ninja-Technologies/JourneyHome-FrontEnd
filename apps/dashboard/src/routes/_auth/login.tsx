import { createFileRoute, redirect } from "@tanstack/react-router";
import { AsyncBoundary } from "@/components/async-boundary";
import { redirectSearchSchema, sanitizeRedirect } from "@/lib/search-schemas";
import { LoginForm } from "@/modules/auth/components/login-form";
import { sessionQueryOptions } from "@/modules/auth/query-options";

export const Route = createFileRoute("/_auth/login")({
  validateSearch: redirectSearchSchema,
  beforeLoad: async ({ context, search }) => {
    const session = await context.queryClient.query(sessionQueryOptions());
    if (session?.user) {
      const target = sanitizeRedirect(search.redirect, "/app");
      const safeTarget = target.startsWith("/login") ? "/app" : target;
      throw redirect({
        to: safeTarget as any,
      });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  return (
    <AsyncBoundary>
      <LoginForm />
    </AsyncBoundary>
  );
}
