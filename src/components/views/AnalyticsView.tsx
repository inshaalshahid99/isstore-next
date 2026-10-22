"use client";

import { useMemo, useState } from "react";
import { CategoryDonut } from "@/components/charts/CategoryDonut";
import { MonthlyBars } from "@/components/charts/MonthlyBars";
import { PageHead, Panel, PanelHead } from "@/components/ui/Panel";
import { Segmented } from "@/components/ui/Segmented";
import { ANALYTICS, RANGE_KEYS, RANGES } from "@/lib/data";
import { int, kilo, money } from "@/lib/format";
import type { RangeKey } from "@/lib/types";

export function AnalyticsView() {
  const [range, setRange] = useState<RangeKey>("30D");
  const cfg = RANGES[range];
  const f = cfg.factor;
  const visitors = ANALYTICS.funnel[0][1];

  const months = useMemo(
    () =>
      ANALYTICS.months.map(([month, v], i, all) => ({
        month,
        value: v * f,
        change: i ? (v / all[i - 1][1] - 1) * 100 : null,
        previousMonth: i ? all[i - 1][0] : null,
      })),
    [f],
  );
  const total = ANALYTICS.months.reduce((a, [, v]) => a + v, 0) * f;

  return (
    <section className="x-wrap x-view">
      <PageHead title="Analytics" sub={`Last ${cfg.word} · Jan to Oct 2026`}>
        <Segmented label="Analytics date range" options={RANGE_KEYS.map((r) => ({ value: r, label: r }))} value={range} onChange={setRange} />
      </PageHead>

      <div className="x-ag">
        <Panel glow className="wide">
          <PanelHead
            title="Monthly revenue"
            sub={
              <>
                <p>Jan to Oct 2026</p>
                <p className="big x-num">{kilo(total)} total</p>
              </>
            }
          />
          <MonthlyBars data={months} label={`Monthly revenue rose from ${kilo(months[0].value)} in January to ${kilo(months[months.length - 1].value)} in October 2026`} />
        </Panel>

        <Panel>
          <PanelHead title="Conversion funnel" sub={<p>% of previous step</p>} />
          <ul className="x-alist">
            {ANALYTICS.funnel.map(([step, n], i, all) => (
              <li key={step}>
                <div className="r">
                  <b>{step}</b>
                  <span className="x-num">
                    <b style={{ color: "var(--tx)" }}>{int(n * f)}</b> · {i ? `${((n / all[i - 1][1]) * 100).toFixed(1)}% of previous` : "100%"}
                  </span>
                </div>
                <div className="x-bar">
                  <i style={{ width: `${Math.max(2, (n / visitors) * 100)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <PanelHead title="Sales by category" sub={<p>Share of revenue</p>} />
          <CategoryDonut slices={ANALYTICS.categories} total={cfg.revenue} />
        </Panel>

        <Panel>
          <PanelHead title="Traffic sources" sub={<p>Share of visitors</p>} />
          <ul className="x-alist">
            {ANALYTICS.traffic.map(([source, share]) => (
              <li key={source}>
                <div className="r">
                  <b>{source}</b>
                  <span className="x-num">
                    {int((visitors * f * share) / 100)} visitors · <b style={{ color: "var(--tx)" }}>{share}%</b>
                  </span>
                </div>
                <div className="x-bar t">
                  <i style={{ width: `${share}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <PanelHead title="Top countries" sub={<p>By revenue</p>} />
          <ol className="x-ctry">
            {ANALYTICS.countries.map(([country, revenue], i) => (
              <li key={country}>
                <span className="k x-num">{String(i + 1).padStart(2, "0")}</span>
                <span>{country}</span>
                <span className="p x-num">{money(revenue * f)}</span>
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </section>
  );
}
