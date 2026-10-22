import { createFileRoute, redirect } from "@tanstack/react-router";
import Welcome from "../pages/Welcome";

interface WelcomeSearch {
  plan?: string;
}

export const Route = createFileRoute("/welcome")({
  validateSearch: (search: Record<string, unknown>): WelcomeSearch => ({
    plan: search.plan != null ? String(search.plan) : undefined,
  }),
  beforeLoad: ({ context, location }) => {
    if (!context.auth.user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: Welcome,
});
