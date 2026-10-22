/**
 * Seed data for the demo store. Everything is generated deterministically,
 * so "Reset demo data" always brings back exactly the same store.
 */
import { rng, stripAccents } from "./format";
import type {
  Category,
  Customer,
  NotificationPrefs,
  Order,
  OrderLine,
  Product,
  Profile,
  RangeKey,
  Session,
  StoreSettings,
} from "./types";

/* ---------- catalog ---------- */
export const SEED_PRODUCTS: Product[] = (
  [
    ["Aero Court Sneaker – White", "Footwear", 129, 48, "sneaker", "Lightweight knit upper on a cushioned court sole."],
    ["Aero Court Sneaker – Black", "Footwear", 129, 8, "sneaker", "The Aero Court in tonal black with a gum outsole."],
    ["Nova ANC Headphones – Graphite", "Audio", 249, 31, "headphones", "Adaptive noise cancelling with 40-hour battery life."],
    ["Nova ANC Headphones – Sand", "Audio", 249, 0, "headphones", "Nova ANC in a warm sand finish with vegan leather cups."],
    ["Heritage Leather Watch – Tan", "Watches", 189, 6, "watch", "Sapphire crystal, 38 mm steel case, tan calfskin strap."],
    ["Heritage Leather Watch – Midnight", "Watches", 199, 22, "watch", "Midnight dial with a black Italian leather strap."],
    ["Ambre Nuit Eau de Parfum – 50 ml", "Fragrance", 96, 64, "perfume", "Amber, smoked vanilla and a touch of bergamot."],
    ["Ambre Nuit Eau de Parfum – 100 ml", "Fragrance", 142, 15, "perfume", "The signature scent in the larger flacon."],
    ["Field Canvas Backpack – Olive", "Bags", 84, 37, "backpack", "Waxed canvas, padded 16-inch laptop sleeve."],
    ["Field Canvas Backpack – Charcoal", "Bags", 84, 0, "backpack", "Field Canvas in charcoal with leather trims."],
    ["Echo Mini Smart Speaker – Chalk", "Audio", 59, 92, "speaker", "Room-filling sound in a palm-sized fabric shell."],
    ["Echo Mini Smart Speaker – Slate", "Audio", 59, 4, "speaker", "Echo Mini in slate grey, voice assistant built in."],
  ] as const
).map(([name, category, price, stock, image, description], i) => ({
  id: i + 1,
  name,
  category,
  price,
  stock,
  image,
  description,
}));

export type StockLevel = "instock" | "low" | "out";
export function stockOf(stock: number): { level: StockLevel; label: string } {
  if (stock <= 0) return { level: "out", label: "Out of stock" };
  if (stock <= 10) return { level: "low", label: "Low stock" };
  return { level: "instock", label: "In stock" };
}

/* ---------- orders ---------- */
const CUSTOMER_SEED: [name: string, street: string, city: string][] = [
  ["Maya Torres", "214 Bergen St", "Brooklyn, NY 11217"], ["Daniel Okafor", "88 Elm Ave", "Austin, TX 78704"],
  ["Sofia Rossi", "1420 Pine St", "San Francisco, CA 94109"], ["Liam Becker", "37 Wren Ln", "Portland, OR 97214"],
  ["Aiko Tanaka", "902 Lake Shore Dr", "Chicago, IL 60611"], ["Noah Williams", "15 Harbor Rd", "Boston, MA 02110"],
  ["Priya Nair", "650 Peachtree St", "Atlanta, GA 30308"], ["Lucas Martin", "2201 Larimer St", "Denver, CO 80205"],
  ["Amara Mensah", "410 Pike St", "Seattle, WA 98101"], ["Ethan Brooks", "77 Ocean Dr", "Miami Beach, FL 33139"],
  ["Zara Ahmed", "1180 Main St", "Houston, TX 77002"], ["Oliver Chen", "39 Bleecker St", "New York, NY 10012"],
  ["Isabella Cruz", "5600 Sunset Blvd", "Los Angeles, CA 90028"], ["Mateo García", "812 Congress Ave", "Phoenix, AZ 85004"],
  ["Hannah Weiss", "26 Dupont Cir NW", "Washington, DC 20036"], ["Kofi Asante", "300 Broadway", "Nashville, TN 37201"],
  ["Chloe Dubois", "145 Canal St", "New Orleans, LA 70112"], ["Ryan Park", "999 Wisconsin Ave", "Milwaukee, WI 53202"],
];
const MAIL_DOMAINS = ["gmail.com", "outlook.com", "icloud.com", "proton.me"];

/** 30 October 2026 orders, one per day, with realistic payment and fulfilment states. */
export function seedOrders(): Order[] {
  const r = rng(20261031);
  const out: Order[] = [];
  for (let i = 0; i < 30; i++) {
    const [customer, street, city] = CUSTOMER_SEED[Math.floor(r() * CUSTOMER_SEED.length)];
    const day = i + 1;
    const placed = new Date(2026, 9, day, 8 + Math.floor(r() * 13), Math.floor(r() * 60));
    const count = 1 + Math.floor(r() * 3);
    const picks: number[] = [];
    while (picks.length < count) {
      const k = Math.floor(r() * SEED_PRODUCTS.length);
      if (!picks.includes(k)) picks.push(k);
    }
    const lines: OrderLine[] = picks.map((k) => {
      const p = SEED_PRODUCTS[k];
      return { name: p.name, image: p.image, price: p.price, qty: r() < 0.8 ? 1 : 2 };
    });
    const subtotal = lines.reduce((a, l) => a + l.price * l.qty, 0);
    const shipping = subtotal >= 150 ? 0 : 8;

    const s = r();
    const q = r();
    let payment: Order["payment"] = "Paid";
    let fulfillment: Order["fulfillment"];
    if (s < 0.14) {
      payment = "Pending";
      fulfillment = "Unfulfilled";
    } else if (s < 0.26) {
      payment = "Refunded";
      fulfillment = "Unfulfilled";
    } else if (day > 24) {
      fulfillment = q < 0.55 ? "Unfulfilled" : "Shipped";
    } else if (day > 14) {
      fulfillment = q < 0.25 ? "Unfulfilled" : q < 0.6 ? "Shipped" : "Fulfilled";
    } else {
      fulfillment = q < 0.15 ? "Shipped" : "Fulfilled";
    }

    const plus = (h: number) => new Date(placed.getTime() + h * 3600000).toISOString();
    const [first, last] = customer.split(" ").map((w) => stripAccents(w).toLowerCase());
    out.push({
      id: "IS-" + (1001 + i),
      num: 1001 + i,
      customer,
      email: `${first}.${last}@${MAIL_DOMAINS[(i + first.length) % 4]}`,
      street,
      city,
      placedAt: placed.toISOString(),
      lines,
      subtotal,
      shipping,
      total: subtotal + shipping,
      items: lines.reduce((a, l) => a + l.qty, 0),
      payment,
      fulfillment,
      paidAt: payment !== "Pending" ? plus(0.05) : null,
      shippedAt: fulfillment !== "Unfulfilled" ? plus(20 + Math.floor(r() * 30)) : null,
      fulfilledAt: fulfillment === "Fulfilled" ? plus(80 + Math.floor(r() * 40)) : null,
      refundedAt: payment === "Refunded" ? plus(30 + Math.floor(r() * 30)) : null,
    });
  }
  return out;
}

/* ---------- customers (derived from orders) ---------- */
const LOCATIONS = ["Dubai", "London", "Karachi", "New York", "Riyadh", "Berlin", "Doha", "Toronto"];

export function deriveCustomers(orders: Order[]): Customer[] {
  const byName = new Map<string, Customer>();
  [...orders]
    .sort((a, b) => a.num - b.num)
    .forEach((o) => {
      let c = byName.get(o.customer);
      if (!c) {
        c = {
          name: o.customer,
          email: stripAccents(o.customer).toLowerCase().replace(/\s+/g, ".") + "@mail.com",
          location: LOCATIONS[byName.size % LOCATIONS.length],
          orders: [],
          count: 0,
          spent: 0,
          tag: "New",
        };
        byName.set(o.customer, c);
      }
      c.orders.push(o);
    });
  return [...byName.values()].map((c) => {
    const count = c.orders.length;
    const spent = c.orders.reduce((a, o) => a + (o.payment === "Refunded" ? 0 : o.total), 0);
    return { ...c, count, spent, tag: spent > 500 ? "VIP" : count >= 2 ? "Returning" : "New" };
  });
}

/* ---------- overview ---------- */
export interface RangeConfig {
  points: number;
  step: number;
  factor: number;
  revenue: number;
  revenueDelta: number;
  orders: number;
  ordersDelta: number;
  customers: number;
  customersDelta: number;
  aov: number;
  aovDelta: number;
  word: string;
}

export const RANGES: Record<RangeKey, RangeConfig> = {
  "7D": { points: 7, step: 1, factor: 0.24, revenue: 11840, revenueDelta: 9.6, orders: 312, ordersDelta: 6.4, customers: 214, customersDelta: 3.9, aov: 37.95, aovDelta: -0.8, word: "7 days" },
  "30D": { points: 30, step: 1, factor: 1, revenue: 48920, revenueDelta: 12.4, orders: 1284, ordersDelta: 8.1, customers: 892, customersDelta: 5.3, aov: 38.1, aovDelta: -1.2, word: "30 days" },
  "90D": { points: 13, step: 7, factor: 2.9, revenue: 142360, revenueDelta: 18.7, orders: 3790, ordersDelta: 11.2, customers: 2470, customersDelta: 7.8, aov: 37.56, aovDelta: -2.1, word: "90 days" },
};

export const RANGE_KEYS: RangeKey[] = ["7D", "30D", "90D"];

/** Best sellers for the overview, by 30-day units; other ranges scale by the range factor. */
export const TOP_PRODUCTS = [
  { name: "Aero Court Sneaker", image: "sneaker", price: 129, units: 142 },
  { name: "Nova ANC Headphones", image: "headphones", price: 249, units: 96 },
  { name: "Heritage Leather Watch", image: "watch", price: 189, units: 64 },
  { name: "Ambre Nuit Eau de Parfum", image: "perfume", price: 96, units: 118 },
  { name: "Field Canvas Backpack", image: "backpack", price: 84, units: 87 },
  { name: "Echo Mini Smart Speaker", image: "speaker", price: 59, units: 153 },
] as const;

/** n points summing to `total`, with a gentle trend and some noise. */
export function series(n: number, total: number, seed: number, trend: number): number[] {
  const r = rng(seed);
  const raw: number[] = [];
  for (let i = 0; i < n; i++) raw.push((1 + (trend * i) / n) * (0.75 + r() * 0.5) * (1 + 0.12 * Math.sin(i / 1.7)));
  const sum = raw.reduce((a, b) => a + b, 0);
  return raw.map((v) => (v * total) / sum);
}

export function rangeLabels(cfg: RangeConfig, now: Date): string[] {
  const out: string[] = [];
  for (let i = cfg.points - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i * cfg.step);
    out.push(
      cfg.points === 7
        ? d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" })
        : (cfg.step === 7 ? "Wk of " : "") + d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    );
  }
  return out;
}

/* ---------- analytics (30D is the base; other ranges scale by factor) ---------- */
export const ANALYTICS = {
  months: [["Jan", 28.4], ["Feb", 31.2], ["Mar", 29.8], ["Apr", 34.6], ["May", 38.1], ["Jun", 36.9], ["Jul", 41.3], ["Aug", 44.7], ["Sep", 46.2], ["Oct", 48.9]] as [string, number][],
  funnel: [["Visitors", 48200], ["Add to cart", 6940], ["Checkout", 2310], ["Purchased", 1284]] as [string, number][],
  categories: [
    { name: "Footwear", share: 32, color: "var(--vi)" },
    { name: "Audio", share: 24, color: "var(--vi2)" },
    { name: "Watches", share: 18, color: "var(--li)" },
    { name: "Fragrance", share: 14, color: "var(--amb)" },
    { name: "Bags", share: 12, color: "var(--red)" },
  ] satisfies { name: Category; share: number; color: string }[],
  traffic: [["Organic", 38], ["Instagram", 24], ["Direct", 18], ["Email", 12], ["Referral", 8]] as [string, number][],
  countries: [["UAE", 11240], ["UK", 9180], ["Saudi Arabia", 8420], ["USA", 7960], ["Pakistan", 5310], ["Germany", 4120]] as [string, number][],
};

/* ---------- notifications ---------- */
export const STATIC_NOTES = [
  { id: "n-stock", icon: "alert", title: "Low stock: Heritage Leather Watch", sub: "6 units left · 1 h ago" },
  { id: "n-payout", icon: "card", title: "Payout of $12,480 sent", sub: "Arrives in 1–2 business days · 3 h ago" },
  { id: "n-review", icon: "star", title: "New 5-star review on Aero Court Sneaker", sub: "“Lightest pair I own.” · 5 h ago" },
] as const;

/* ---------- account defaults ---------- */
export const DEMO_EMAIL = "demo@isstore.shop";
export const DEMO_PASSWORD = "demo1234";
export const DEMO_NAME = "Inshaal Shahid";

export const DEFAULT_PROFILE: Profile = { name: DEMO_NAME, email: DEMO_EMAIL, avatar: null };
export const DEFAULT_STORE: StoreSettings = { name: "ISStore", currency: "USD", timezone: "Asia/Karachi" };
export const DEFAULT_NOTIFICATIONS: NotificationPrefs = { newOrders: true, lowStock: true, weeklyReport: true, marketing: false };
export const DEFAULT_SESSIONS: Session[] = [
  { id: "s-current", device: "Chrome · Karachi", detail: "This device · active now", kind: "desktop", current: true },
  { id: "s-iphone", device: "Safari iPhone · Dubai", detail: "Last active 2 h ago", kind: "phone" },
  { id: "s-firefox", device: "Firefox · London", detail: "Last active 3 days ago", kind: "desktop" },
];
