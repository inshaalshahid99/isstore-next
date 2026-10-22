"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag } from "lucide-react";
import { Initials } from "@/components/ui/Avatar";
import { ProductImage } from "@/components/ui/ProductImage";
import { useCustomers } from "@/hooks/useCustomers";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { cx } from "@/lib/cx";
import { stockOf } from "@/lib/data";
import { fmtDate, money, plural, statusOf } from "@/lib/format";
import { NAV } from "@/lib/nav";
import { useAuthStore } from "@/store/auth";
import { useDataStore } from "@/store/data";
import { useUI } from "@/store/ui";

interface Item {
  key: string;
  group: "Pages" | "Products" | "Orders" | "Customers";
  icon: ReactNode;
  title: string;
  sub: string;
  meta?: string;
  run: () => void;
}

/** Ctrl/Cmd + K: jump to any page, product, order or customer. */
export function CommandPalette() {
  const open = useUI((s) => s.paletteOpen);
  const setOpen = useUI((s) => s.setPalette);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (!useAuthStore.getState().session) return;
      const ui = useUI.getState();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (ui.confirm) return;
        ui.setPalette(!ui.paletteOpen);
      } else if (e.key === "/" && !ui.paletteOpen && !ui.drawer && !/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement as HTMLElement | null)?.tagName ?? "")) {
        e.preventDefault();
        ui.setPalette(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;
  return <Palette onClose={() => setOpen(false)} />;
}

function Palette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const products = useDataStore((s) => s.products);
  const orders = useDataStore((s) => s.orders);
  const customers = useCustomers();
  useFocusTrap(ref, true, onClose, "#pal-q");

  const items = useMemo<Item[]>(() => {
    const q = query.trim().toLowerCase().replace(/^#/, "");
    const has = (s: string) => !q || s.toLowerCase().includes(q);
    const limit = q ? 5 : 3;
    const ui = useUI.getState();
    const go = (href: string) => router.push(href);

    const pages: Item[] = NAV.filter((n) => has(n.label)).map(({ href, label, icon: Icon }) => ({
      key: href, group: "Pages", icon: <Icon size={16} strokeWidth={1.75} />, title: label, sub: "Go to page", run: () => go(href),
    }));
    const prods: Item[] = products
      .filter((p) => has(`${p.name} ${p.category}`))
      .slice(0, limit)
      .map((p) => ({
        key: `p${p.id}`, group: "Products", icon: <ProductImage image={p.image} alt="" size={68} />, title: p.name,
        sub: `${p.category} · ${stockOf(p.stock).label}`, meta: money(p.price, 2),
        run: () => {
          go("/dashboard/products");
          ui.openProductForm(p.id);
        },
      }));
    const ords: Item[] = (q ? orders : [...orders].sort((a, b) => b.placedAt.localeCompare(a.placedAt)))
      .filter((o) => has(`${o.id} ${o.customer} ${o.lines.map((l) => l.name).join(" ")}`))
      .slice(0, limit)
      .map((o) => ({
        key: o.id, group: "Orders", icon: <ShoppingBag size={16} strokeWidth={1.75} />, title: `#${o.id} · ${o.customer}`,
        sub: `${fmtDate(o.placedAt)} · ${statusOf(o)}`, meta: money(o.total, 2), run: () => ui.openDrawer({ type: "order", id: o.id }),
      }));
    const custs: Item[] = customers
      .filter((c) => has(`${c.name} ${c.email} ${c.location}`))
      .slice(0, limit)
      .map((c) => ({
        key: `c${c.name}`, group: "Customers", icon: <Initials name={c.name} />, title: c.name,
        sub: `${c.email} · ${c.location}`, meta: plural(c.count, "order"), run: () => ui.openDrawer({ type: "customer", name: c.name }),
      }));
    return [...pages, ...prods, ...ords, ...custs];
  }, [query, products, orders, customers, router]);

  const current = Math.min(active, Math.max(0, items.length - 1));

  const choose = (i: number) => {
    const item = items[i];
    if (!item) return;
    onClose();
    item.run();
  };

  const move = (i: number) => {
    if (!items.length) return;
    const next = (i + items.length) % items.length;
    setActive(next);
    listRef.current?.querySelector(`#pal-${next}`)?.scrollIntoView({ block: "nearest" });
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      move(current + (e.key === "ArrowDown" ? 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(current);
    }
  };

  let lastGroup = "";
  return (
    <div className="x-modal x-palm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} className="x-panel x-pal" role="dialog" aria-modal="true" aria-label="Command palette">
        <label className="x-palq">
          <Search size={18} strokeWidth={1.75} aria-hidden="true" />
          <input
            id="pal-q"
            className="x-input"
            placeholder="Search pages, products, orders, customers…"
            autoComplete="off"
            role="combobox"
            aria-expanded="true"
            aria-controls="pal-list"
            aria-autocomplete="list"
            aria-activedescendant={items.length ? `pal-${current}` : undefined}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKey}
          />
          <kbd>Esc</kbd>
        </label>
        <ul ref={listRef} className="x-pallist" id="pal-list" role="listbox" aria-label="Results">
          {!items.length && <li className="x-palnone">No results for “{query.trim()}”</li>}
          {items.map((item, i) => {
            const header = item.group !== lastGroup;
            lastGroup = item.group;
            return [
              header && (
                <li key={`g-${item.group}`} className="x-palg" role="presentation">
                  {item.group}
                </li>
              ),
              <li
                key={item.key}
                id={`pal-${i}`}
                className={cx("x-pali", i === current && "on")}
                role="option"
                aria-selected={i === current}
                onClick={() => choose(i)}
                onMouseMove={() => i !== current && setActive(i)}
              >
                <span className="ic">{item.icon}</span>
                <div>
                  <b>{item.title}</b>
                  <small>{item.sub}</small>
                </div>
                {item.meta && <span className="k x-num">{item.meta}</span>}
              </li>,
            ];
          })}
        </ul>
        <div className="x-palfoot">↑ ↓ to move · Enter to open · Esc to close</div>
      </div>
    </div>
  );
}
