import { Button } from "@journeyhome/ui/components/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@journeyhome/ui/components/input-otp";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  getPendingVerificationEmail,
  resendVerification,
  verifyEmail,
} from "@/modules/auth/api";
import { useSessionUser } from "@/modules/auth/query-options";

const COOLDOWN = 30;

export function VerifyCodeView() {
  const user = useSessionUser();
  const navigate = useNavigate();
  const search = useSearch({ from: "/signup/verify" });
  const [code, setCode] = useState(search.token ?? "");
  const [wait, setWait] = useState(COOLDOWN);
  const [resent, setResent] = useState(false);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    const stored = getPendingVerificationEmail();
    if (stored) {
      setEmail(stored);
    } else if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const send = useMutation({
    mutationFn: () => resendVerification(email),
    onSuccess: () => setWait(COOLDOWN),
  });

  const confirm = useMutation({
    mutationFn: (tokenToVerify: string) => verifyEmail(tokenToVerify),
    onSuccess: () => {
      if (user) {
        navigate({
          to: "/signup/plan",
          replace: true,
        });
      } else {
        navigate({
          to: "/login",
          search: search.redirect ? { redirect: search.redirect } : undefined,
          replace: true,
        });
      }
    },
  });

  // Auto-verify if token is present in URL search params
  const autoTriggered = useRef(false);
  useEffect(() => {
    if (search.token && !autoTriggered.current) {
      autoTriggered.current = true;
      confirm.mutate(search.token);
    }
  }, [search.token, confirm]);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const complete = code.trim().length >= 6;

  return (
    <div className="flex w-full max-w-[480px] flex-col items-center gap-8">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-sans text-4xl font-extrabold leading-[1.1] tracking-tight">
          Verify your{" "}
          <span className="font-serif font-normal italic text-link">
            email.
          </span>
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          We sent a verification code to{" "}
          <strong className="text-foreground">
            {email || "your email address"}
          </strong>
          .
        </p>
      </div>
      <div className="flex w-full flex-col gap-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (complete) confirm.mutate(code.trim());
          }}
          className="flex flex-col gap-6"
        >
          <section className="flex flex-col items-center gap-4 rounded-[28px] bg-white p-7 text-center shadow-sm">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={setCode}
              className="gap-2"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>

            {confirm.isError && (
              <p role="alert" className="text-xs text-status-cancelled">
                {confirm.error.message}
              </p>
            )}

            <div className="text-[13px] text-muted">
              Didn&rsquo;t get it?{" "}
              {wait > 0 ? (
                <span>Resend in {wait}s</span>
              ) : (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  disabled={send.isPending || !email}
                  onClick={() => {
                    setResent(true);
                    send.mutate();
                  }}
                  className="h-auto p-0 font-bold text-link underline"
                >
                  {send.isPending ? "Sending..." : "Resend code"}
                </Button>
              )}
            </div>

            {resent && send.isSuccess && wait > 0 && (
              <p className="text-xs text-status-active">
                A new verification email has been sent.
              </p>
            )}
          </section>

          <Button
            type="submit"
            size="lg"
            disabled={!complete || confirm.isPending}
            className="h-[54px] rounded-2xl"
          >
            {confirm.isPending ? "Checking…" : "Verify & continue →"}
          </Button>

          <div className="text-center text-[13px] text-status-paused">
            Wrong email address or already verified?{" "}
            <Link to="/login" className="font-bold text-link underline">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VerifyCodeView;
