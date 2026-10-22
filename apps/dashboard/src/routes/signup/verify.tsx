import { createFileRoute, redirect } from "@tanstack/react-router";
import VerifyCode from "../../pages/VerifyCode";

export const Route = createFileRoute("/signup/verify")({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: VerifyCode,
});
