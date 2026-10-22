import type { ReactNode } from "react";

/** A status pill. The tone maps to a colour class: paid, shipped, pending, refunded, low, vip… */
export function Badge({ tone, children }: { tone: string; children: ReactNode }) {
  return <span className={`x-st ${tone.toLowerCase()}`}>{children}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={status}>{status}</Badge>;
}
