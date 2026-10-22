"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { cx } from "@/lib/cx";
import { NAV, normalizePath } from "@/lib/nav";
import { selectUnfulfilled, useDataStore } from "@/store/data";
import { useUI } from "@/store/ui";

/** Sticky on desktop (collapsible to icons), an off-canvas drawer below 900px. */
export function Sidebar() {
  const path = normalizePath(usePathname());
  const collapsed = useDataStore((s) => s.sidebarCollapsed);
  const toggle = useDataStore((s) => s.toggleSidebar);
  const unfulfilled = useDataStore(selectUnfulfilled);
  const storeName = useDataStore((s) => s.store.name);
  const mobileOpen = useUI((s) => s.mobileNav);
  const setMobile = useUI((s) => s.setMobileNav);

  return (
    <>
      <aside className={cx("x-side", collapsed && "collapsed", mobileOpen && "open")} aria-label="Main navigation">
        <div className="x-logo">
          <LogoMark />
          <span className="x-lbl">{storeName}</span>
        </div>
        <nav className="x-nav">
          {NAV.map(({ href, label, icon: Icon, badge }) => {
            const on = path === href;
            return (
              <Link key={href} href={href} className={cx("x-navi", on && "on")} aria-current={on ? "page" : undefined} title={label} onClick={() => setMobile(false)}>
                <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                <span className="x-lbl">{label}</span>
                {badge && unfulfilled > 0 && (
                  <span className="x-badge x-num" title={`${unfulfilled} unfulfilled`}>
                    {unfulfilled}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="x-sidefoot">
          <div className="x-plan">
            <b>ISStore Pro</b>
            <span className="x-muted">Flagship store · 3 staff</span>
          </div>
          <div className="x-nav">
            <button type="button" className="x-navi x-collapse" onClick={toggle} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
              <PanelLeftClose size={18} strokeWidth={1.75} aria-hidden="true" />
              <span className="x-lbl">Collapse</span>
            </button>
          </div>
        </div>
      </aside>
      <div className={cx("x-shade", mobileOpen && "open")} onClick={() => setMobile(false)} aria-hidden="true" />
    </>
  );
}
