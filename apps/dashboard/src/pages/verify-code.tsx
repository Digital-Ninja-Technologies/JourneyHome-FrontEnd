import { Button } from "@journeyhome/ui/components/button";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { DemoNotice } from "@/components/demo-notice";
import { OtpInput } from "@/components/otp-input";
import { useAuth } from "../auth/auth-context";
import { api, isUnsupported, UNSUPPORTED_MESSAGE } from "../lib/api";
import { DEMO_CODE } from "../mocks";

const COOLDOWN = 30;

export default function VerifyCode() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [wait, setWait] = useState(COOLDOWN);
  const [resent, setResent] = useState(false);

  const send = useMutation({
    mutationFn: () => api("/auth/verification/send", { method: "POST" }),
    onSuccess: () => setWait(COOLDOWN),
  });
  const confirm = useMutation({
    mutationFn: () => api("/auth/verification/confirm", { body: { code } }),
    onSuccess: () => navigate({ to: "/signup/plan", replace: true }),
  });

  // Ask for a code once when the page opens.
  const asked = useRef(false);
  useEffect(() => {
    if (asked.current) return;
    asked.current = true;
    send.mutate();
  }, [send]);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const unsupported = isUnsupported(send.error) || isUnsupported(confirm.error);
  const complete = code.length === 6;

  return (
    <div className="flex w-full max-w-[480px] flex-col items-center gap-8">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-sans text-4xl font-extrabold leading-[1.1] tracking-tight">
          Verify it's{" "}
          <span className="font-serif font-normal italic text-link">
            you.
          </span>
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          We sent a 6-digit code to {user?.email ?? "your email"}.
        </p>
      </div>
      <div className="flex w-full flex-col gap-6">
      <DemoNotice>
        Use code <strong>{DEMO_CODE}</strong>.
      </DemoNotice>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (complete) confirm.mutate();
        }}
        className="flex flex-col gap-6"
      >
        <section className="flex flex-col items-center gap-4 rounded-[28px] bg-white p-7 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-[1.5px] text-muted">
            Enter verification code
          </div>
          <OtpInput
            value={code}
            onChange={(v) => {
              setCode(v);
              confirm.reset();
            }}
            invalid={confirm.isError && !unsupported}
          />
          {confirm.isError && !unsupported && (
            <p role="alert" className="text-[13px] text-status-cancelled">
              {confirm.error.message}
            </p>
          )}
          <div className="text-[13px] text-muted">
            Didn&rsquo;t get it?{" "}
            {wait > 0 ? (
              <span>Resend in {wait}s</span>
            ) : (
              <button
                type="button"
                disabled={send.isPending}
                onClick={() => {
                  setResent(true);
                  send.mutate();
                }}
                className="font-bold text-link underline"
              >
                Resend code
              </button>
            )}
          </div>
          {resent && send.isSuccess && wait > 0 && (
            <p className="text-xs text-status-active">
              A new code is on its way.
            </p>
          )}
        </section>

        {unsupported ? (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-2xl bg-cream px-5 py-4 text-sm text-status-due"
          >
            <span>
              {UNSUPPORTED_MESSAGE} Verification codes aren&rsquo;t enabled yet,
              so you can carry on without one.
            </span>
            <Link to="/signup/plan" className="font-bold underline">
              Continue →
            </Link>
          </div>
        ) : (
          <Button
            type="submit"
            size="lg"
            disabled={!complete || confirm.isPending}
            className="h-[54px] rounded-2xl"
          >
            {confirm.isPending ? "Checking…" : "Verify & continue →"}
          </Button>
        )}
        {send.isError && !unsupported && (
          <p
            role="alert"
            className="text-center text-[13px] text-status-cancelled"
          >
            {send.error.message}
          </p>
        )}
        <Link
          to="/app"
          className="text-center text-xs font-semibold text-muted underline"
        >
          Skip for now — I&rsquo;ll verify later
        </Link>
      </form>
    </div>
  </div>
);
}
