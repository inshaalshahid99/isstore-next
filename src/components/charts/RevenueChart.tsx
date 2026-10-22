"use client";

import { useId } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { money } from "@/lib/format";
import { axisMoney, svgId, TICK } from "./chartUtils";

export interface RevenuePoint {
  label: string;
  current: number;
  previous: number;
}

/** This period (glowing violet area) against the previous period (dashed line). */
export function RevenueChart({ data, label }: { data: RevenuePoint[]; label: string }) {
  const id = svgId(useId());
  return (
    <div className="x-chart" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 600, height: 276 }}>
        <AreaChart data={data} margin={{ top: 14, right: 14, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--vi)" stopOpacity={0.38} />
              <stop offset="1" stopColor="var(--vi)" stopOpacity={0} />
            </linearGradient>
            <filter id={`${id}-glow`} x="-10%" y="-30%" width="120%" height="160%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--bd)" strokeDasharray="2 4" />
          <XAxis dataKey="label" tick={TICK} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={28} tickMargin={10} />
          <YAxis tick={TICK} tickFormatter={axisMoney} tickLine={false} axisLine={false} width={56} tickCount={5} />
          <Tooltip
            cursor={{ stroke: "var(--bd2)" }}
            isAnimationActive={false}
            content={({ active, payload }) => {
              const point = payload?.[0]?.payload as RevenuePoint | undefined;
              if (!active || !point) return null;
              const delta = (point.current / point.previous - 1) * 100;
              return (
                <div className="x-tip on">
                  <span>{point.label}</span>
                  <b className="x-num">{money(point.current)}</b>
                  <span className="x-num">
                    Prev {money(point.previous)} ·{" "}
                    <span style={{ color: delta >= 0 ? "var(--lit)" : "var(--red)" }}>
                      {delta >= 0 ? "+" : ""}
                      {delta.toFixed(1)}%
                    </span>
                  </span>
                </div>
              );
            }}
          />
          <Area type="monotone" dataKey="previous" stroke="var(--tx2)" strokeOpacity={0.6} strokeWidth={1.4} strokeDasharray="4 5" fill="none" dot={false} activeDot={{ r: 4, fill: "var(--panel)", stroke: "var(--tx2)", strokeWidth: 1.5 }} />
          <Area type="monotone" dataKey="current" stroke="var(--vi)" strokeWidth={5} strokeOpacity={0.45} fill={`url(#${id}-fill)`} filter={`url(#${id}-glow)`} dot={false} activeDot={false} tooltipType="none" />
          <Area type="monotone" dataKey="current" stroke="var(--vi2)" strokeWidth={2} strokeLinecap="round" fill="none" dot={false} activeDot={{ r: 5, fill: "var(--li)", stroke: "var(--panel)", strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
