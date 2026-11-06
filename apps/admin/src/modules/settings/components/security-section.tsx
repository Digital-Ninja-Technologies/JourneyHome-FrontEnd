import { Button } from "@journeyhome/ui/components/button";
import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DemoNotice } from "@/components/demo-notice";
import { SectionCard } from "@/components/section-card";
import { useRevokeSessionsMutation } from "../mutations";

export function SecuritySection() {
  const revoke = useRevokeSessionsMutation();
  const [confirming, setConfirming] = useState(false);

  return (
    <SectionCard
      title="Security"
      description="Sign out of every other browser or device where this admin account is signed in."
    >
      <div className="flex flex-col items-start gap-3">
        <DemoNotice>no real sessions are affected.</DemoNotice>
        <Button
          variant="outline"
          className="border-status-cancelled text-status-cancelled"
          onClick={() => setConfirming(true)}
        >
          Revoke all other sessions
        </Button>
      </div>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Sign out other sessions?"
        description="Every other browser signed in as you will need to sign in again. This one stays signed in."
        confirmLabel="Sign them out"
        destructive
        isPending={revoke.isPending}
        onConfirm={() =>
          revoke.mutate(undefined, { onSettled: () => setConfirming(false) })
        }
      />
    </SectionCard>
  );
}
