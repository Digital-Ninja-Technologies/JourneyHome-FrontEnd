import { Button } from "@journeyhome/ui/components/button";
import { Input } from "@journeyhome/ui/components/input";
import { Label } from "@journeyhome/ui/components/label";
import { useMutation } from "@tanstack/react-query";
import { Link, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { DemoNotice } from "@/components/demo-notice";
import { api, isUnsupported, UNSUPPORTED_MESSAGE } from "../lib/api";

export default function ResetPassword() {
  const { token } = useSearch({ from: "/reset-password" });
  const [mismatch, setMismatch] = useState(false);
  const reset = useMutation({
    mutationFn: (password: string) =>
      api("/auth/reset-password", { body: { token, password } }),
  });

  if (!token) {
    return (
      <AuthShell
        title="This link isn't"
        accent="valid."
        subtitle="The reset link is missing or incomplete. Request a new one and try again."
      >
        <Link
          to="/forgot-password"
          className="inline-flex h-[52px] items-center justify-center rounded-[14px] bg-foreground text-sm font-bold text-canvas"
        >
          Request a new link
        </Link>
      </AuthShell>
    );
  }

  if (reset.isSuccess) {
    return (
      <AuthShell
        title="Password"
        accent="updated."
        subtitle="You can now log in with your new password."
      >
        <Link
          to="/login"
          className="inline-flex h-[52px] items-center justify-center rounded-[14px] bg-foreground text-sm font-bold text-canvas"
        >
          Log in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Set a new"
      accent="password."
      subtitle="Choose something you haven't used before."
    >
      <DemoNotice />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const d = new FormData(e.currentTarget);
          const pw = String(d.get("password"));
          if (pw !== String(d.get("confirm"))) return setMismatch(true);
          setMismatch(false);
          reset.mutate(pw);
        }}
        className="flex flex-col gap-8"
      >
        <section className="flex flex-col gap-4 rounded-[20px] bg-white p-7 shadow-sm">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="At least 6 characters"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm">Confirm new password</Label>
            <Input
              id="confirm"
              name="confirm"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Re-enter your new password"
            />
          </div>
          {(mismatch || reset.isError) && (
            <p
              role="alert"
              className="rounded-lg bg-status-cancelled-bg px-3 py-2 text-[13px] text-status-cancelled"
            >
              {mismatch
                ? "Those passwords don't match."
                : isUnsupported(reset.error)
                  ? `${UNSUPPORTED_MESSAGE} Password reset isn't enabled yet.`
                  : reset.error?.message}
            </p>
          )}
        </section>
        <Button
          type="submit"
          size="lg"
          disabled={reset.isPending}
          className="h-[52px] rounded-[14px]"
        >
          {reset.isPending ? "Saving…" : "Save new password"}
        </Button>
      </form>
    </AuthShell>
  );
}
