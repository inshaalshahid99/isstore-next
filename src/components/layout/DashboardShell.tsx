"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CommandPalette } from "@/components/dashboard/CommandPalette";
import { ConfirmHost } from "@/components/dashboard/ConfirmHost";
import { CustomerDrawer } from "@/components/dashboard/CustomerDrawer";
import { OrderDrawer } from "@/components/dashboard/OrderDrawer";
import { ProductFormDrawer } from "@/components/dashboard/ProductFormDrawer";
import { BootScreen } from "@/components/providers/AppRoot";
import { useAuthStore } from "@/store/auth";
import { useUI } from "@/store/ui";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

/**
 * App frame for every /dashboard route: client-side auth guard, sidebar, top bar,
 * and the drawers / dialogs that any page can open through the UI store.
 */
export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const hydrated = useUI((s) => s.hydrated);
  const signedIn = useAuthStore((s) => !!s.session);

  useEffect(() => {
    if (hydrated && !signedIn) router.replace("/login");
  }, [hydrated, signedIn, router]);

  // Close the mobile menu and any drawer when the route changes.
  useEffect(() => {
    useUI.setState({ mobileNav: false });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [path]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && useUI.getState().setMobileNav(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (!hydrated || !signedIn) return <BootScreen />;

  return (
    <div className="x-app">
      <Sidebar />
      <div className="x-main">
        <Topbar />
        <main className="x-content" id="content">
          {children}
        </main>
      </div>
      <OrderDrawer />
      <CustomerDrawer />
      <ProductFormDrawer />
      <ConfirmHost />
      <CommandPalette />
    </div>
  );
}
