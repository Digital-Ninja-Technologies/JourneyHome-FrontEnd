import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppShell } from "../../components/AppShell";

export const Route = createFileRoute("/app")({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: AppShell,
});
