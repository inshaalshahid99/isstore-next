"use client";

import { usePathname } from "next/navigation";
import { Menu, Search } from "lucide-react";
import { ThemeToggle } from "@/components/providers/ThemeToggle";
import { IconButton } from "@/components/ui/Button";
import { navFor } from "@/lib/nav";
import { useUI } from "@/store/ui";
import { AccountMenu } from "./AccountMenu";
import { Notifications } from "./Notifications";

export function Topbar() {
  const title = navFor(usePathname()).label;
  const setMobile = useUI((s) => s.setMobileNav);
  const setPalette = useUI((s) => s.setPalette);

  return (
    <header className="x-top">
      <IconButton className="x-burger" onClick={() => setMobile(true)} aria-label="Open menu">
        <Menu size={18} strokeWidth={1.75} />
      </IconButton>
      <p className="x-title">{title}</p>
      <label className="x-search">
        <Search size={16} strokeWidth={1.75} aria-hidden="true" />
        <input
          id="global-search"
          className="x-input"
          placeholder="Search orders, products…"
          aria-label="Search (Ctrl K)"
          readOnly
          onFocus={(e) => {
            e.currentTarget.blur();
            setPalette(true);
          }}
        />
        <kbd>⌘K</kbd>
      </label>
      <Notifications />
      <ThemeToggle />
      <AccountMenu />
    </header>
  );
}
