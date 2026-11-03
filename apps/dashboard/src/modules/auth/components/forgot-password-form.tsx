import { Button } from "@journeyhome/ui/components/button";
import { Input } from "@journeyhome/ui/components/input";
import { Label } from "@journeyhome/ui/components/label";
import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { DemoNotice } from "@/components/demo-notice";
import { api, isUnsupported, UNSUPPORTED_MESSAGE, USE_MOCKS } from "@/lib/api";
import { DEMO_RESET_TOKEN } from "@/lib/api/mocks";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const send = useMutation({
    mutationFn: (e: string) =>
      api("/auth/forgot-password", { body: { email: e } }),
  });
  const unsupported = isUnsupported(send.error);

  if (send.isSuccess) {
    return (
      <>
        <div className="flex flex-col gap-2 text-center">
          <h1 className="font-sans text-4xl font-extrabold leading-[1.1] tracking-tight">
            Check your{" "}
            <span className="font-serif font-normal italic text-link">
              email.
            </span>
          </h1>
          <p className="text-sm leading-relaxed text-status-paused">
            If an account exists for {email}, we've sent a link to reset your
            password.
          </p>
        </div>
        <DemoNotice>
          No email is sent.{" "}
          {USE_MOCKS && (
            <Link
              className="font-bold underline"
              to="/reset-password"
              search={{ token: DEMO_RESET_TOKEN }}
            >
              Open the reset link
            </Link>
          )}
        </DemoNotice>
        <div className="flex flex-col items-center gap-3 text-[13px] text-muted">
          <p>
            It can take a few minutes to arrive. Check your spam folder too.
          </p>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto p-0 font-bold text-link underline"
            onClick={() => send.reset()}
          >
            Use a different email
          </Button>
          <Link to="/login" className="underline">
            Back to log in
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-sans text-4xl font-extrabold leading-[1.1] tracking-tight">
          Forgot your{" "}
          <span className="font-serif font-normal italic text-link">
            password?
          </span>
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          Enter your email and we&rsquo;ll send a link to reset it.
        </p>
      </div>

      <DemoNotice>
        Any email works. The demo shows a reset link directly on the next
        screen.
      </DemoNotice>

      {unsupported && (
        <div
          role="alert"
          className="rounded-2xl bg-cream p-4 text-xs leading-relaxed text-status-due"
        >
          {UNSUPPORTED_MESSAGE}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const d = new FormData(e.currentTarget);
          const val = String(d.get("email") ?? "").trim();
          setEmail(val);
          send.mutate(val);
        }}
        className="flex flex-col gap-5"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="e.g. adunni@example.com"
          />
        </div>

        {send.isError && !unsupported && (
          <p
            role="alert"
            className="rounded-lg bg-status-cancelled-bg px-3 py-2 text-[13px] text-status-cancelled"
          >
            {send.error.message}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={send.isPending || unsupported}
          className="h-[54px] rounded-2xl"
        >
          {send.isPending ? "Sending link…" : "Send reset link →"}
        </Button>
      </form>

      <div className="text-center text-xs text-muted">
        Remembered your password?{" "}
        <Link to="/login" className="font-bold text-link underline">
          Log in
        </Link>
      </div>
    </>
  );
}

export default ForgotPasswordForm;
