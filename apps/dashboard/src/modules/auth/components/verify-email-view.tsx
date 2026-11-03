import { Button, buttonVariants } from "@journeyhome/ui/components/button";
import { Input } from "@journeyhome/ui/components/input";
import { Label } from "@journeyhome/ui/components/label";
import { cn } from "@journeyhome/ui/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { Link, useSearch } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  getPendingVerificationEmail,
  resendVerification,
  setPendingVerificationEmail,
  verifyEmail,
} from "@/modules/auth/api";

const COOLDOWN = 30;

function Heading({ lead, accent }: { lead: string; accent: string }) {
  return (
    <h1 className="font-sans text-4xl font-extrabold leading-[1.1] tracking-tight">
      {lead}{" "}
      <span className="font-serif font-normal italic text-link">{accent}</span>
    </h1>
  );
}

function ResendBox({ initialEmail }: { initialEmail: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [wait, setWait] = useState(initialEmail ? COOLDOWN : 0);

  const resend = useMutation({
    mutationFn: () => resendVerification(email),
    onSuccess: () => {
      setPendingVerificationEmail(email.trim());
      setWait(COOLDOWN);
    },
  });

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (email.trim() && wait <= 0) resend.mutate();
      }}
      className="flex w-full flex-col gap-3 text-left"
    >
      <Label htmlFor="resend-email">Email address</Label>
      <Input
        id="resend-email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {resend.isSuccess && wait > 0 && (
        <p className="text-xs text-status-active">
          A new verification link is on its way.
        </p>
      )}
      {resend.isError && (
        <p role="alert" className="text-xs text-status-cancelled">
          {resend.error.message}
        </p>
      )}
      <Button
        type="submit"
        variant="outline"
        disabled={!email.trim() || wait > 0 || resend.isPending}
      >
        {resend.isPending
          ? "Sending…"
          : wait > 0
            ? `Resend in ${wait}s`
            : "Resend verification email"}
      </Button>
    </form>
  );
}

export function VerifyEmailView() {
  const { token } = useSearch({ from: "/_auth/verify-email" });
  const pendingEmail = getPendingVerificationEmail() ?? "";

  const verify = useMutation({
    mutationFn: (t: string) => verifyEmail(t),
  });

  // The link in the email lands here with ?token=...; verify it once.
  const started = useRef(false);
  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    verify.mutate(token);
  }, [token, verify]);

  // No token: the visitor just signed up (or tried to log in unverified).
  if (!token) {
    return (
      <>
        <div className="flex flex-col gap-2 text-center">
          <Heading lead="Check your" accent="email." />
          <p className="text-sm leading-relaxed text-muted">
            We sent a verification link to{" "}
            <strong className="text-foreground">
              {pendingEmail || "your email address"}
            </strong>
            . Click it to activate your account, then log in.
          </p>
        </div>
        <section className="flex flex-col gap-4 rounded-[28px] bg-white p-7 shadow-sm">
          <p className="text-[13px] text-muted">
            Didn&rsquo;t get it? Check your spam folder or send another link.
          </p>
          <ResendBox initialEmail={pendingEmail} />
        </section>
        <div className="text-center text-[13px] text-status-paused">
          Already verified?{" "}
          <Link to="/login" className="font-bold text-link underline">
            Log in
          </Link>
        </div>
      </>
    );
  }

  if (verify.isSuccess) {
    return (
      <>
        <div className="flex flex-col gap-2 text-center">
          <Heading lead="Email" accent="verified." />
          <p className="text-sm leading-relaxed text-muted">
            Your account is active. Log in to set up your first plan.
          </p>
        </div>
        <Link
          to="/login"
          search={{ redirect: "/signup/plan" }}
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-[52px] w-full rounded-[14px] font-bold",
          )}
        >
          Continue to log in
        </Link>
      </>
    );
  }

  if (verify.isError) {
    return (
      <>
        <div className="flex flex-col gap-2 text-center">
          <Heading lead="This link isn't" accent="valid." />
          <p
            role="alert"
            className="text-sm leading-relaxed text-status-cancelled"
          >
            {verify.error.message}
          </p>
          <p className="text-sm text-muted">
            It may have expired or already been used. Request a new one below.
          </p>
        </div>
        <section className="rounded-[28px] bg-white p-7 shadow-sm">
          <ResendBox initialEmail={pendingEmail} />
        </section>
        <div className="text-center text-[13px] text-status-paused">
          <Link to="/login" className="font-bold text-link underline">
            Back to log in
          </Link>
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-2 text-center">
      <Heading lead="Verifying your" accent="email…" />
      <p className="text-sm text-muted">This only takes a moment.</p>
    </div>
  );
}

export default VerifyEmailView;
