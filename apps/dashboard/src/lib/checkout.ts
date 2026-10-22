import { useMutation } from "@tanstack/react-query";
import { api } from "./api";

/** Set while a new customer is onboarding, so the Paystack return page can send them to the welcome screen. */
export const ONBOARDING_KEY = "jh_onboarding_plan";

export function setOnboardingPlan(planId: string | null) {
  try {
    if (planId) sessionStorage.setItem(ONBOARDING_KEY, planId);
    else sessionStorage.removeItem(ONBOARDING_KEY);
  } catch {
    /* storage unavailable; the return page falls back to the normal success view */
  }
}

export function getOnboardingPlan(): string | null {
  try {
    return sessionStorage.getItem(ONBOARDING_KEY);
  } catch {
    return null;
  }
}

/** Starts the first-contribution checkout for a Pending plan and sends the browser to Paystack. */
export function useStartCheckout(
  planId: string,
  opts: { onboarding?: boolean } = {},
) {
  return useMutation({
    mutationFn: () =>
      api<{ authorizationUrl: string }>(
        `/payments/plans/${planId}/initialize-initial`,
        { method: "POST" },
      ),
    onSuccess: (data) => {
      if (opts.onboarding) setOnboardingPlan(planId);
      window.location.assign(data.authorizationUrl);
    },
  });
}
