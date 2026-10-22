"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cx } from "@/lib/cx";

interface KpiCardProps {
  label: string;
  value: number;
  format: (value: number) => string;
  delta: number;
  icon: ReactNode;
  period: string;
  spark: number[];
}

/** Headline number with a count-up, a delta pill and a sparkline. */
export function KpiCard({ label, value, format, delta, icon, period, spark }: KpiCardProps) {
  const shown = useCountUp(value);
  const up = delta >= 0;
  return (
    <div className="x-panel x-kpi">
      <div className="t">
        {label}
        <span className="x-muted">{icon}</span>
      </div>
      <div className="f x-num">{format(shown)}</div>
      <div className="b">
        <div>
          <span className={cx("x-delta", up ? "up" : "dn")}>
            {up ? <ArrowUpRight size={12} strokeWidth={2} /> : <ArrowDownRight size={12} strokeWidth={2} />}
            {up ? "+" : ""}
            {delta.toFixed(1)}%
          </span>
          <small>vs previous {period}</small>
        </div>
        <Sparkline values={spark} up={up} />
      </div>
    </div>
  );
}

/** Eases from 82% to 100% of the value whenever it changes. */
function useCountUp(target: number, ms = 450) {
  const [shown, setShown] = useState(target);
  useEffect(() => {
    let frame = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(target * (0.82 + 0.18 * eased));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, ms]);
  return shown;
}

export function Sparkline({ values, up }: { values: number[]; up: boolean }) {
  const id = useId().replace(/:/g, "");
  const W = 110;
  const H = 36;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const pts = values.map((v, i) => [(i / (values.length - 1)) * W, H - 3 - ((v - min) / (max - min || 1)) * (H - 8)]);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("");
  const color = up ? "var(--li)" : "var(--red)";
  return (
    <svg className="sp" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity=".28" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line}L${W} ${H}L0 ${H}Z`} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
