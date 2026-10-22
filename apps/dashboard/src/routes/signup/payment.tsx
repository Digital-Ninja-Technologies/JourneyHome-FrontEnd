import { createFileRoute, redirect } from "@tanstack/react-router";
import OnboardingPayment from "../../pages/OnboardingPayment";

interface OnboardingPaymentSearch {
  plan?: string;
}

export const Route = createFileRoute("/signup/payment")({
  validateSearch: (search: Record<string, unknown>): OnboardingPaymentSearch => ({
    plan: typeof search.plan === "string" ? search.plan : undefined,
  }),
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
