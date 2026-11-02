import { createFileRoute, redirect } from "@tanstack/react-router";
import { AsyncBoundary } from "@/components/async-boundary";
import { SignupForm } from "@/modules/auth/components/signup-form";
import { sessionQueryOptions } from "@/modules/auth";

export const Route = createFileRoute("/signup/")({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.query(
      sessionQueryOptions(),
    );
    if (session?.user) {
      throw redirect({ to: "/app" });
    }
  },
  component: SignupPage,
});

function SignupPage() {
  return (
    <AsyncBoundary>
      <SignupForm />
    </AsyncBoundary>
  );
}
