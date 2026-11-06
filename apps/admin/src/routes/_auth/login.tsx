import { createFileRoute, redirect } from "@tanstack/react-router";
import { AsyncBoundary } from "@/components/async-boundary";
import { loginSearchSchema, redirectTarget } from "@/lib/search-schemas";
import { LoginForm } from "@/modules/auth/components/login-form";
import { sessionQueryOptions } from "@/modules/auth/query-options";

export const Route = createFileRoute("/_auth/login")({
  validateSearch: loginSearchSchema,
  beforeLoad: async ({ context, search }) => {
    const session = await context.queryClient.query(sessionQueryOptions());
    if (session?.user) {
      throw redirect({ href: redirectTarget(search.redirect) });
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
