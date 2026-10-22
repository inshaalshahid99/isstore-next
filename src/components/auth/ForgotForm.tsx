"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { useSpin } from "@/hooks/useSpin";
import { validateEmail } from "@/lib/validate";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/store/ui";
import { BackLink } from "./BackLink";

export function ForgotForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, spin] = useSpin();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err = validateEmail(email);
    setError(err);
    if (err) return;
    spin(() => {
      const code = useAuthStore.getState().startVerification({ context: "forgot", email: email.trim(), from: "/forgot-password" });
      toast("Demo code:", { code, ms: 9000 });
      router.push("/verify");
    });
  };

  return (
    <form className="x-step" onSubmit={submit} noValidate>
      <BackLink href="/login">Back to sign in</BackLink>
      <h2>Reset your password</h2>
      <p className="x-lead">We&apos;ll email you a code to confirm it&apos;s you.</p>
      <Field label="Email" htmlFor="fp-email" error={error}>
        <Input
          id="fp-email"
          type="email"
          autoComplete="email"
          placeholder="you@store.com"
          value={email}
          invalid={!!error}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
        />
      </Field>
      <Button type="submit" variant="primary" loading={loading}>
        Send code
      </Button>
    </form>
  );
}
