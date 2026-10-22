import type { Order, OrderStatus } from "./types";

/** The demo's "now": the end of October 2026, the month the order data covers. */
export const DEMO_NOW = new Date(2026, 9, 31, 9, 30);

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function money(value: number, digits = 0): string {
  return (
    "$" +
    value.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })
  );
}

export const int = (value: number): string => Math.round(value).toLocaleString("en-US");

export const kilo = (value: number): string => "$" + value.toFixed(1) + "k";

export const plural = (n: number, word: string): string => `${n} ${word}${n === 1 ? "" : "s"}`;

export const fmtDate = (iso: string | Date): string =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const fmtTime = (iso: string | Date): string =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

export const fmtStamp = (iso: string | Date): string =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " · " + fmtTime(iso);

export function ago(iso: string): string {
  const minutes = Math.max(1, Math.round((DEMO_NOW.getTime() - new Date(iso).getTime()) / 60000));
  const hours = Math.round(minutes / 60);
  const days = Math.floor(minutes / 1440);
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} h ago`;
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

export const initials = (name: string): string =>
  name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** A stable colour slot (a0 to a3) for a name, so the same person always gets the same avatar tint. */
export function hue(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 997;
  return "a" + (h % 4);
}

/** Password strength on a 0 to 4 scale. */
export function strength(pw: string): number {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) s++;
  return Math.max(1, s);
}

export const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"] as const;

export const statusOf = (o: Order): OrderStatus => (o.payment !== "Paid" ? o.payment : o.fulfillment);

export function greeting(date = new Date()): string {
  const h = date.getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

/** Deterministic pseudo-random generator (Park–Miller) so seeded demo data is identical on every load. */
export function rng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
