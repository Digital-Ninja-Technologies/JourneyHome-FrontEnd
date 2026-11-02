import { createFileRoute, redirect } from "@tanstack/react-router";
import { sessionQueryOptions } from "@/modules/auth";
import OnboardingPlan from "@/pages/onboarding-plan";

export const Route = createFileRoute("/signup/plan")({
  beforeLoad: async ({ context, location }) => {
    const session = await context.queryClient.query(
      sessionQueryOptions(),
    );
    if (!session?.user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
    return { session, user: session.user };
  },
  component: OnboardingPlan,
});
