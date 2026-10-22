import { cx } from "@/lib/cx";

interface Props<T extends string> {
  options: { value: T; count: number }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}

/** Filter chips with a count, like "Audio 4". */
export function Chips<T extends string>({ options, value, onChange, label }: Props<T>) {
  return (
    <div className="x-chips" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={cx("x-chip", o.value === value && "on")}
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.value} <span className="x-muted x-num">{o.count}</span>
        </button>
      ))}
    </div>
  );
}
