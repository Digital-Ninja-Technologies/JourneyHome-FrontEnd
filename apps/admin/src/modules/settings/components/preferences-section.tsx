import { Skeleton } from "@journeyhome/ui/components/skeleton";
import { Switch } from "@journeyhome/ui/components/switch";
import { DemoNotice } from "@/components/demo-notice";
import { SectionCard } from "@/components/section-card";
import { useMe } from "@/modules/auth/query-options";
import { useUpdatePreferencesMutation } from "../mutations";
import { explainError, PREFERENCES } from "../settings.utils";

export function PreferencesSection() {
  const meQ = useMe();
  const toggle = useUpdatePreferencesMutation();
  const prefs = meQ.data?.preferences;

  return (
    <SectionCard
      title="Notification preferences"
      description="Which operational emails you receive."
    >
      <div className="flex flex-col gap-3">
        <DemoNotice>changes are saved in this browser only.</DemoNotice>
        {meQ.isPending ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ) : meQ.isError || !prefs ? (
          <p className="text-sm text-muted-foreground">
            {meQ.isError
              ? explainError(meQ.error)
              : "Preferences will appear here once the server provides them."}
          </p>
        ) : (
          <ul className="flex flex-col">
            {PREFERENCES.map((p) => (
              <li
                key={p.key}
                className="flex items-center justify-between gap-4 border-t border-border py-4 first:border-0 first:pt-0"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold">{p.label}</div>
                  <div className="text-xs text-muted-foreground">{p.hint}</div>
                </div>
                <Switch
                  checked={prefs[p.key]}
                  label={p.label}
                  onCheckedChange={(v) => toggle.mutate({ [p.key]: v })}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </SectionCard>
  );
}
