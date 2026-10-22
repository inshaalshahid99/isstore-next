import { EMAIL_RE, strength } from "./format";

/** Each validator returns an error message, or "" when the value is fine. */
export const validateEmail = (v: string) =>
  !v.trim() ? "Enter your email address" : !EMAIL_RE.test(v.trim()) ? "Enter a valid email, like you@store.com" : "";

export const validateNewPassword = (pw: string) =>
  pw.length < 8 ? "Use at least 8 characters" : strength(pw) < 2 ? "Too weak: add a number, capital or symbol" : "";

export const validateConfirm = (pw: string, confirm: string) =>
  !confirm ? "Confirm your password" : confirm !== pw ? "Passwords don't match" : "";

export type Errors<K extends string> = Partial<Record<K, string>>;

export const hasErrors = (errors: Record<string, string | undefined>) => Object.values(errors).some(Boolean);
