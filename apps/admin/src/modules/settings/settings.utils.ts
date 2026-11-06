import { isUnsupported, UNSUPPORTED_MESSAGE } from "@/lib/api";
import type { AdminPreferences } from "./api";

export const PREFERENCES: {
  key: keyof AdminPreferences;
  label: string;
  hint: string;
}[] = [
  {
    key: "newServiceRequest",
    label: "New service request submitted",
    hint: "Email me when a customer asks for a service.",
  },
  {
    key: "paymentFailed",
    label: "Payment failed or retried",
    hint: "Email me when a contribution doesn't go through.",
  },
  {
    key: "weeklyDigest",
    label: "Weekly summary digest",
    hint: "A Monday recap of the week.",
  },
];

/** Error copy for endpoints the backend may not have yet. */
export const explainError = (e: unknown) =>
  isUnsupported(e)
    ? `${UNSUPPORTED_MESSAGE} This setting can't be saved yet.`
    : e instanceof Error
      ? e.message
      : "Something went wrong.";
