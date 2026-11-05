import { Button } from "@journeyhome/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@journeyhome/ui/components/dialog";
import { Input } from "@journeyhome/ui/components/input";
import { Label } from "@journeyhome/ui/components/label";
import { Switch } from "@journeyhome/ui/components/switch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { DemoNotice } from "@/components/demo-notice";
import { ApiError } from "@/lib/api";
import { formatMonthYearLong, initials } from "@/lib/format";
import { useDeleteAccountMutation } from "@/modules/auth/mutations";
import { useSessionUser } from "@/modules/auth/query-options";
import { changePassword, updatePreferences } from "@/modules/profile/api";
import { useMe } from "@/modules/profile/query-options";
import type { Me } from "@/modules/profile/types";

const card = "flex flex-col gap-6 rounded-[28px] bg-white p-7";
const h2 = "font-serif text-[28px] font-normal";
const errCls =
  "rounded-lg bg-status-cancelled-bg px-3 py-2 text-[13px] text-status-cancelled";

function explain(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return "Something went wrong. Please try again.";
}

function PersonalInfo({ me }: { me?: Me }) {
  const user = useSessionUser();
  const name = me?.name ?? user?.name ?? "";
  const email = me?.email ?? user?.email ?? "";

  return (
    <section className={card}>
      <div className="flex items-center gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-[#A9C4B0] text-lg font-bold text-foreground">
          {initials(name)}
        </span>
        <div>
          <h2 className={h2}>{name}</h2>
          {me && (
            <div className="text-[13px] text-muted-foreground">
              Member since {formatMonthYearLong(me.createdAt)}
            </div>
          )}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            name="name"
            disabled
            value={name}
            readOnly
            className="cursor-not-allowed bg-muted/10 opacity-75"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            disabled
            value={email}
            readOnly
            className="cursor-not-allowed bg-muted/10 opacity-75"
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Name and email are fixed to your verified account. To request a legal
        name change or email update, please contact support.
      </p>
    </section>
  );
}

function PaymentMethod() {
  return (
    <section className={card}>
      <div className="flex items-center justify-between">
        <h2 className={h2}>Payment method</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled
          className="h-auto px-3 py-1.5 text-xs text-muted-foreground opacity-50 cursor-not-allowed"
        >
          Add new
        </Button>
      </div>
      <div className="flex items-start gap-3 rounded-2xl bg-cream/50 p-4 text-xs leading-relaxed text-muted-foreground">
        <ShieldCheck className="size-5 shrink-0 text-status-active" />
        <p>
          Monthly plan contributions are managed via Paystack recurring
          subscriptions. Payment authorization is established when you make your
          first contribution.
        </p>
      </div>
    </section>
  );
}

function NotificationPreferences({ me }: { me?: Me }) {
  const queryClient = useQueryClient();
  const prefs = me?.notificationPreferences ?? {
    paymentReminders: true,
    deficitAlerts: true,
    serviceRequestUpdates: true,
    productNewsOffers: false,
  };

  const update = useMutation({
    mutationFn: (next: typeof prefs) => updatePreferences(next),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  function toggle(key: keyof typeof prefs) {
    update.mutate({ ...prefs, [key]: !prefs[key] });
  }

  const items: [keyof typeof prefs, string, string][] = [
    [
      "paymentReminders",
      "Payment reminders",
      "Before a monthly contribution is charged",
    ],
    [
      "deficitAlerts",
      "Deficit alerts",
      "If a monthly charge fails or is missed",
    ],
    [
      "serviceRequestUpdates",
      "Service updates",
      "When a photographer is assigned or documents are approved",
    ],
    [
      "productNewsOffers",
      "Journey Home news",
      "Occasional product updates and features",
    ],
  ];

  return (
    <section className={card}>
      <h2 className={h2}>Notification preferences</h2>
      <div className="flex flex-col gap-4">
        {items.map(([key, title, desc]) => (
          <label
            key={key}
            className="flex cursor-pointer items-start justify-between gap-4 py-2"
          >
            <div>
              <div className="text-sm font-bold">{title}</div>
              <div className="text-xs text-muted-foreground">{desc}</div>
            </div>
            <Switch
              checked={prefs[key]}
              onCheckedChange={() => toggle(key)}
              aria-label={title}
            />
          </label>
        ))}
      </div>
    </section>
  );
}

function ChangePassword() {
  const [open, setOpen] = useState(false);
  const [mismatch, setMismatch] = useState(false);
  const change = useMutation({
    mutationFn: (body: { currentPassword?: string; newPassword?: string }) =>
      changePassword(body),
  });
  return (
    <div className="border-t border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-4 text-[15px] font-semibold underline cursor-pointer"
        aria-expanded={open}
      >
        Change password{" "}
        <ChevronRight
          className={`size-4 transition ${open ? "rotate-90" : ""}`}
        />
      </button>
      {open && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const d = new FormData(form);
            if (d.get("next") !== d.get("confirm")) return setMismatch(true);
            setMismatch(false);
            change.mutate(
              {
                currentPassword: String(d.get("current")),
                newPassword: String(d.get("next")),
              },
              { onSuccess: () => form.reset() },
            );
          }}
          className="mb-5 flex flex-col gap-3"
        >
          <DemoNotice>
            Any current password works except <strong>wrong</strong>.
          </DemoNotice>
          <Input
            name="current"
            type="password"
            placeholder="Current password"
            required
            autoComplete="current-password"
          />
          <Input
            name="next"
            type="password"
            placeholder="New password (min 6 characters)"
            required
            minLength={6}
            autoComplete="new-password"
          />
          <Input
            name="confirm"
            type="password"
            placeholder="Confirm new password"
            required
            autoComplete="new-password"
          />
          {mismatch && (
            <p role="alert" className={errCls}>
              New passwords don&rsquo;t match.
            </p>
          )}
          {change.isError && (
            <p role="alert" className={errCls}>
              {explain(change.error)}
            </p>
          )}
          {change.isSuccess && (
            <p className="text-[13px] font-semibold text-status-active">
              Password updated.
            </p>
          )}
          <Button
            type="submit"
            disabled={change.isPending}
            className="w-fit rounded-xl"
          >
            {change.isPending ? "Updating…" : "Update password"}
          </Button>
        </form>
      )}
    </div>
  );
}

function DeleteAccountDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [password, setPassword] = useState("");
  const del = useDeleteAccountMutation();

  function onConfirm() {
    del.mutate(password);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md rounded-3xl p-7">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-normal text-status-cancelled">
            Delete your account?
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
            This will permanently remove your Journey Home profile, cancel any
            plans that are still pending, and pause automatic contributions.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 py-2">
          <Label htmlFor="del-password">Confirm your password</Label>
          <Input
            id="del-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            autoComplete="current-password"
          />
        </div>
        {del.isError && (
          <p role="alert" className={errCls}>
            {explain(del.error)}
          </p>
        )}
        <DialogFooter className="mt-2 flex gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Keep account
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!password || del.isPending}
            onClick={onConfirm}
          >
            {del.isPending ? "Deleting…" : "Delete permanently"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SecuritySection() {
  const [showDelete, setShowDelete] = useState(false);
  return (
    <section className={card}>
      <h2 className={h2}>Security</h2>
      <ChangePassword />
      <div className="flex items-center justify-between border-t border-border pt-4">
        <div>
          <div className="text-sm font-bold text-status-cancelled">
            Delete account
          </div>
          <div className="text-xs text-muted-foreground">
            Permanently remove your profile and cancel pending plans
          </div>
        </div>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => setShowDelete(true)}
          className="rounded-xl"
        >
          Delete
        </Button>
      </div>
      <DeleteAccountDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
      />
    </section>
  );
}

export function ProfileView() {
  const meQ = useMe();
  return (
    <main className="flex max-w-[820px] flex-col gap-6 p-5 md:p-10">
      <div>
        <div className="text-sm text-muted-foreground">
          <Link to="/app" className="hover:underline">
            Dashboard
          </Link>{" "}
          / Profile
        </div>
        <h1 className="font-serif text-[36px] font-normal leading-[1.05] sm:text-[44px] md:text-[56px]">
          Profile &amp; <span className="italic">settings</span>
        </h1>
      </div>

      <PersonalInfo me={meQ.data} />
      <PaymentMethod />
      <NotificationPreferences me={meQ.data} />
      <SecuritySection />
    </main>
  );
}

export default ProfileView;
