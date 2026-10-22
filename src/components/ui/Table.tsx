import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import type { SortDir } from "@/lib/types";

/** Horizontally scrollable table shell. */
export function Table({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className="x-tablewrap">
      <table className={cx("x-table", className)}>{children}</table>
    </div>
  );
}

interface SortThProps<K extends string> {
  sortKey: K;
  current: K;
  dir: SortDir;
  onSort: (key: K) => void;
  className?: string;
  children: ReactNode;
}

/** A column header that sorts on click and announces its state to screen readers. */
export function SortTh<K extends string>({ sortKey, current, dir, onSort, className, children }: SortThProps<K>) {
  const on = sortKey === current;
  return (
    <th className={className} aria-sort={on ? (dir > 0 ? "ascending" : "descending") : undefined}>
      <button type="button" className="x-sort" onClick={() => onSort(sortKey)}>
        {children}
        <i>{on ? (dir > 0 ? "↑" : "↓") : "↕"}</i>
      </button>
    </th>
  );
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr className="x-none">
      <td colSpan={colSpan}>{children}</td>
    </tr>
  );
}
