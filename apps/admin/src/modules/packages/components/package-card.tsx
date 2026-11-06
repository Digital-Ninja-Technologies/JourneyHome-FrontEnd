import type { AdminPackage } from "@journeyhome/schemas";
import { Button } from "@journeyhome/ui/components/button";
import { Switch } from "@journeyhome/ui/components/switch";
import { Pencil, RefreshCw } from "lucide-react";
import { Pill } from "@/components/status-pill";
import { formatMoney } from "@/lib/format";
import { useSyncPackageMutation, useUpdatePackageMutation } from "../mutations";

export function PackageCard({
  pkg,
  onEdit,
}: {
  pkg: AdminPackage;
  onEdit: () => void;
}) {
  const update = useUpdatePackageMutation();
  const sync = useSyncPackageMutation();

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-lg font-bold">{pkg.name}</div>
          <div className="text-sm text-muted-foreground">
            {formatMoney(pkg.amount, pkg.currency)} / month
          </div>
        </div>
        <Pill
          label={pkg.isActive ? "Active" : "Inactive"}
          tone={pkg.isActive ? "active" : "paused"}
        />
      </div>

      {pkg.description && (
        <p className="line-clamp-2 text-[13px] text-ink-soft">
          {pkg.description}
        </p>
      )}
      {pkg.features.length > 0 && (
        <ul className="list-inside list-disc text-xs text-muted-foreground">
          {pkg.features.slice(0, 3).map((f) => (
            <li key={f} className="truncate">
              {f}
            </li>
          ))}
          {pkg.features.length > 3 && <li>+{pkg.features.length - 3} more</li>}
        </ul>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Switch
            checked={pkg.isActive}
            disabled={update.isPending}
            label={`Offer ${pkg.name} to new plans`}
            onCheckedChange={(isActive) =>
              update.mutate({ id: pkg._id, isActive })
            }
          />
          {pkg.isActive ? "Offered" : "Hidden"}
        </span>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={sync.isPending}
            onClick={() => sync.mutate(pkg._id)}
            title="Create a Paystack plan with the current price"
          >
            <RefreshCw
              className={sync.isPending ? "animate-spin" : undefined}
            />
            Sync Paystack
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onEdit}>
            <Pencil />
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
}
