"use client";

import { useId } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { kilo } from "@/lib/format";
import { svgId, TICK } from "./chartUtils";

export interface MonthPoint {
  month: string;
  value: number;
  change: number | null;
  previousMonth: string | null;
}

/** Monthly revenue in $k; the latest month is highlighted in lime. */
export function MonthlyBars({ data, label }: { data: MonthPoint[]; label: string }) {
  const id = svgId(useId());
  return (
    <div className="x-chart" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 900, height: 286 }}>
        <BarChart data={data} margin={{ top: 14, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`${id}-bar`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--vi2)" />
              <stop offset="1" stopColor="var(--vi)" stopOpacity={0.55} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--bd)" strokeDasharray="2 4" />
          <XAxis dataKey="month" tick={TICK} tickLine={false} axisLine={false} tickMargin={10} />
          <YAxis tick={TICK} tickFormatter={(v: number) => `$${+v.toFixed(1)}k`} tickLine={false} axisLine={false} width={56} tickCount={5} />
          <Tooltip
            cursor={false}
            isAnimationActive={false}
            content={({ active, payload }) => {
              const p = payload?.[0]?.payload as MonthPoint | undefined;
              if (!active || !p) return null;
              return (
                <div className="x-tip on">
                  <span>{p.month} 2026</span>
                  <b className="x-num">{kilo(p.value)}</b>
                  {p.change === null ? (
                    <span>First month</span>
                  ) : (
                    <span className="x-num">
                      vs {p.previousMonth}{" "}
                      <span style={{ color: p.change >= 0 ? "var(--lit)" : "var(--red)" }}>
                        {p.change >= 0 ? "+" : ""}
                        {p.change.toFixed(1)}%
                      </span>
                    </span>
                  )}
                </div>
              );
            }}
          />
          <Bar dataKey="value" radius={6} maxBarSize={44} animationDuration={700}>
            {data.map((d, i) => (
              <Cell key={d.month} fill={i === data.length - 1 ? "var(--li)" : `url(#${id}-bar)`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
