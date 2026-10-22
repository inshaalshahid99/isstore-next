export const CATEGORIES = ["Footwear", "Audio", "Watches", "Fragrance", "Bags"] as const;
export type Category = (typeof CATEGORIES)[number];

export const IMAGE_KEYS = ["sneaker", "headphones", "watch", "perfume", "backpack", "speaker"] as const;
export type ImageKey = (typeof IMAGE_KEYS)[number];

export interface Product {
  id: number;
  name: string;
  category: Category;
  price: number;
  stock: number;
  image: ImageKey;
  description: string;
}

export type ProductInput = Omit<Product, "id">;

export type PaymentStatus = "Paid" | "Pending" | "Refunded";
export type FulfillmentStatus = "Unfulfilled" | "Shipped" | "Fulfilled";
/** What a single status pill shows: the payment state unless it is paid, then the fulfilment state. */
export type OrderStatus = Exclude<PaymentStatus, "Paid"> | FulfillmentStatus;

export interface OrderLine {
  name: string;
  image: ImageKey;
  price: number;
  qty: number;
}

/** Dates are ISO strings so the order list survives a round trip through localStorage. */
export interface Order {
  id: string;
  num: number;
  customer: string;
  email: string;
  street: string;
  city: string;
  placedAt: string;
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
  items: number;
  payment: PaymentStatus;
  fulfillment: FulfillmentStatus;
  paidAt: string | null;
  shippedAt: string | null;
  fulfilledAt: string | null;
  refundedAt: string | null;
}

export type CustomerTag = "VIP" | "Returning" | "New";

export interface Customer {
  name: string;
  email: string;
  location: string;
  orders: Order[];
  count: number;
  spent: number;
  tag: CustomerTag;
}

export type RangeKey = "7D" | "30D" | "90D";
export type Theme = "dark" | "light";
export type SortDir = 1 | -1;

export interface Profile {
  name: string;
  email: string;
  avatar: string | null;
}

export interface StoreSettings {
  name: string;
  currency: "USD" | "AED" | "GBP" | "PKR";
  timezone: string;
}

export interface NotificationPrefs {
  newOrders: boolean;
  lowStock: boolean;
  weeklyReport: boolean;
  marketing: boolean;
}

export interface Session {
  id: string;
  device: string;
  detail: string;
  kind: "desktop" | "phone";
  current?: boolean;
}

export interface LocalUser {
  name: string;
  email: string;
  password: string;
}
