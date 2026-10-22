import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Chips,
  PageHeader,
  Pill,
  QueryError,
  SearchBox,
  type Tone,
} from "@/components/ui";
import { formatDate, formatMoney } from "@/lib/format";
import { useAllPlans, useAllRequests, useCustomers } from "@/lib/queries";
import { LIVE_PLAN, OPEN_REQUEST } from "@/lib/status";
import type { Customer } from "@/lib/types";

type Filter = "all" | "active" | "request" | "none";
const PAGE = 20;

export default function Users() {
  const customersQ = useCustomers();
  const plansQ = useAllPlans();
  const reqQ = useAllRequests();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [shown, setShown] = useState(PAGE);

  const rows = useMemo(() => {
    const plans = plansQ.data ?? [];
    const requests = reqQ.data ?? [];
    return (customersQ.data ?? []).map((c: Customer) => {
      const mine = plans.filter((p) => p.owner === c._id);
      const hasRequest = requests.some(
        (r) => r.owner === c._id && OPEN_REQUEST.has(r.status),
      );
      const hasLive = mine.some((p) => LIVE_PLAN.has(p.status));
      const status: [string, Tone, Filter] = hasRequest
        ? ["Request pending", "review", "request"]
        : hasLive
          ? ["Active", "active", "active"]
          : mine.length
            ? ["No active plan", "paused", "none"]
            : ["No plans", "paused", "none"];
      return {
        c,
        plans: mine.length,
        saved: mine.reduce((n, p) => n + p.totalContributedMinor, 0),
        status,
      };
    });
  }, [customersQ.data, plansQ.data, reqQ.data]);

  const q = search.trim().toLowerCase();
  const filtered = rows.filter(
    (r) =>
      (filter === "all" || r.status[2] === filter) &&
      (!q ||
        r.c.name.toLowerCase().includes(q) ||
        r.c.email.toLowerCase().includes(q)),
  );
  const error = customersQ.error ?? plansQ.error ?? reqQ.error;
  const loading = customersQ.isPending || plansQ.isPending || reqQ.isPending;

  return (
    <main className="flex flex-col gap-6 p-10">
      <PageHeader
        title="Users"
        aside={
          <SearchBox
            value={search}
            onChange={(v) => {
              setSearch(v);
              setShown(PAGE);
            }}
            placeholder="Search by name or email…"
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
          { id: "all", label: `All (${rows.length.toLocaleString()})` },
          { id: "active", label: "Active plans" },
          { id: "request", label: "Request pending" },
          { id: "none", label: "No active plan" },
        ]}
      />
      {error && (
        <QueryError
          error={error}
          retry={() => {
            void customersQ.refetch();
            void plansQ.refetch();
            void reqQ.refetch();
          }}
        />
      )}
      <div className="overflow-x-auto rounded-3xl bg-white p-6">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="text-xs font-semibold uppercase tracking-wider text-muted">
              {[
                "Name",
                "Email",
                "Plans",
                "Total saved",
                "Status",
                "Joined",
                "",
              ].map((h) => (
                <th key={h} className="px-3 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, shown).map(({ c, plans, saved, status }) => (
              <tr key={c._id} className="border-t border-border">
                <td className="px-3 py-4 font-bold">{c.name}</td>
                <td className="px-3 py-4 text-ink-soft">{c.email}</td>
                <td className="px-3 py-4">{plans}</td>
                <td className="px-3 py-4">{formatMoney(saved)}</td>
                <td className="px-3 py-4">
                  <Pill label={status[0]} tone={status[1]} />
                </td>
                <td className="px-3 py-4 text-ink-soft">
                  {formatDate(c.createdAt)}
                </td>
                <td className="px-3 py-4">
                  <Link
                    to={`/users/${c._id}`}
                    className="font-semibold text-link underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && (
          <p className="py-6 text-center text-sm text-muted">Loading users…</p>
        )}
        {!loading && filtered.length === 0 && (
          <p className="py-6 text-center text-sm text-muted">No users match.</p>
        )}
        {filtered.length > shown && (
          <div className="border-t border-border pt-4 text-center">
            <button
              onClick={() => setShown((n) => n + PAGE)}
              className="text-sm font-semibold text-link"
            >
              Load more users
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
