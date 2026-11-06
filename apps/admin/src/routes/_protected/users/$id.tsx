import { createFileRoute } from "@tanstack/react-router";
import { DetailViewSkeleton } from "@/components/skeletons";
import { UserDetailView } from "@/modules/users/components/user-detail-view";

export const Route = createFileRoute("/_protected/users/$id")({
  component: UserDetailView,
  pendingComponent: DetailViewSkeleton,
});
