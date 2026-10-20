import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@journeyhome/ui/components/button";
import { Input } from "@journeyhome/ui/components/input";
import { Label } from "@journeyhome/ui/components/label";
import { useAuth } from "../auth/AuthContext";
import { Card, CardTitle, PageHeader, Pill, QueryError } from "../components/ui";
import { api } from "../lib/api";
import { usePackages, useAdmins } from "../lib/queries";
import type { Package } from "../lib/types";

function PackageCard({ pkg }: { pkg: Package }) {
  const queryClient = useQueryClient();
  const [naira, setNaira] = useState(String(pkg.monthlyContributionMinor / 100));
  const update = useMutation({
    mutationFn: (body: Partial<Package>) => api(`/packages/${pkg._id}`, { method: "PATCH", body }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["packages"] }),
  });
  const minor = Math.round(Number(naira) * 100);
  const dirty = minor !== pkg.monthlyContributionMinor;
  const valid = Number.isFinite(minor) && minor > 0;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border p-5">
      <div className="flex items-center justify-between">
        <div className="text-lg font-bold">{pkg.name}</div>
        <button onClick={() => update.mutate({ isActive: !pkg.isActive })} disabled={update.isPending} aria-label={`${pkg.isActive ? "Deactivate" : "Activate"} ${pkg.name}`}>
          <Pill label={pkg.isActive ? "Active" : "Inactive"} tone={pkg.isActive ? "active" : "paused"} />
        </button>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); if (valid && dirty) update.mutate({ monthlyContributionMinor: minor }); }} className="flex flex-col gap-1.5">
        <Label htmlFor={`price-${pkg._id}`}>Monthly contribution (₦)</Label>
        <div className="flex gap-2">
          <Input id={`price-${pkg._id}`} type="number" min={1} step="1" value={naira} onChange={(e) => setNaira(e.target.value)} />
          <Button type="submit" variant="accent" className="h-12 rounded-xl" disabled={!dirty || !valid || update.isPending}>{update.isPending ? "Saving…" : "Save"}</Button>
        </div>
      </form>
      {update.isError && <p role="alert" className="text-xs text-status-cancelled">{update.error.message}</p>}
    </div>
  );
}

function AdminTeam() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const adminsQ = useAdmins(true);
  const [adding, setAdding] = useState(false);
  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["admins"] });

  const add = useMutation({
    mutationFn: (body: Record<string, string>) => api("/auth/admin", { body }),
    onSuccess: () => { setAdding(false); refresh(); },
  });
  const remove = useMutation({ mutationFn: (id: string) => api(`/auth/admin/${id}`, { method: "DELETE" }), onSuccess: refresh });

  return (
    <Card>
      <CardTitle className="mb-3">Admin team</CardTitle>
      {adminsQ.isError && <QueryError error={adminsQ.error} retry={() => void adminsQ.refetch()} />}
      {adminsQ.data?.map((a) => (
        <div key={a.id} className="flex items-center justify-between gap-4 border-t border-border py-4">
          <div>
            <div className="font-bold">{a.name}</div>
            <div className="text-xs text-muted">{a.email} · {a.isSuperAdmin || a.role === "super_admin" ? "Super admin" : "Admin"}</div>
          </div>
          {!(a.isSuperAdmin || a.role === "super_admin") && a.id !== user?.id && (
            <button
              disabled={remove.isPending}
              onClick={() => window.confirm(`Remove ${a.name} as an admin?`) && remove.mutate(a.id)}
              className="text-sm font-semibold text-status-cancelled underline"
            >
              Remove
            </button>
          )}
        </div>
      ))}
      {remove.isError && <p role="alert" className="text-xs text-status-cancelled">{remove.error.message}</p>}
      {adding ? (
        <form
          onSubmit={(e) => { e.preventDefault(); const d = new FormData(e.currentTarget); add.mutate({ name: String(d.get("name")).trim(), email: String(d.get("email")).trim(), password: String(d.get("password")) }); }}
          className="mt-3 grid gap-3 border-t border-border pt-5 sm:grid-cols-3"
        >
          <Input name="name" required placeholder="Full name" aria-label="Full name" />
          <Input name="email" type="email" required placeholder="Work email" aria-label="Work email" />
          <Input name="password" type="password" required minLength={6} placeholder="Temporary password (6+ characters)" aria-label="Temporary password" />
          <div className="flex gap-2 sm:col-span-3">
            <Button type="submit" variant="accent" disabled={add.isPending}>{add.isPending ? "Adding…" : "Add admin"}</Button>
            <Button type="button" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
          {add.isError && <p role="alert" className="text-xs text-status-cancelled sm:col-span-3">{add.error.message}</p>}
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="mt-3 text-sm font-semibold text-link underline">+ Add admin</button>
      )}
    </Card>
  );
}

export default function Settings() {
  const { isSuperAdmin } = useAuth();
  const packagesQ = usePackages();
  return (
    <main className="flex max-w-[1000px] flex-col gap-6 p-10">
      <PageHeader title="Settings" />
      <Card>
        <CardTitle className="mb-1">Plan packages &amp; pricing</CardTitle>
        <p className="mb-5 text-sm text-muted">Price changes apply to new plans only — existing plans keep the price they started with.</p>
        {packagesQ.isPending && <p className="text-sm text-muted">Loading packages…</p>}
        {packagesQ.isError && <QueryError error={packagesQ.error} retry={() => void packagesQ.refetch()} />}
        <div className="grid gap-4 sm:grid-cols-2">{packagesQ.data?.map((p) => <PackageCard key={p._id} pkg={p} />)}</div>
      </Card>
      {isSuperAdmin ? (
        <AdminTeam />
      ) : (
        <Card>
          <CardTitle className="mb-1">Admin team</CardTitle>
          <p className="text-sm text-muted">Only super admins can view and manage the admin team.</p>
        </Card>
      )}
    </main>
  );
}
