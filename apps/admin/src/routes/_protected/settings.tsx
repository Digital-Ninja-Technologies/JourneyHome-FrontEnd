import { createFileRoute } from "@tanstack/react-router";
import { SettingsSkeleton } from "@/components/skeletons";
import { SettingsView } from "@/modules/settings/components/settings-view";

export const Route = createFileRoute("/_protected/settings")({
  component: SettingsView,
  pendingComponent: SettingsSkeleton,
});
