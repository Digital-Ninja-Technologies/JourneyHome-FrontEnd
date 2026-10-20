import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@journeyhome/ui/components/button";
import { Input } from "@journeyhome/ui/components/input";
import { Label } from "@journeyhome/ui/components/label";
import { AuthShell } from "../components/AuthShell";
import { DemoNotice } from "../components/DemoNotice";
import { UNSUPPORTED_MESSAGE, USE_MOCKS, api, isUnsupported } from "../lib/api";
import { DEMO_RESET_TOKEN } from "../mocks";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const send = useMutation({ mutationFn: (e: string) => api("/auth/forgot-password", { body: { email: e } }) });
  const unsupported = isUnsupported(send.error);

  if (send.isSuccess) {
    return (
      <AuthShell title="Check your" accent="email." subtitle={`If an account exists for ${email}, we've sent a link to reset your password.`}>
        <DemoNotice>No email is sent. {USE_MOCKS && <Link className="font-bold underline" to={`/reset-password?token=${DEMO_RESET_TOKEN}`}>Open the reset link</Link>}</DemoNotice>
        <div className="flex flex-col items-center gap-3 text-[13px] text-muted">
          <p>It can take a few minutes to arrive. Check your spam folder too.</p>
          <button className="font-bold text-link underline" onClick={() => send.reset()}>Use a different email</button>
          <Link to="/login" className="underline">Back to log in</Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Reset your" accent="password." subtitle="Enter the email on your account and we'll send a link to reset your password.">
      <DemoNotice />
      <form onSubmit={(e) => { e.preventDefault(); send.mutate(email.trim()); }} className="flex flex-col gap-8">
        <section className="flex flex-col gap-4 rounded-[20px] bg-white p-7 shadow-sm">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {send.isError && (
            <p role="alert" className="rounded-lg bg-status-cancelled-bg px-3 py-2 text-[13px] text-status-cancelled">{unsupported ? `${UNSUPPORTED_MESSAGE} Password reset isn't enabled yet.` : send.error.message}</p>
          )}
        </section>
        <Button type="submit" size="lg" disabled={send.isPending} className="h-[52px] rounded-[14px]">{send.isPending ? "Sending…" : "Send reset link"}</Button>
        <Link to="/login" className="text-center text-[13px] text-muted underline">Back to log in</Link>
      </form>
    </AuthShell>
  );
}
