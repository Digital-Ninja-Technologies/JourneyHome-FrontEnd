import { createFileRoute, redirect } from "@tanstack/react-router";
import OnboardingPlan from "@/pages/onboarding-plan";

export const Route = createFileRoute("/signup/plan")({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: OnboardingPlan,
});
