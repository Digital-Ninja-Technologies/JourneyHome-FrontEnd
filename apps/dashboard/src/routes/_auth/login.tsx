import { createFileRoute, redirect } from "@tanstack/react-router";
import { AsyncBoundary } from "@/components/async-boundary";
import { redirectSearchSchema } from "@/lib/search-schemas";
import { LoginForm } from "@/modules/auth/components/login-form";
import { sessionQueryOptions } from "@/modules/auth";

export const Route = createFileRoute("/_auth/login")({
  validateSearch: (search) => redirectSearchSchema.parse(search),
  beforeLoad: async ({ context, search }) => {
    const session = await context.queryClient.ensureQueryData(
      sessionQueryOptions(),
    );
    if (session?.user) {
      throw redirect({
        to: (search.redirect as any) || "/app",
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
