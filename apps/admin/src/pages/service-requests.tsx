import { cn } from "@journeyhome/ui/lib/utils";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Chips, PageHeader, Pill, QueryError } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { useAllPlans, useAllRequests, useDirectory } from "@/lib/queries";
import { REQUEST_STATUS } from "@/lib/status";
import type { RequestStatus } from "@/lib/types";

type Filter = "all" | "new" | "review" | "info" | "approved" | "closed";
const GROUPS: Record<Exclude<Filter, "all">, RequestStatus[]> = {
  new: ["Submitted"],
  review: ["Under_Review", "Docs_Verified"],
  info: ["More_Info_Required"],
  approved: ["Approved"],
  closed: ["Rejected", "Cancelled"],
};
const BORDER = {
  review: "border-l-status-review",
  due: "border-l-status-due",
  approved: "border-l-status-approved",
  active: "border-l-status-active",
  paused: "border-l-border",
  cancelled: "border-l-status-cancelled",
};

export default function ServiceRequests() {
  const reqQ = useAllRequests();
  const plansQ = useAllPlans();
  const dir = useDirectory();
  const [filter, setFilter] = useState<Filter>("all");

  const requests = reqQ.data ?? [];
  const plans = new Map((plansQ.data ?? []).map((p) => [p._id, p]));
  const n = (f: Exclude<Filter, "all">) =>
    requests.filter((r) => GROUPS[f].includes(r.status)).length;
  const rows = requests.filter(
    (r) => filter === "all" || GROUPS[filter].includes(r.status),
  );
  const error = reqQ.error ?? plansQ.error ?? dir.error;

  return (
    <main className="flex flex-col gap-6 p-10">
      <PageHeader title="Service requests" />
      <Chips
        value={filter}
        onChange={setFilter}
        options={[
          { id: "all", label: `All (${requests.length})` },
          { id: "new", label: `New (${n("new")})` },
          { id: "review", label: `In review (${n("review")})` },
          { id: "info", label: `Awaiting customer (${n("info")})` },
          { id: "approved", label: `Approved (${n("approved")})` },
          { id: "closed", label: `Closed (${n("closed")})` },
        ]}
      />
      {error && (
        <QueryError
          error={error}
          retry={() => {
            void reqQ.refetch();
            void plansQ.refetch();
            void dir.refetch();
          }}
        />
      )}
      {reqQ.isPending && <p className="text-muted">Loading requests…</p>}
      {reqQ.isSuccess && rows.length === 0 && (
        <p className="rounded-3xl bg-white p-8 text-sm text-muted">
          No service requests here.
        </p>
      )}
      <div className="flex flex-col gap-3">
        {rows.map((r) => {
          const [label, tone] = REQUEST_STATUS[r.status];
          const pkg = plans.get(r.plan)?.packageSnapshot.name;
          return (
            <Link
              key={r._id}
              to={`/service-requests/${r._id}`}
              className={cn(
                "flex items-center justify-between gap-4 rounded-2xl border-l-4 bg-white px-6 py-5",
                BORDER[tone],
              )}
            >
              <div>
                <div className="font-bold">
                  {r.coveredPersonSnapshot.fullName}&rsquo;s service
                </div>
                <div className="text-[13px] text-muted">
                  Requested by {dir.nameOf(r.owner)} · {formatDate(r.createdAt)}{" "}
                  · {r.burialLocation}
                  {pkg ? ` · ${pkg} package` : ""}
                </div>
              </div>
              <Pill label={label} tone={tone} />
            </Link>
          );
        })}
      </div>
    </main>
  );
}
