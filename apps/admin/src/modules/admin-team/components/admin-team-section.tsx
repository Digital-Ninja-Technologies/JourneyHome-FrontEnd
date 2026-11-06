import type { AdminUser } from "@journeyhome/schemas";
import { Button } from "@journeyhome/ui/components/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { AsyncBoundary } from "@/components/async-boundary";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { SectionCard } from "@/components/section-card";
import { Pill } from "@/components/status-pill";
import { initials } from "@/lib/format";
import { useAdminUser, useIsSuperAdmin } from "@/modules/auth/query-options";
import { useDeleteAdminMutation } from "../mutations";
import { useAdmins } from "../query-options";
import { AddAdminDialog } from "./add-admin-dialog";

export function AdminTeamSection() {
  const isSuperAdmin = useIsSuperAdmin();
  const me = useAdminUser();
  const adminsQ = useAdmins({ enabled: isSuperAdmin });
  const remove = useDeleteAdminMutation();
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<AdminUser | null>(null);

  if (!isSuperAdmin) {
    return (
      <SectionCard
        title="Admin team"
        description="Only super admins can view and manage the admin team."
      />
    );
  }

  return (
    <SectionCard
      title="Admin team"
      description="People who can sign in to this console."
      action={
        <Button size="sm" variant="accent" onClick={() => setAdding(true)}>
          <Plus />
          Add admin
        </Button>
      }
    >
      <AsyncBoundary
        isLoading={adminsQ.isPending}
        isError={adminsQ.isError}
        error={adminsQ.error}
        onReset={() => void adminsQ.refetch()}
      >
        <ul className="flex flex-col">
          {adminsQ.data?.map((a) => {
            const isSuper = a.isSuperAdmin || a.role === "super_admin";
            return (
              <li
                key={a.id}
                className="flex items-center justify-between gap-4 border-t border-border py-4 first:border-0 first:pt-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sand text-xs font-bold">
                    {initials(a.name)}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate font-bold">
                      {a.name}
                      {a.id === me?.id && (
                        <span className="font-normal text-muted-foreground">
                          {" "}
                          (you)
                        </span>
                      )}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {a.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Pill
                    label={isSuper ? "Super admin" : "Admin"}
                    tone={isSuper ? "approved" : "paused"}
                  />
                  {!isSuper && a.id !== me?.id && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-status-cancelled"
                      onClick={() => setRemoving(a)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </AsyncBoundary>

      <AddAdminDialog open={adding} onOpenChange={setAdding} />
      <ConfirmDialog
        open={Boolean(removing)}
        onOpenChange={(open) => !open && setRemoving(null)}
        title={`Remove ${removing?.name ?? "admin"}?`}
        description="They'll lose access to the admin console immediately."
        confirmLabel="Remove admin"
        destructive
        isPending={remove.isPending}
        onConfirm={() =>
          removing &&
          remove.mutate(removing.id, { onSuccess: () => setRemoving(null) })
        }
      />
    </SectionCard>
  );
}
