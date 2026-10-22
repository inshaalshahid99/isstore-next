"use client";

import { useMemo, useState } from "react";
import { Download, Search, Truck } from "lucide-react";
import { Initials } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Pagination, paginate } from "@/components/ui/Pagination";
import { PageHead, Panel } from "@/components/ui/Panel";
import { EmptyRow, SortTh, Table } from "@/components/ui/Table";
import { cx } from "@/lib/cx";
import { downloadCsv, ordersToCsv } from "@/lib/csv";
import { fmtDate, fmtTime, money, plural } from "@/lib/format";
import type { Order, SortDir } from "@/lib/types";
import { useDataStore } from "@/store/data";
import { toast, useUI } from "@/store/ui";

const TABS = [
  { id: "all", label: "All", test: () => true },
  { id: "pending", label: "Pending", test: (o: Order) => o.payment === "Pending" },
  { id: "shipped", label: "Shipped", test: (o: Order) => o.fulfillment === "Shipped" },
  { id: "fulfilled", label: "Fulfilled", test: (o: Order) => o.fulfillment === "Fulfilled" },
  { id: "refunded", label: "Refunded", test: (o: Order) => o.payment === "Refunded" },
] as const;
type TabId = (typeof TABS)[number]["id"];

type SortKey = "id" | "customer" | "date" | "items" | "payment" | "fulfillment" | "total";
const SORT_VALUE: Record<SortKey, (o: Order) => string | number> = {
  id: (o) => o.num,
  customer: (o) => o.customer,
  date: (o) => o.placedAt,
  items: (o) => o.items,
  payment: (o) => o.payment,
  fulfillment: (o) => o.fulfillment,
  total: (o) => o.total,
};
const TEXT_KEYS: SortKey[] = ["customer", "payment", "fulfillment"];
const PER_PAGE = 10;

const matches = (o: Order, q: string) =>
  `${o.id} ${o.customer} ${o.email} ${o.city} ${o.lines.map((l) => l.name).join(" ")}`.toLowerCase().includes(q);

export function OrdersView() {
  const orders = useDataStore((s) => s.orders);
  const shipOrders = useDataStore((s) => s.shipOrders);
  const openDrawer = useUI((s) => s.openDrawer);
  const flash = useUI((s) => s.flash);
  const flashIds = useUI((s) => s.flashIds);

  const [tab, setTab] = useState<TabId>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "date", dir: -1 });
  const [pageWanted, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^#/, "");
    return q ? orders.filter((o) => matches(o, q)) : orders;
  }, [orders, query]);

  const list = useMemo(() => {
    const test = TABS.find((t) => t.id === tab)!.test;
    const value = SORT_VALUE[sort.key];
    return searched.filter(test).sort((a, b) => {
      const x = value(a);
      const y = value(b);
      const c = typeof x === "string" ? x.localeCompare(y as string) : x - (y as number);
      return (c || a.num - b.num) * sort.dir;
    });
  }, [searched, tab, sort]);

  const { pages, page, start, rows } = paginate(list, pageWanted, PER_PAGE);
  const onPage = rows.filter((o) => selected.has(o.id)).length;
  const waiting = orders.filter((o) => o.fulfillment === "Unfulfilled" && o.payment === "Paid").length;

  const resetPage = () => setPage(1);
  const toggle = (id: string, on: boolean) =>
    setSelected((s) => {
      const next = new Set(s);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  const onSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: (-s.dir) as SortDir } : { key, dir: TEXT_KEYS.includes(key) ? 1 : -1 }));

  const shipSelected = () => {
    const ids = [...selected];
    const { shipped, skipped } = shipOrders(ids);
    setSelected(new Set());
    flashIds(ids);
    toast(
      shipped
        ? `${plural(shipped, "order")} marked as shipped${skipped ? ` · ${skipped} skipped (already shipped or refunded)` : ""}`
        : "Nothing to ship: selected orders are already shipped or refunded",
      { icon: shipped ? "truck" : "alert" },
    );
  };

  const exportCsv = () => {
    const picked = selected.size ? orders.filter((o) => selected.has(o.id)) : list;
    if (!picked.length) {
      toast("No orders to export", { icon: "alert" });
      return;
    }
    const suffix = selected.size ? "-selected" : tab !== "all" ? `-${tab}` : "";
    downloadCsv(`isstore-orders-oct-2026${suffix}.csv`, ordersToCsv(picked));
    toast(`Exported ${plural(picked.length, "order")} to CSV`, { icon: "download" });
  };

  return (
    <section className="x-wrap x-view">
      <PageHead title="Orders" sub={`October 2026 · ${plural(orders.length, "order")} · ${waiting} paid and waiting to ship`}>
        <Button icon={<Download size={18} strokeWidth={1.75} />} onClick={exportCsv}>
          {selected.size ? `Export ${selected.size} to CSV` : "Export CSV"}
        </Button>
      </PageHead>

      <Panel>
        <div className="x-tabs" role="tablist" aria-label="Filter orders by status">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              className={cx(t.id === tab && "on")}
              aria-selected={t.id === tab}
              onClick={() => {
                setTab(t.id);
                resetPage();
              }}
            >
              {t.label}
              <span className="c x-num">{searched.filter(t.test).length}</span>
            </button>
          ))}
        </div>

        <div className="x-tool">
          <label className="x-find">
            <Search size={16} strokeWidth={1.75} aria-hidden="true" />
            <Input
              type="search"
              placeholder="Search by order, customer or product"
              aria-label="Search orders"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                resetPage();
              }}
            />
          </label>
          {selected.size > 0 && (
            <div className="x-bulk">
              <span>{selected.size} selected</span>
              <Button variant="primary" icon={<Truck size={16} strokeWidth={1.75} />} onClick={shipSelected}>
                Mark as shipped
              </Button>
              <Button onClick={() => setSelected(new Set())}>Clear</Button>
            </div>
          )}
        </div>

        <Table className="x-otable">
          <thead>
            <tr>
              <th className="c-cb">
                <label className="x-cb">
                  <input
                    type="checkbox"
                    aria-label="Select all orders on this page"
                    checked={rows.length > 0 && onPage === rows.length}
                    ref={(el) => {
                      if (el) el.indeterminate = onPage > 0 && onPage < rows.length;
                    }}
                    onChange={(e) => rows.forEach((o) => toggle(o.id, e.target.checked))}
                  />
                </label>
              </th>
              <SortTh sortKey="id" current={sort.key} dir={sort.dir} onSort={onSort}>Order</SortTh>
              <SortTh sortKey="customer" current={sort.key} dir={sort.dir} onSort={onSort}>Customer</SortTh>
              <SortTh sortKey="date" current={sort.key} dir={sort.dir} onSort={onSort}>Date</SortTh>
              <SortTh sortKey="items" current={sort.key} dir={sort.dir} onSort={onSort}>Items</SortTh>
              <SortTh sortKey="payment" current={sort.key} dir={sort.dir} onSort={onSort}>Payment</SortTh>
              <SortTh sortKey="fulfillment" current={sort.key} dir={sort.dir} onSort={onSort}>Fulfillment</SortTh>
              <SortTh sortKey="total" current={sort.key} dir={sort.dir} onSort={onSort} className="r">Total</SortTh>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((o) => {
                const sel = selected.has(o.id);
                const open = () => openDrawer({ type: "order", id: o.id });
                return (
                  <tr
                    key={o.id}
                    tabIndex={0}
                    className={cx(sel && "sel", flash.includes(o.id) && "flash")}
                    aria-label={`Order #${o.id}, ${o.customer}, open details`}
                    onClick={(e) => !(e.target as HTMLElement).closest(".x-cb") && open()}
                    onKeyDown={(e) => e.target === e.currentTarget && (e.key === "Enter" || e.key === " ") && (e.preventDefault(), open())}
                  >
                    <td className="c-cb">
                      <label className="x-cb">
                        <input type="checkbox" checked={sel} aria-label={`Select order #${o.id}`} onChange={(e) => toggle(o.id, e.target.checked)} />
                      </label>
                    </td>
                    <td className="c-id">
                      <span className="x-oid">#{o.id}</span>
                    </td>
                    <td className="c-cus">
                      <span className="x-cust">
                        <Initials name={o.customer} />
                        <span>
                          {o.customer}
                          <small>{o.city.split(",")[0]}</small>
                        </span>
                      </span>
                    </td>
                    <td className="c-date">
                      {fmtDate(o.placedAt)}
                      <small>{fmtTime(o.placedAt)}</small>
                    </td>
                    <td className="c-items x-num">{plural(o.items, "item")}</td>
                    <td className="c-pay">
                      <StatusBadge status={o.payment} />
                    </td>
                    <td className="c-ful">
                      <StatusBadge status={o.fulfillment} />
                    </td>
                    <td className="c-tot r x-num">{money(o.total, 2)}</td>
                  </tr>
                );
              })
            ) : (
              <EmptyRow colSpan={8}>
                No orders match{query ? ` “${query}”` : ""}
                {tab !== "all" ? ` in ${tab}` : ""}.
              </EmptyRow>
            )}
          </tbody>
        </Table>
        <Pagination page={page} pages={pages} start={start} shown={rows.length} total={list.length} onPage={setPage} />
      </Panel>
    </section>
  );
}
