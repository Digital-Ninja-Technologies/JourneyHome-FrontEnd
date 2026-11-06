import type { AdminPackage } from "@journeyhome/schemas";
import { Button } from "@journeyhome/ui/components/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { AsyncBoundary } from "@/components/async-boundary";
import { SectionCard } from "@/components/section-card";
import { CardSkeleton } from "@/components/skeletons";
import { usePackages } from "../query-options";
import { PackageCard } from "./package-card";
import { PackageFormDialog } from "./package-form-dialog";

export function PackagesSection() {
  const packagesQ = usePackages();
  const [editing, setEditing] = useState<AdminPackage | null>(null);
  const [open, setOpen] = useState(false);

  const openFor = (pkg: AdminPackage | null) => {
    setEditing(pkg);
    setOpen(true);
  };

  return (
    <SectionCard
      title="Plan packages & pricing"
      description="Price changes apply to new plans only — existing plans keep the price they started with."
      action={
        <Button size="sm" variant="accent" onClick={() => openFor(null)}>
          <Plus />
          New package
        </Button>
      }
    >
      <AsyncBoundary
        isLoading={packagesQ.isPending}
        isError={packagesQ.isError}
        error={packagesQ.error}
        onReset={() => void packagesQ.refetch()}
        loadingFallback={
          <div className="grid gap-4 sm:grid-cols-2">
            <CardSkeleton className="border border-border shadow-none" />
            <CardSkeleton className="border border-border shadow-none" />
          </div>
        }
      >
        {packagesQ.data?.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No packages yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {packagesQ.data?.items.map((p) => (
              <PackageCard key={p._id} pkg={p} onEdit={() => openFor(p)} />
            ))}
          </div>
        )}
      </AsyncBoundary>

      <PackageFormDialog open={open} onOpenChange={setOpen} pkg={editing} />
    </SectionCard>
  );
}
