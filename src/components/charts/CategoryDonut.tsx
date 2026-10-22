"use client";

import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { money } from "@/lib/format";

export interface Slice {
  name: string;
  share: number;
  color: string;
}

/** Share of revenue by category, with the total in the middle and a legend beside it. */
export function CategoryDonut({ slices, total }: { slices: Slice[]; total: number }) {
  const label = slices.map((s) => `${s.name} ${s.share}%`).join(", ");
  return (
    <div className="x-donut">
      <div className="x-donutwrap" role="img" aria-label={label}>
        <PieChart width={168} height={168}>
          <Pie data={[{ v: 1 }]} dataKey="v" innerRadius={53} outerRadius={75} fill="var(--panel2)" stroke="none" isAnimationActive={false} />
          <Pie data={slices} dataKey="share" nameKey="name" innerRadius={53} outerRadius={75} startAngle={90} endAngle={-270} paddingAngle={1.2} stroke="none">
            {slices.map((s) => (
              <Cell key={s.name} fill={s.color} />
            ))}
          </Pie>
          <Tooltip
            isAnimationActive={false}
            content={({ active, payload }) => {
              const s = payload?.[0]?.payload as Slice | undefined;
              if (!active || !s || !("share" in s)) return null;
              return (
                <div className="x-tip on">
                  <span>{s.name}</span>
                  <b className="x-num">{s.share}%</b>
                </div>
              );
            }}
          />
        </PieChart>
        <div className="x-donutmid">
          <small>Total sales</small>
          <b className="x-num">{money(total)}</b>
        </div>
      </div>
      <ul>
        {slices.map((s) => (
          <li key={s.name}>
            <i style={{ background: s.color }} />
            <b style={{ fontWeight: 500 }}>{s.name}</b>
            <span className="x-num">{money((total * s.share) / 100)}</span>
            <b className="x-num">{s.share}%</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
