import { createFileRoute } from "@tanstack/react-router";
import UserDetail from "@/pages/user-detail";

export const Route = createFileRoute("/_authenticated/users/$id")({
  component: UserDetail,
});
