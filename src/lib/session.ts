"use client";

import { DEMO_NAME } from "./data";
import { useAuthStore } from "@/store/auth";
import { useDataStore } from "@/store/data";

/** Signs a user in and points the profile at their account. */
export function startSession(email: string, name?: string) {
  const auth = useAuthStore.getState();
  const data = useDataStore.getState();
  const sameAccount = data.profile.email.toLowerCase() === email.toLowerCase();
  const displayName = name ?? (sameAccount ? data.profile.name : auth.findUser(email)?.name ?? DEMO_NAME);
  auth.signIn(email, displayName);
  data.updateProfile({ email, name: displayName, ...(sameAccount ? {} : { avatar: null }) });
}
