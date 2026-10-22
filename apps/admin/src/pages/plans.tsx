import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Chips,
  PageHeader,
  Pill,
  QueryError,
  SearchBox,
} from "@/components/ui";
import { formatMoney } from "@/lib/format";
import { useAllPlans, useDirectory } from "@/lib/queries";
import { PLAN_STATUS } from "@/lib/status";
import type { PlanStatus } from "@/lib/types";

type Filter =
  | "all"
  | "Active"
  | "Payment_Due"
  | "Paused"
  | "review"
  | "Completed"
  | "Cancelled";
const REVIEW = new Set<PlanStatus>(["Service_Request", "Under_Review"]);
const PAGE = 20;

export default function Plans() {
  const plansQ = useAllPlans();
  const dir = useDirectory();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [shown, setShown] = useState(PAGE);

  const plans = plansQ.data ?? [];
  const q = search.trim().toLowerCase();
  const rows = plans.filter(
    (p) =>
      (filter === "all" ||
        (filter === "review" ? REVIEW.has(p.status) : p.status === filter)) &&
      (!q ||
        p.coveredPerson.fullName.toLowerCase().includes(q) ||
        dir.nameOf(p.owner).toLowerCase().includes(q)),
  );
  const error = plansQ.error ?? dir.error;

  return (
    <main className="flex flex-col gap-6 p-10">
      <PageHeader
        title="Plans"
        aside={
          <SearchBox
            value={search}
            onChange={(v) => {
              setSearch(v);
              setShown(PAGE);
            }}
            placeholder="Search by owner or covered person…"
          />
        }
      />
      <Chips
        value={filter}
        onChange={(f) => {
          setFilter(f);
          setShown(PAGE);
        }}
        options={[
          { id: "all", label: `All (${plans.length.toLocaleString()})` },
          { id: "Active", label: "Active" },
          { id: "Payment_Due", label: "Payment due" },
          { id: "Paused", label: "Paused" },
          { id: "review", label: "Under review" },
          { id: "Completed", label: "Completed" },
          { id: "Cancelled", label: "Cancelled" },
        ]}
      />
      {error && (
        <QueryError
          error={error}
          retry={() => {
            void plansQ.refetch();
            void dir.refetch();
          }}
        />
      )}
      <div className="overflow-x-auto rounded-3xl bg-white p-6">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="text-xs font-semibold uppercase tracking-wider text-muted">
              {[
                "Covered person",
                "Owner",
                "Package",
                "Balance",
                "Status",
                "",
              ].map((h) => (
                <th key={h} className="px-3 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, shown).map((p) => {
              const [label, tone] = PLAN_STATUS[p.status];
              return (
                <tr key={p._id} className="border-t border-border">
                  <td className="px-3 py-4 font-bold">
                    {p.coveredPerson.fullName}
                  </td>
                  <td className="px-3 py-4 text-ink-soft">
                    <Link
                      to="/users/$id"
                      params={{ id: p.owner }}
                      className="hover:underline"
                    >
                      {dir.nameOf(p.owner)}
                    </Link>
                  </td>
                  <td className="px-3 py-4 text-ink-soft">
                    {p.packageSnapshot.name}
                  </td>
                  <td className="px-3 py-4">
                    {formatMoney(p.totalContributedMinor, p.currency)}
                  </td>
                  <td className="px-3 py-4">
                    <Pill label={label} tone={tone} />
                  </td>
                  <td className="px-3 py-4">
                    <Link
                      to="/plans/$id"
                      params={{ id: p._id }}
                      className="font-semibold text-link underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {plansQ.isPending && (
          <p className="py-6 text-center text-sm text-muted">Loading plans…</p>
        )}
        {plansQ.isSuccess && rows.length === 0 && (
          <p className="py-6 text-center text-sm text-muted">No plans match.</p>
        )}
        {rows.length > shown && (
          <div className="border-t border-border pt-4 text-center">
            <button
              onClick={() => setShown((n) => n + PAGE)}
              className="text-sm font-semibold text-link"
            >
              Load more plans
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
