"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChartColumn, CreditCard, ShoppingBag, Users } from "lucide-react";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { StatusBadge } from "@/components/ui/Badge";
import { KpiCard } from "@/components/ui/KpiCard";
import { Panel, PanelHead } from "@/components/ui/Panel";
import { ProductImage } from "@/components/ui/ProductImage";
import { Segmented } from "@/components/ui/Segmented";
import { Table } from "@/components/ui/Table";
import { RANGE_KEYS, RANGES, TOP_PRODUCTS, rangeLabels, series } from "@/lib/data";
import { ago, greeting, int, money, statusOf } from "@/lib/format";
import type { RangeKey } from "@/lib/types";
import { useDataStore } from "@/store/data";
import { useUI } from "@/store/ui";

const ICON = { size: 16, strokeWidth: 1.75 };

export function OverviewView() {
  const [range, setRange] = useState<RangeKey>("30D");
  const [now] = useState(() => new Date());
  const name = useDataStore((s) => s.profile.name);
  const orders = useDataStore((s) => s.orders);
  const openDrawer = useUI((s) => s.openDrawer);
  const cfg = RANGES[range];

  const kpis = [
    { label: "Revenue", value: cfg.revenue, delta: cfg.revenueDelta, format: (v: number) => money(v), icon: <CreditCard {...ICON} /> },
    { label: "Orders", value: cfg.orders, delta: cfg.ordersDelta, format: int, icon: <ShoppingBag {...ICON} /> },
    { label: "Customers", value: cfg.customers, delta: cfg.customersDelta, format: int, icon: <Users {...ICON} /> },
    { label: "Avg order", value: cfg.aov, delta: cfg.aovDelta, format: (v: number) => money(v, 2), icon: <ChartColumn {...ICON} /> },
  ];

  const chart = useMemo(() => {
    const seed = cfg.points * 31 + 7;
    const current = series(cfg.points, cfg.revenue, seed, 0.7);
    const previous = series(cfg.points, cfg.revenue / (1 + cfg.revenueDelta / 100), seed + 99, 0.3);
    return rangeLabels(cfg, now).map((label, i) => ({ label, current: current[i], previous: previous[i] }));
  }, [cfg, now]);

  const top = useMemo(() => {
    const rows = TOP_PRODUCTS.map((p) => {
      const units = Math.round(p.units * cfg.factor);
      return { ...p, units, revenue: units * p.price };
    }).sort((a, b) => b.revenue - a.revenue);
    return { rows, max: rows[0].revenue };
  }, [cfg]);

  const recent = useMemo(() => [...orders].sort((a, b) => b.placedAt.localeCompare(a.placedAt)).slice(0, 5), [orders]);

  return (
    <section className="x-wrap x-view">
      <div className="x-hello">
        <div>
          <h1>
            {greeting(now)}, {name.split(" ")[0]}
          </h1>
          <p>Here&apos;s how your store is doing.</p>
        </div>
        <Segmented label="Date range" options={RANGE_KEYS.map((r) => ({ value: r, label: r }))} value={range} onChange={setRange} />
      </div>

      <div className="x-kpis">
        {kpis.map((k, i) => (
          <KpiCard key={k.label} {...k} period={cfg.word} spark={series(12, 100, (i + 3) * 977 + cfg.points, k.delta >= 0 ? 0.9 : -0.35)} />
        ))}
      </div>

      <Panel glow>
        <div className="x-ph">
          <div>
            <h2>Revenue</h2>
            <p className="big x-num">{money(cfg.revenue)}</p>
          </div>
          <div className="x-legend">
            <span>
              <i />
              This period
            </span>
            <span>
              <i className="d" />
              Previous period
            </span>
          </div>
        </div>
        <RevenueChart data={chart} label={`Revenue of ${money(cfg.revenue)} over the last ${cfg.word}, up ${cfg.revenueDelta}% on the previous period`} />
      </Panel>

      <div className="x-grid2">
        <Panel>
          <PanelHead title="Recent orders" sub={<p>Latest 5 across all channels</p>}>
            <Link href="/dashboard/orders" className="x-a">
              View all
            </Link>
          </PanelHead>
          <Table className="x-recent">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Status</th>
                <th className="r">Total</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => {
                const open = () => openDrawer({ type: "order", id: o.id });
                return (
                  <tr
                    key={o.id}
                    data-id={o.id}
                    tabIndex={0}
                    aria-label={`Order #${o.id}, ${o.customer}, open details`}
                    onClick={open}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), open())}
                  >
                    <td>
                      <span className="x-oid">#{o.id}</span>
                      <small>{ago(o.placedAt)}</small>
                    </td>
                    <td>
                      {o.customer}
                      <small>
                        {o.lines[0].name}
                        {o.lines.length > 1 ? ` +${o.lines.length - 1}` : ""}
                      </small>
                    </td>
                    <td>
                      <StatusBadge status={statusOf(o)} />
                    </td>
                    <td className="r x-num">{money(o.total, 2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Panel>

        <Panel>
          <PanelHead title="Top products" sub={<p>By revenue, last {cfg.word}</p>}>
            <Link href="/dashboard/products" className="x-a">
              View all
            </Link>
          </PanelHead>
          <ul className="x-prods">
            {top.rows.map((p) => (
              <li key={p.name}>
                <ProductImage image={p.image} alt={p.name} size={96} />
                <div>
                  <p className="n">{p.name}</p>
                  <p className="m x-num">
                    {int(p.units)} sold · {money(p.revenue)}
                  </p>
                  <div className="x-bar">
                    <i style={{ width: `${((p.revenue / top.max) * 100).toFixed(1)}%` }} />
                  </div>
                </div>
                <p className="p x-num">
                  {money(p.price)}
                  <small>price</small>
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </section>
  );
}
