"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input, PasswordInput } from "@/components/ui/Input";
import { useSpin } from "@/hooks/useSpin";
import { DEMO_EMAIL } from "@/lib/data";
import { startSession } from "@/lib/session";
import { hasErrors, validateEmail, type Errors } from "@/lib/validate";
import { useAuthStore } from "@/store/auth";
import { useDataStore } from "@/store/data";
import { toast } from "@/store/ui";

type Key = "email" | "password";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
      <path d="M20 12a8 8 0 1 1-2.4-5.7" />
      <path d="M20.5 12H12.5" />
    </svg>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors<Key>>({});
  const [signingIn, spinSignIn] = useSpin();
  const [demoLoading, spinDemo] = useSpin();
  const [googleLoading, spinGoogle] = useSpin();
  const [codeLoading, spinCode] = useSpin();

  const enter = (address: string, message: string, name?: string) => {
    startSession(address, name);
    toast(message);
    router.push("/dashboard");
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Errors<Key> = {
      email: validateEmail(email),
      password: !password ? "Enter your password" : password.length < 6 ? "Password must be at least 6 characters" : "",
    };
    setErrors(next);
    if (hasErrors(next)) return;
    spinSignIn(() => {
      const address = email.trim();
      const auth = useAuthStore.getState();
      if (!auth.checkPassword(address, password)) {
        setErrors({ password: `Incorrect email or password. Try ${DEMO_EMAIL} / demo1234.` });
        return;
      }
      if (useDataStore.getState().twoFactor) {
        const code = auth.startVerification({ context: "login2fa", email: address, from: "/login" });
        toast("Demo code:", { code, ms: 9000 });
        router.push("/verify");
        return;
      }
      enter(address, "Welcome back to ISStore");
    });
  };

  const emailCode = () => {
    const err = validateEmail(email);
    setErrors({ email: err });
    if (err) return;
    spinCode(() => {
      const address = email.trim();
      const auth = useAuthStore.getState();
      if (!auth.findUser(address)) {
        setErrors({ email: "No ISStore account uses this email. Create one below." });
        return;
      }
      const code = auth.startVerification({ context: "code", email: address, from: "/login" });
      toast("Demo code:", { code, ms: 9000 });
      router.push("/verify");
    });
  };

  const edit = (key: Key, set: (v: string) => void) => (v: string) => {
    set(v);
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  return (
    <form className="x-step" onSubmit={submit} noValidate>
      <h2>Welcome back</h2>
      <p className="x-lead">Sign in to your ISStore workspace.</p>
      <Button
        variant="lime"
        loading={demoLoading}
        icon={<Sparkles size={18} strokeWidth={1.75} />}
        onClick={() => {
          setEmail(DEMO_EMAIL);
          spinDemo(() => enter(DEMO_EMAIL, "Welcome to the ISStore demo"));
        }}
      >
        Try demo account
      </Button>
      <div className="x-or">or sign in with email</div>
      <Field label="Email" htmlFor="si-email" error={errors.email}>
        <Input id="si-email" type="email" autoComplete="email" placeholder="you@store.com" value={email} invalid={!!errors.email} onChange={(e) => edit("email", setEmail)(e.target.value)} />
      </Field>
      <Field
        label="Password"
        htmlFor="si-pw"
        error={errors.password}
        aside={
          <Link href="/forgot-password" className="x-a">
            Forgot password?
          </Link>
        }
      >
        <PasswordInput id="si-pw" autoComplete="current-password" placeholder="••••••••" value={password} invalid={!!errors.password} onChange={(e) => edit("password", setPassword)(e.target.value)} />
      </Field>
      <div className="x-gap">
        <Button type="submit" variant="primary" loading={signingIn}>
          Sign in
        </Button>
        <Button
          loading={googleLoading}
          icon={<GoogleIcon />}
          onClick={() => spinGoogle(() => enter("inshaal@gmail.com", "Signed in with Google (simulated)", "Inshaal Shahid"))}
        >
          Continue with Google
        </Button>
        <Button loading={codeLoading} icon={<Mail size={18} strokeWidth={1.75} />} onClick={emailCode}>
          Use email code instead
        </Button>
      </div>
      <p className="x-foot">
        New to ISStore?{" "}
        <Link href="/signup" className="x-a">
          Create an account
        </Link>
      </p>
    </form>
  );
}
