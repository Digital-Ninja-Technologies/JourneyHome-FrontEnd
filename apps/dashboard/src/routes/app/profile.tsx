import { createFileRoute } from "@tanstack/react-router";
import { ProfileSkeleton } from "@/components/skeletons";
import { profileSearchSchema } from "@/lib/search-schemas";
import { ProfileView } from "@/modules/profile/components/profile-view";

export const Route = createFileRoute("/app/profile")({
  validateSearch: profileSearchSchema,
  component: ProfileView,
  pendingComponent: ProfileSkeleton,
});
