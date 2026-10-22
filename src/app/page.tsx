"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BootScreen } from "@/components/providers/AppRoot";
import { useAuthStore } from "@/store/auth";
import { useUI } from "@/store/ui";

/** "/" sends signed-in users to the dashboard and everyone else to sign in. */
export default function Home() {
  const router = useRouter();
  const hydrated = useUI((s) => s.hydrated);
  const signedIn = useAuthStore((s) => !!s.session);

  useEffect(() => {
    if (hydrated) router.replace(signedIn ? "/dashboard" : "/login");
  }, [hydrated, signedIn, router]);

  return <BootScreen />;
}
