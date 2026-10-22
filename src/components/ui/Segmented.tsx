import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

interface Option<T extends string> {
  value: T;
  label: ReactNode;
}

interface Props<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  /** "tabs" for a range switcher, "toggle" for a pressed-state button group. */
  mode?: "tabs" | "toggle";
}

export function Segmented<T extends string>({ options, value, onChange, label, mode = "tabs" }: Props<T>) {
  return (
    <div className="x-seg" role={mode === "tabs" ? "tablist" : "group"} aria-label={label}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            className={cx(on && "on")}
            onClick={() => !on && onChange(o.value)}
            {...(mode === "tabs" ? { role: "tab", "aria-selected": on } : { "aria-pressed": on })}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
