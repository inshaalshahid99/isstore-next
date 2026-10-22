"use client";

import { useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/Toaster";
import { useAuthStore } from "@/store/auth";
import { useDataStore } from "@/store/data";
import { useUI } from "@/store/ui";

/**
 * Client root: restores persisted state after mount (so the static HTML and the first
 * client render agree), applies the theme and hosts the toast stack and author ribbon.
 */
export function AppRoot({ children }: { children: ReactNode }) {
  const theme = useDataStore((s) => s.theme);

  useEffect(() => {
    Promise.all([useDataStore.persist.rehydrate(), useAuthStore.persist.rehydrate()]).then(() =>
      useUI.getState().setHydrated(),
    );
  }, []);

  return (
    <div className="x-root" data-mode={theme}>
      {children}
      <Toaster />
      <a className="x-ribbon" href="https://inshaalshahid.com/work/isstore/" target="_blank" rel="noopener">
        <i />
        <span>Built with Next.js + TypeScript ·&nbsp;</span>designed &amp; developed by <b>Inshaal Shahid</b>
      </a>
    </div>
  );
}

/** Placeholder while persisted state loads or a redirect is pending. */
export function BootScreen() {
  return (
    <div className="x-boot" aria-busy="true" aria-label="Loading ISStore">
      <span className="x-mark" aria-hidden="true">IS</span>
    </div>
  );
}
