import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

export function Panel({ glow, className, children }: { glow?: boolean; className?: string; children: ReactNode }) {
  return <div className={cx("x-panel", glow && "x-glow", className)}>{children}</div>;
}

export function PanelHead({ title, sub, children }: { title: ReactNode; sub?: ReactNode; children?: ReactNode }) {
  return (
    <div className="x-ph">
      <div>
        <h2>{title}</h2>
        {sub}
      </div>
      {children}
    </div>
  );
}

export function PageHead({ title, sub, children }: { title: string; sub?: ReactNode; children?: ReactNode }) {
  return (
    <div className="x-pagehead">
      <div>
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {children && <div className="x-acts">{children}</div>}
    </div>
  );
}
