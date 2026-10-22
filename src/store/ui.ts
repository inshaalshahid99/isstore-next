"use client";

import { create } from "zustand";
import type { Category } from "@/lib/types";

/** Transient UI state: toasts, the open drawer, dialogs and the command palette. Never persisted. */
export type ToastIcon = "check" | "alert" | "mail" | "truck" | "download" | "undo" | "trash" | "plus" | "user" | "bell" | "lock" | "logout";

export interface Toast {
  id: number;
  message: string;
  code?: string;
  icon: ToastIcon;
  leaving?: boolean;
}

export type DrawerState =
  | { type: "order"; id: string }
  | { type: "customer"; name: string }
  | { type: "product"; id: number | null; nonce: number }
  | null;

export interface ConfirmState {
  title: string;
  body: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
}

export interface ProductFilters {
  q: string;
  category: "All" | Category;
  view: "grid" | "list";
}

interface UIState {
  hydrated: boolean;
  productFilters: ProductFilters;
  toasts: Toast[];
  drawer: DrawerState;
  /** The last drawer that was open, kept while the close animation plays. */
  lastDrawer: Exclude<DrawerState, null> | null;
  confirm: ConfirmState | null;
  paletteOpen: boolean;
  mobileNav: boolean;
  flash: string[];

  setHydrated: () => void;
  setProductFilters: (f: Partial<ProductFilters>) => void;
  openProductForm: (id: number | null) => void;
  toast: (message: string, opts?: { icon?: ToastIcon; code?: string; ms?: number }) => void;
  openDrawer: (d: Exclude<DrawerState, null>) => void;
  closeDrawer: () => void;
  ask: (c: ConfirmState) => void;
  closeConfirm: () => void;
  setPalette: (open: boolean) => void;
  setMobileNav: (open: boolean) => void;
  flashIds: (ids: string[]) => void;
}

let toastSeq = 0;

export const useUI = create<UIState>()((set, get) => ({
  hydrated: false,
  productFilters: { q: "", category: "All", view: "grid" },
  toasts: [],
  drawer: null,
  lastDrawer: null,
  confirm: null,
  paletteOpen: false,
  mobileNav: false,
  flash: [],

  setHydrated: () => set({ hydrated: true }),
  setProductFilters: (f) => set((s) => ({ productFilters: { ...s.productFilters, ...f } })),
  openProductForm: (id) => get().openDrawer({ type: "product", id, nonce: Date.now() }),

  toast: (message, opts = {}) => {
    const id = ++toastSeq;
    const icon = opts.icon ?? (opts.code ? "mail" : "check");
    set((s) => ({ toasts: [...s.toasts, { id, message, code: opts.code, icon }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.map((t) => (t.id === id ? { ...t, leaving: true } : t)) }));
      setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 200);
    }, opts.ms ?? 3200);
  },

  openDrawer: (drawer) => set({ drawer, lastDrawer: drawer, mobileNav: false }),
  closeDrawer: () => set({ drawer: null }),
  ask: (confirm) => set({ confirm }),
  closeConfirm: () => set({ confirm: null }),
  setPalette: (paletteOpen) => set({ paletteOpen }),
  setMobileNav: (mobileNav) => set({ mobileNav }),

  flashIds: (ids) => {
    set({ flash: ids });
    setTimeout(() => {
      if (get().flash === ids) set({ flash: [] });
    }, 1600);
  },
}));

export const toast = (...args: Parameters<UIState["toast"]>) => useUI.getState().toast(...args);
