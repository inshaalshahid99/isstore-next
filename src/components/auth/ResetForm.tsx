"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/Input";
import { useSpin } from "@/hooks/useSpin";
import { hasErrors, type Errors } from "@/lib/validate";
import { useAuthStore } from "@/store/auth";
import { useUI } from "@/store/ui";
import { BackLink } from "./BackLink";

type Key = "password" | "confirm";

/** Final step of the reset flow, unlocked by a verified code. */
export function ResetForm() {
  const hydrated = useUI((s) => s.hydrated);
  const resetEmail = useAuthStore((s) => s.resetEmail);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors<Key>>({});
  const [done, setDone] = useState(false);
  const [loading, spin] = useSpin();

  if (done) {
    return (
      <div className="x-step">
        <div className="x-success">
          <Check size={26} strokeWidth={1.75} />
        </div>
        <h2>Password updated</h2>
        <p className="x-lead">You can now sign in with your new password.</p>
        <Link href="/login" className="x-btn x-btn--pri">
          <span>Back to sign in</span>
        </Link>
      </div>
    );
  }

  if (hydrated && !resetEmail) {
    return (
      <div className="x-step">
        <BackLink href="/login">Back to sign in</BackLink>
        <h2>Reset link expired</h2>
        <p className="x-lead">Confirm your email with a code first, then choose a new password.</p>
        <Link href="/forgot-password" className="x-btn x-btn--pri">
          <span>Send me a code</span>
        </Link>
      </div>
    );
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Errors<Key> = {
      password: password.length < 8 ? "Use at least 8 characters" : "",
      confirm: !password || confirm !== password ? "Passwords don't match" : "",
    };
    setErrors(next);
    if (hasErrors(next)) return;
    spin(() => {
      const auth = useAuthStore.getState();
      if (auth.resetEmail) auth.setPassword(auth.resetEmail, password);
      auth.setResetEmail(null);
      auth.clearPending();
      setDone(true);
    });
  };

  return (
    <form className="x-step" onSubmit={submit} noValidate>
      <h2>Set a new password</h2>
      <p className="x-lead">
        Choose something you haven&apos;t used before{resetEmail ? <> for <b>{resetEmail}</b></> : null}.
      </p>
      <Field label="New password" htmlFor="np-pw" error={errors.password}>
        <PasswordInput id="np-pw" autoComplete="new-password" placeholder="At least 8 characters" value={password} invalid={!!errors.password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      <Field label="Confirm password" htmlFor="np-pw2" error={errors.confirm}>
        <PasswordInput id="np-pw2" autoComplete="new-password" placeholder="Repeat password" value={confirm} invalid={!!errors.confirm} onChange={(e) => setConfirm(e.target.value)} />
      </Field>
      <Button type="submit" variant="primary" loading={loading}>
        Update password
      </Button>
    </form>
  );
}
