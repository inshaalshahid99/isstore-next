import type { Order } from "./types";

const cell = (v: string | number) => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function ordersToCsv(orders: Order[]): string {
  const head = ["Order", "Date", "Customer", "Email", "Items", "Products", "Subtotal", "Shipping", "Total", "Payment", "Fulfillment", "Ship to"];
  const rows = orders.map((o) => [
    `#${o.id}`,
    o.placedAt.slice(0, 10),
    o.customer,
    o.email,
    o.items,
    o.lines.map((l) => `${l.name} x${l.qty}`).join("; "),
    o.subtotal.toFixed(2),
    o.shipping.toFixed(2),
    o.total.toFixed(2),
    o.payment,
    o.fulfillment,
    `${o.street}, ${o.city}`,
  ]);
  return [head, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
}

/** Triggers a browser download; the BOM keeps Excel happy with UTF-8 names like García. */
export function downloadCsv(filename: string, csv: string) {
  const url = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
