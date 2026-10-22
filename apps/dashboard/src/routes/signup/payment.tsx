import { createFileRoute, redirect } from "@tanstack/react-router";
import { planSearchSchema } from "@/lib/search-schemas";
import OnboardingPayment from "@/pages/onboarding-payment";

export const Route = createFileRoute("/signup/payment")({
  validateSearch: (search) => planSearchSchema.parse(search),
  beforeLoad: ({ context, location }) => {
    if (!context.auth.user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: OnboardingPayment,
});
