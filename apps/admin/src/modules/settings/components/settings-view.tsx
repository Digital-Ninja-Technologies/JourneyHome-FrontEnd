import { PageHeader } from "@/components/page-header";
import { AdminTeamSection } from "@/modules/admin-team/components/admin-team-section";
import { PackagesSection } from "@/modules/packages/components/packages-section";
import { PreferencesSection } from "./preferences-section";
import { SecuritySection } from "./security-section";

export function SettingsView() {
  return (
    <main className="flex max-w-[1000px] flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Pricing, notifications, security, and your team."
      />
      <PackagesSection />
      <PreferencesSection />
      <SecuritySection />
      <AdminTeamSection />
    </main>
  );
}
