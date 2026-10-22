"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BootScreen } from "@/components/providers/AppRoot";
import { Button, LinkButton } from "@/components/ui/Button";
import { OtpInput, OTP_LENGTH } from "@/components/ui/OtpInput";
import { useCountdown } from "@/hooks/useCountdown";
import { useSpin } from "@/hooks/useSpin";
import { startSession } from "@/lib/session";
import { useAuthStore, type OtpContext } from "@/store/auth";
import { toast, useUI } from "@/store/ui";
import { BackLink } from "./BackLink";

const TITLES: Record<OtpContext, string> = {
  signup: "Verify your email",
  forgot: "Confirm it's you",
  code: "Check your email",
  login2fa: "Two-factor sign-in",
};

/** One-time code screen shared by sign-up, email-code sign-in, 2FA sign-in and password reset. */
export function VerifyForm() {
  const router = useRouter();
  const hydrated = useUI((s) => s.hydrated);
  const pending = useAuthStore((s) => s.pending);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(0);
  const [loading, spin] = useSpin();
  const { left, restart } = useCountdown(60);

  useEffect(() => {
    if (hydrated && !pending && !useAuthStore.getState().session) router.replace("/login");
  }, [hydrated, pending, router]);

  if (!hydrated || !pending) return <BootScreen />;

  const verify = (value = code) => {
    if (loading) return;
    if (value.length < OTP_LENGTH) {
      setError("Enter all 6 digits");
      return;
    }
    spin(() => {
      const auth = useAuthStore.getState();
      const current = auth.pending;
      if (!current) return;
      if (value !== current.code) {
        setError("That code is incorrect. Check the toast and try again.");
        setCode("");
        setShake((n) => n + 1);
        return;
      }
      switch (current.context) {
        case "forgot":
          auth.setResetEmail(current.email);
          toast("Email verified");
          router.push("/reset-password");
          return;
        case "signup":
          if (current.account) auth.createAccount(current.account);
          startSession(current.email, current.account?.name);
          toast("Account created. Welcome to ISStore");
          break;
        case "code":
          startSession(current.email);
          toast("Signed in with email code");
          break;
        case "login2fa":
          startSession(current.email);
          toast("Signed in with two-factor authentication");
          break;
      }
      router.push("/dashboard");
    });
  };

  const resend = () => {
    const next = useAuthStore.getState().resendCode();
    toast("Demo code:", { code: next, ms: 9000 });
    setCode("");
    setError("");
    restart();
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    verify();
  };

  return (
    <form className="x-step" onSubmit={submit} noValidate>
      <BackLink href={pending.from}>
        Back
      </BackLink>
      <h2>{TITLES[pending.context]}</h2>
      <p className="x-lead">
        Enter the 6-digit code sent to <b>{pending.email}</b>. The demo code appears in a toast.
      </p>
      <OtpInput
        value={code}
        onChange={(v) => {
          setCode(v);
          setError("");
        }}
        onComplete={verify}
        error={error}
        shakeKey={shake}
        autoFocus
      />
      <p className="x-otperr" role="alert">
        {error}
      </p>
      <Button type="submit" variant="primary" loading={loading}>
        Verify code
      </Button>
      <p className="x-foot">
        Didn&apos;t get it?{" "}
        <LinkButton onClick={resend} disabled={left > 0}>
          {left > 0 ? `Resend code in 0:${String(left).padStart(2, "0")}` : "Resend code"}
        </LinkButton>
      </p>
    </form>
  );
}
