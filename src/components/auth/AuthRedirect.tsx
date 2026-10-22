"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useUI } from "@/store/ui";

/** Signed-in users have no business on the auth screens. */
export function AuthRedirect() {
  const router = useRouter();
  const hydrated = useUI((s) => s.hydrated);
  const signedIn = useAuthStore((s) => !!s.session);
  useEffect(() => {
    if (hydrated && signedIn) router.replace("/dashboard");
  }, [hydrated, signedIn, router]);
  return null;
}
