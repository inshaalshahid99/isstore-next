"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEMO_EMAIL, DEMO_NAME, DEMO_PASSWORD } from "@/lib/data";
import type { LocalUser } from "@/lib/types";

/**
 * Client-side demo auth. There is no server: accounts live in localStorage,
 * and one-time codes are generated in the browser and shown in a toast.
 */
export type OtpContext = "signup" | "code" | "forgot" | "login2fa";

export interface PendingVerification {
  context: OtpContext;
  email: string;
  code: string;
  /** Route to go back to from the verify screen. */
  from: "/login" | "/signup" | "/forgot-password";
  /** Only for sign-up: the account to create once the email is confirmed. */
  account?: LocalUser;
}

interface AuthState {
  users: LocalUser[];
  session: { email: string; name: string } | null;
  pending: PendingVerification | null;
  /** Email whose reset code was confirmed; unlocks /reset-password. */
  resetEmail: string | null;

  findUser: (email: string) => LocalUser | undefined;
  checkPassword: (email: string, password: string) => boolean;
  signIn: (email: string, name?: string) => void;
  signOut: () => void;
  startVerification: (p: Omit<PendingVerification, "code">) => string;
  resendCode: () => string;
  clearPending: () => void;
  createAccount: (user: LocalUser) => void;
  setResetEmail: (email: string | null) => void;
  setPassword: (email: string, password: string) => void;
  resetDemoAccount: () => void;
}

const DEMO_USER: LocalUser = { name: DEMO_NAME, email: DEMO_EMAIL, password: DEMO_PASSWORD };
const newCode = () => String(Math.floor(Math.random() * 1e6)).padStart(6, "0");
const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [DEMO_USER],
      session: null,
      pending: null,
      resetEmail: null,

      findUser: (email) => get().users.find((u) => same(u.email, email)),
      checkPassword: (email, password) => get().findUser(email)?.password === password,
      signIn: (email, name) =>
        set({ session: { email, name: name ?? get().findUser(email)?.name ?? DEMO_NAME }, pending: null }),
      signOut: () => set({ session: null }),

      startVerification: (p) => {
        const code = newCode();
        set({ pending: { ...p, code } });
        return code;
      },
      resendCode: () => {
        const code = newCode();
        set((s) => ({ pending: s.pending ? { ...s.pending, code } : null }));
        return code;
      },
      clearPending: () => set({ pending: null }),

      createAccount: (user) => set((s) => ({ users: [...s.users.filter((u) => !same(u.email, user.email)), user] })),
      setResetEmail: (resetEmail) => set({ resetEmail }),
      setPassword: (email, password) =>
        set((s) => ({ users: s.users.map((u) => (same(u.email, email) ? { ...u, password } : u)) })),
      resetDemoAccount: () =>
        set((s) => ({ users: [DEMO_USER, ...s.users.filter((u) => !same(u.email, DEMO_EMAIL))] })),
    }),
    {
      name: "isstore-auth-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
