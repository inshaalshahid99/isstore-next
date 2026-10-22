"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input, PasswordInput } from "@/components/ui/Input";
import { StrengthMeter } from "@/components/ui/StrengthMeter";
import { useSpin } from "@/hooks/useSpin";
import { STRENGTH_LABELS, strength } from "@/lib/format";
import { hasErrors, validateConfirm, validateEmail, validateNewPassword, type Errors } from "@/lib/validate";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/store/ui";
import { BackLink } from "./BackLink";

type Key = "name" | "email" | "password" | "confirm" | "terms";

export function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", terms: false });
  const [errors, setErrors] = useState<Errors<Key>>({});
  const [loading, spin] = useSpin();

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const auth = useAuthStore.getState();
    const emailErr = validateEmail(form.email);
    const next: Errors<Key> = {
      name: form.name.trim().length < 2 ? "Enter your full name" : "",
      email: emailErr || (auth.findUser(form.email) ? "An account with this email already exists. Sign in instead." : ""),
      password: validateNewPassword(form.password),
      confirm: validateConfirm(form.password, form.confirm),
      terms: form.terms ? "" : "Please accept the terms to continue",
    };
    setErrors(next);
    if (hasErrors(next)) return;
    spin(() => {
      const email = form.email.trim();
      const code = auth.startVerification({
        context: "signup",
        email,
        from: "/signup",
        account: { name: form.name.trim(), email, password: form.password },
      });
      toast("Demo code:", { code, ms: 9000 });
      router.push("/verify");
    });
  };

  const s = strength(form.password);
  return (
    <form className="x-step" onSubmit={submit} noValidate>
      <BackLink href="/login">Back to sign in</BackLink>
      <h2>Create your account</h2>
      <p className="x-lead">Start running your store in minutes.</p>
      <Field label="Full name" htmlFor="su-name" error={errors.name}>
        <Input id="su-name" autoComplete="name" placeholder="Inshaal Shahid" value={form.name} invalid={!!errors.name} onChange={(e) => set("name", e.target.value)} />
      </Field>
      <Field label="Email" htmlFor="su-email" error={errors.email}>
        <Input id="su-email" type="email" autoComplete="email" placeholder="you@store.com" value={form.email} invalid={!!errors.email} onChange={(e) => set("email", e.target.value)} />
      </Field>
      <Field label="Password" htmlFor="su-pw" error={errors.password} aside={<span className="x-mlab">{form.password ? STRENGTH_LABELS[s] : "At least 8 characters"}</span>}>
        <PasswordInput id="su-pw" autoComplete="new-password" placeholder="Create a password" value={form.password} invalid={!!errors.password} onChange={(e) => set("password", e.target.value)} />
        <StrengthMeter password={form.password} />
      </Field>
      <Field label="Confirm password" htmlFor="su-pw2" error={errors.confirm}>
        <PasswordInput id="su-pw2" autoComplete="new-password" placeholder="Repeat password" value={form.confirm} invalid={!!errors.confirm} onChange={(e) => set("confirm", e.target.value)} />
      </Field>
      <div className={errors.terms ? "x-field bad" : "x-field"}>
        <label className="x-check">
          <input type="checkbox" checked={form.terms} onChange={(e) => set("terms", e.target.checked)} />
          <span>I agree to the Terms of Service and Privacy Policy.</span>
        </label>
        <p className="x-err">{errors.terms}</p>
      </div>
      <Button type="submit" variant="primary" loading={loading}>
        Create account
      </Button>
      <p className="x-foot">
        Already have an account?{" "}
        <Link href="/login" className="x-a">
          Sign in
        </Link>
      </p>
    </form>
  );
}
