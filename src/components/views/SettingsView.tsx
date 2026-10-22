"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Bell, Lock, LogOut, Monitor, RotateCcw, ShoppingBag, Smartphone, Upload, User } from "lucide-react";
import { avatarStyle } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field } from "@/components/ui/Field";
import { Input, PasswordInput, Select } from "@/components/ui/Input";
import { OtpInput, OTP_LENGTH } from "@/components/ui/OtpInput";
import { PageHead, Panel } from "@/components/ui/Panel";
import { StrengthMeter } from "@/components/ui/StrengthMeter";
import { Switch } from "@/components/ui/Switch";
import { useSpin } from "@/hooks/useSpin";
import { cx } from "@/lib/cx";
import { initials, STRENGTH_LABELS, strength } from "@/lib/format";
import type { NotificationPrefs, StoreSettings } from "@/lib/types";
import { hasErrors, validateConfirm, validateEmail, validateNewPassword, type Errors } from "@/lib/validate";
import { useAuthStore } from "@/store/auth";
import { useDataStore } from "@/store/data";
import { toast, useUI } from "@/store/ui";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "store", label: "Store", icon: ShoppingBag },
  { id: "notify", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Lock },
] as const;
type Tab = (typeof TABS)[number]["id"];

export function SettingsView() {
  const [tab, setTab] = useState<Tab>("profile");
  const version = useDataStore((s) => s.version);
  return (
    <section className="x-wrap x-view">
      <PageHead title="Settings" sub="Your profile, store, notifications and security." />
      <Panel>
        <div className="x-tabs" role="tablist" aria-label="Settings sections">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" role="tab" id={`tab-${id}`} aria-controls={`panel-${id}`} aria-selected={tab === id} className={cx(tab === id && "on")} onClick={() => setTab(id)}>
              <Icon size={16} strokeWidth={1.75} />
              {label}
            </button>
          ))}
        </div>
        <div role="tabpanel" key={version} id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab === "profile" && <ProfileSettings />}
          {tab === "store" && <StoreSettingsForm />}
          {tab === "notify" && <NotificationSettings />}
          {tab === "security" && <SecuritySettings />}
        </div>
      </Panel>
      <DemoDataPanel />
    </section>
  );
}

/* ---------- profile ---------- */
const AVATAR_HINT = "PNG or JPG, up to 2 MB.";

function ProfileSettings() {
  const profile = useDataStore((s) => s.profile);
  const updateProfile = useDataStore((s) => s.updateProfile);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [hint, setHint] = useState(AVATAR_HINT);
  const [errors, setErrors] = useState<Errors<"name" | "email">>({});
  const [loading, spin] = useSpin();

  const pick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setHint("That file isn't an image. Choose a PNG or JPG.");
    if (file.size > 2 * 1024 * 1024) return setHint("That image is over 2 MB. Choose a smaller one.");
    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(String(reader.result));
      setHint(`${file.name} · save to apply`);
    };
    reader.readAsDataURL(file);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next = { name: name.trim().length < 2 ? "Enter your full name" : "", email: validateEmail(email) };
    setErrors(next);
    if (hasErrors(next)) return;
    spin(() => {
      updateProfile({ name: name.trim(), email: email.trim(), avatar });
      const session = useAuthStore.getState().session;
      if (session) useAuthStore.setState({ session: { ...session, name: name.trim() } });
      setHint(AVATAR_HINT);
      toast("Profile saved", { icon: "user" });
    });
  };

  return (
    <form className="x-set" onSubmit={submit} noValidate>
      <h2>Profile</h2>
      <p className="x-sub">How you appear to your team.</p>
      <div className="x-avrow">
        <div className={cx("x-avbig", avatar && "img")} style={avatarStyle(avatar)} aria-hidden="true">
          {initials(name.trim() || profile.name)}
        </div>
        <div>
          <div className="x-acts">
            <input className="x-file" type="file" id="sp-file" accept="image/*" onChange={pick} />
            <label className="x-btn" htmlFor="sp-file">
              <Upload size={16} strokeWidth={1.75} />
              <span>Upload photo</span>
            </label>
            {avatar && (
              <Button
                onClick={() => {
                  setAvatar(null);
                  setHint(AVATAR_HINT);
                }}
              >
                Remove
              </Button>
            )}
          </div>
          <p className="x-mlab" style={{ marginTop: 6 }}>
            {hint}
          </p>
        </div>
      </div>
      <div className="x-two">
        <Field label="Full name" htmlFor="sp-name" error={errors.name}>
          <Input id="sp-name" autoComplete="name" value={name} invalid={!!errors.name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Email" htmlFor="sp-email" error={errors.email}>
          <Input id="sp-email" type="email" autoComplete="email" value={email} invalid={!!errors.email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
      </div>
      <div className="x-setfoot">
        <Button type="submit" variant="primary" auto loading={loading}>
          Save profile
        </Button>
      </div>
    </form>
  );
}

/* ---------- store ---------- */
const CURRENCIES: [StoreSettings["currency"], string][] = [["USD", "US Dollar"], ["AED", "UAE Dirham"], ["GBP", "British Pound"], ["PKR", "Pakistani Rupee"]];
const TIMEZONES: [string, string][] = [["Asia/Karachi", "Karachi (GMT+5)"], ["Asia/Dubai", "Dubai (GMT+4)"], ["Europe/London", "London (GMT+0)"], ["America/New_York", "New York (GMT−5)"], ["UTC", "UTC"]];

function StoreSettingsForm() {
  const saved = useDataStore((s) => s.store);
  const updateStore = useDataStore((s) => s.updateStore);
  const [form, setForm] = useState(saved);
  const [error, setError] = useState("");
  const [loading, spin] = useSpin();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err = form.name.trim().length < 2 ? "Enter a store name" : "";
    setError(err);
    if (err) return;
    spin(() => {
      updateStore({ ...form, name: form.name.trim() });
      toast(`Store saved · ${form.currency} · ${TIMEZONES.find(([v]) => v === form.timezone)?.[1] ?? form.timezone}`);
    });
  };

  return (
    <form className="x-set" onSubmit={submit} noValidate>
      <h2>Store</h2>
      <p className="x-sub">Shown on invoices, emails and reports.</p>
      <Field label="Store name" htmlFor="ss-name" error={error}>
        <Input id="ss-name" value={form.name} invalid={!!error} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </Field>
      <div className="x-two">
        <Field label="Currency" htmlFor="ss-cur">
          <Select id="ss-cur" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value as StoreSettings["currency"] })}>
            {CURRENCIES.map(([code, label]) => (
              <option key={code} value={code}>
                {code} · {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Timezone" htmlFor="ss-tz">
          <Select id="ss-tz" value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })}>
            {TIMEZONES.map(([tz, label]) => (
              <option key={tz} value={tz}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="x-setfoot">
        <Button type="submit" variant="primary" auto loading={loading}>
          Save store
        </Button>
      </div>
    </form>
  );
}

/* ---------- notifications ---------- */
const NOTIFY_ROWS: [keyof NotificationPrefs, string, string][] = [
  ["newOrders", "New orders", "An email for every order placed"],
  ["lowStock", "Low stock", "When a product drops to 10 units or fewer"],
  ["weeklyReport", "Weekly report", "Sales summary every Monday morning"],
  ["marketing", "Marketing emails", "Product news and tips from ISStore"],
];

function NotificationSettings() {
  const saved = useDataStore((s) => s.notifications);
  const update = useDataStore((s) => s.updateNotifications);
  const [prefs, setPrefs] = useState(saved);
  const [loading, spin] = useSpin();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    spin(() => {
      update(prefs);
      toast(`Notification preferences saved · ${Object.values(prefs).filter(Boolean).length} of 4 on`, { icon: "bell" });
    });
  };

  return (
    <form className="x-set" onSubmit={submit} noValidate>
      <h2>Notifications</h2>
      <p className="x-sub">Choose what ISStore emails you about.</p>
      <ul className="x-rows">
        {NOTIFY_ROWS.map(([key, title, sub]) => (
          <li key={key}>
            <div>
              <b>{title}</b>
              <small>{sub}</small>
            </div>
            <Switch aria-label={title} checked={prefs[key]} onChange={(e) => setPrefs({ ...prefs, [key]: e.target.checked })} />
          </li>
        ))}
      </ul>
      <div className="x-setfoot">
        <Button type="submit" variant="primary" auto loading={loading}>
          Save preferences
        </Button>
      </div>
    </form>
  );
}

/* ---------- security ---------- */
function SecuritySettings() {
  return (
    <div className="x-set">
      <PasswordForm />
      <div className="x-setsec">
        <TwoFactorRow />
      </div>
      <div className="x-setsec">
        <Sessions />
      </div>
    </div>
  );
}

function PasswordForm() {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState<Errors<"current" | "next" | "confirm">>({});
  const [loading, spin] = useSpin();
  const set = (key: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [key]: v }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const auth = useAuthStore.getState();
    const email = auth.session?.email ?? "";
    const account = auth.findUser(email);
    const { current, next, confirm } = form;
    const errs = {
      current: !current
        ? "Enter your current password"
        : account && account.password !== current
          ? "That isn't your current password"
          : current.length < 6
            ? "That doesn't look right: at least 6 characters"
            : "",
      next: validateNewPassword(next) || (next === current ? "Choose a password different from your current one" : ""),
      confirm: validateConfirm(next, confirm),
    };
    setErrors(errs);
    if (hasErrors(errs)) return;
    spin(() => {
      if (account) auth.setPassword(email, next);
      setForm({ current: "", next: "", confirm: "" });
      toast("Password updated", { icon: "lock" });
    });
  };

  return (
    <form onSubmit={submit} noValidate>
      <h2>Change password</h2>
      <p className="x-sub">Use at least 8 characters with a number, capital or symbol.</p>
      <Field label="Current password" htmlFor="sx-cur" error={errors.current}>
        <PasswordInput id="sx-cur" autoComplete="current-password" value={form.current} invalid={!!errors.current} onChange={(e) => set("current", e.target.value)} />
      </Field>
      <div className="x-two">
        <Field label="New password" htmlFor="sx-new" error={errors.next}>
          <PasswordInput id="sx-new" autoComplete="new-password" value={form.next} invalid={!!errors.next} onChange={(e) => set("next", e.target.value)} />
          <StrengthMeter password={form.next} />
          <span className="x-mlab">{form.next ? STRENGTH_LABELS[strength(form.next)] : "At least 8 characters"}</span>
        </Field>
        <Field label="Confirm new password" htmlFor="sx-new2" error={errors.confirm}>
          <PasswordInput id="sx-new2" autoComplete="new-password" value={form.confirm} invalid={!!errors.confirm} onChange={(e) => set("confirm", e.target.value)} />
        </Field>
      </div>
      <div className="x-setfoot">
        <Button type="submit" variant="primary" auto loading={loading}>
          Update password
        </Button>
      </div>
    </form>
  );
}

function TwoFactorRow() {
  const on = useDataStore((s) => s.twoFactor);
  const setTwoFactor = useDataStore((s) => s.setTwoFactor);
  const ask = useUI((s) => s.ask);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  const startEnrol = () => {
    const code = String(Math.floor(Math.random() * 1e6)).padStart(6, "0");
    setEnrolling(code);
    toast("Demo code:", { code, ms: 9000 });
  };

  return (
    <>
      <ul className="x-rows">
        <li>
          <span className="ic">
            <Lock size={18} strokeWidth={1.75} />
          </span>
          <div>
            <b>Two-factor authentication</b>
            <small>{on ? "On · a 6-digit code is required at sign-in" : "Off · ask for a 6-digit code at sign-in"}</small>
          </div>
          <Switch
            aria-label="Two-factor authentication"
            checked={on}
            onChange={() =>
              on
                ? ask({
                    title: "Turn off two-factor authentication?",
                    body: "Sign-in will only ask for your password. You can turn it back on any time.",
                    confirmLabel: "Turn off",
                    danger: true,
                    onConfirm: () => {
                      setTwoFactor(false);
                      toast("Two-factor authentication turned off", { icon: "lock" });
                    },
                  })
                : startEnrol()
            }
          />
        </li>
      </ul>
      {enrolling && (
        <TwoFactorDialog
          code={enrolling}
          onCancel={() => setEnrolling(null)}
          onDone={() => {
            setEnrolling(null);
            setTwoFactor(true);
            toast("Two-factor authentication is on", { icon: "lock" });
          }}
        />
      )}
    </>
  );
}

function TwoFactorDialog({ code, onCancel, onDone }: { code: string; onCancel: () => void; onDone: () => void }) {
  const email = useDataStore((s) => s.profile.email);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(0);
  const [loading, spin] = useSpin();

  const verify = (v = value) => {
    if (loading) return;
    if (v.length < OTP_LENGTH) return setError("Enter all 6 digits");
    spin(() => {
      if (v !== code) {
        setError("That code is incorrect. Check the toast and try again.");
        setValue("");
        setShake((n) => n + 1);
        return;
      }
      onDone();
    });
  };

  return (
    <Dialog open onClose={onCancel} title="Turn on two-factor authentication" className="x-tfa" icon={<Lock size={20} strokeWidth={1.75} />} initialFocus=".x-otp input">
      <p>
        Enter the 6-digit code sent to <b>{email}</b>. The demo code appears in a toast.
      </p>
      <OtpInput
        value={value}
        onChange={(v) => {
          setValue(v);
          setError("");
        }}
        onComplete={verify}
        error={error}
        shakeKey={shake}
      />
      <p className="x-otperr" role="alert">
        {error}
      </p>
      <div className="x-acts">
        <Button auto onClick={onCancel}>
          Cancel
        </Button>
        <Button auto variant="primary" loading={loading} onClick={() => verify()}>
          Verify &amp; enable
        </Button>
      </div>
    </Dialog>
  );
}

function Sessions() {
  const sessions = useDataStore((s) => s.sessions);
  const endSession = useDataStore((s) => s.endSession);
  return (
    <>
      <h2>Active sessions</h2>
      <p className="x-sub">Devices signed in to your account.</p>
      <ul className="x-rows">
        {sessions.map((s) => (
          <li key={s.id}>
            <span className="ic">{s.kind === "phone" ? <Smartphone size={18} strokeWidth={1.75} /> : <Monitor size={18} strokeWidth={1.75} />}</span>
            <div>
              <b>{s.device}</b>
              <small>{s.detail}</small>
            </div>
            {s.current ? (
              <Badge tone="instock">Current</Badge>
            ) : (
              <Button
                variant="danger"
                icon={<LogOut size={16} strokeWidth={1.75} />}
                onClick={() => {
                  endSession(s.id);
                  toast(`Signed out ${s.device}`, { icon: "logout" });
                }}
              >
                Sign out
              </Button>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

/* ---------- demo data ---------- */
function DemoDataPanel() {
  const ask = useUI((s) => s.ask);
  return (
    <Panel className="x-set">
      <h2>Demo data</h2>
      <p className="x-sub">Everything you change in this demo is saved in your browser.</p>
      <div className="x-danger-zone">
        <div>
          <b>Reset demo data</b>
          <small>Restore the original 12 products, 30 orders, settings and notes. Your theme and sign-in stay.</small>
        </div>
        <Button
          variant="danger"
          icon={<RotateCcw size={16} strokeWidth={1.75} />}
          onClick={() =>
            ask({
              title: "Reset demo data?",
              body: "Products, orders, customer notes and settings go back to the original demo. This can't be undone.",
              confirmLabel: "Reset data",
              danger: true,
              onConfirm: () => {
                useDataStore.getState().resetDemo();
                useAuthStore.getState().resetDemoAccount();
                useUI.getState().setProductFilters({ q: "", category: "All" });
                toast("Demo data restored", { icon: "undo" });
              },
            })
          }
        >
          Reset demo data
        </Button>
      </div>
    </Panel>
  );
}
