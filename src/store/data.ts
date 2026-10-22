"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  DEFAULT_NOTIFICATIONS,
  DEFAULT_PROFILE,
  DEFAULT_SESSIONS,
  DEFAULT_STORE,
  SEED_PRODUCTS,
  seedOrders,
} from "@/lib/data";
import { DEMO_NOW } from "@/lib/format";
import type {
  NotificationPrefs,
  Order,
  Product,
  ProductInput,
  Profile,
  Session,
  StoreSettings,
  Theme,
} from "@/lib/types";

/**
 * Everything the store owner can change: catalog, orders, customer notes and settings.
 * Persisted to localStorage so edits survive a refresh.
 */
interface DataState {
  products: Product[];
  nextProductId: number;
  orders: Order[];
  notes: Record<string, string>;
  profile: Profile;
  store: StoreSettings;
  notifications: NotificationPrefs;
  twoFactor: boolean;
  sessions: Session[];
  readNotes: string[];
  theme: Theme;
  sidebarCollapsed: boolean;
  /** Bumped by resetDemo so forms that copied store values can re-mount. */
  version: number;

  saveProduct: (input: ProductInput, id?: number) => Product;
  deleteProduct: (id: number) => void;
  shipOrders: (ids: string[]) => { shipped: number; skipped: number };
  fulfilOrder: (id: string) => void;
  refundOrder: (id: string) => void;
  setNote: (customer: string, text: string) => void;
  updateProfile: (profile: Partial<Profile>) => void;
  updateStore: (store: StoreSettings) => void;
  updateNotifications: (prefs: NotificationPrefs) => void;
  setTwoFactor: (on: boolean) => void;
  endSession: (id: string) => void;
  markRead: (ids: string[]) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  resetDemo: () => void;
}

const nowIso = (offsetMs = 0) => new Date(DEMO_NOW.getTime() + offsetMs).toISOString();

const seed = () => ({
  products: SEED_PRODUCTS.map((p) => ({ ...p })),
  nextProductId: SEED_PRODUCTS.length + 1,
  orders: seedOrders(),
  notes: {},
  profile: { ...DEFAULT_PROFILE },
  store: { ...DEFAULT_STORE },
  notifications: { ...DEFAULT_NOTIFICATIONS },
  twoFactor: false,
  sessions: DEFAULT_SESSIONS.map((s) => ({ ...s })),
  readNotes: [] as string[],
});

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      ...seed(),
      theme: "dark",
      sidebarCollapsed: false,
      version: 0,

      saveProduct: (input, id) => {
        if (id !== undefined) {
          const updated = { ...input, id };
          set((s) => ({ products: s.products.map((p) => (p.id === id ? updated : p)) }));
          return updated;
        }
        const created = { ...input, id: get().nextProductId };
        set((s) => ({ products: [created, ...s.products], nextProductId: s.nextProductId + 1 }));
        return created;
      },

      deleteProduct: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

      shipOrders: (ids) => {
        let shipped = 0;
        let skipped = 0;
        const wanted = new Set(ids);
        const orders = get().orders.map((o) => {
          if (!wanted.has(o.id)) return o;
          if (o.payment === "Refunded" || o.fulfillment !== "Unfulfilled") {
            skipped++;
            return o;
          }
          shipped++;
          return { ...o, fulfillment: "Shipped" as const, shippedAt: nowIso() };
        });
        set({ orders });
        return { shipped, skipped };
      },

      fulfilOrder: (id) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id
              ? { ...o, fulfillment: "Fulfilled", shippedAt: o.shippedAt ?? nowIso(), fulfilledAt: nowIso(60000) }
              : o,
          ),
        })),

      refundOrder: (id) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id
              ? {
                  ...o,
                  payment: "Refunded",
                  refundedAt: nowIso(),
                  shippedAt: o.fulfillment === "Unfulfilled" ? null : o.shippedAt,
                }
              : o,
          ),
        })),

      setNote: (customer, text) => set((s) => ({ notes: { ...s.notes, [customer]: text } })),
      updateProfile: (profile) => set((s) => ({ profile: { ...s.profile, ...profile } })),
      updateStore: (store) => set({ store }),
      updateNotifications: (notifications) => set({ notifications }),
      setTwoFactor: (twoFactor) => set({ twoFactor }),
      endSession: (id) => set((s) => ({ sessions: s.sessions.filter((x) => x.id !== id) })),
      markRead: (ids) => set((s) => ({ readNotes: [...new Set([...s.readNotes, ...ids])] })),
      toggleTheme: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      resetDemo: () => set((s) => ({ ...seed(), profile: { ...DEFAULT_PROFILE, email: s.profile.email }, version: s.version + 1 })),
    }),
    {
      name: "isstore-data-v1",
      storage: createJSONStorage(() => localStorage),
      // Rehydrated by <StoreHydrator /> after mount, so server HTML and first client render match.
      skipHydration: true,
    },
  ),
);

/** Paid or pending orders that have not shipped yet: the number on the Orders badge. */
export const selectUnfulfilled = (s: DataState) =>
  s.orders.filter((o) => o.fulfillment === "Unfulfilled" && o.payment !== "Refunded").length;
