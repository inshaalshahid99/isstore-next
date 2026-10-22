import { ChevronLeft, ChevronRight } from "lucide-react";
import { cx } from "@/lib/cx";

interface Props {
  page: number;
  pages: number;
  start: number;
  shown: number;
  total: number;
  onPage: (page: number) => void;
}

export function Pagination({ page, pages, start, shown, total, onPage }: Props) {
  const go = (p: number) => {
    onPage(p);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  return (
    <div className="x-pager">
      <span className="x-num">{total ? `Showing ${start + 1}–${start + shown} of ${total}` : "No results"}</span>
      <div className="x-pages">
        <button type="button" className="x-pg" disabled={page <= 1} onClick={() => go(page - 1)} aria-label="Previous page">
          <ChevronLeft size={16} strokeWidth={1.75} />
        </button>
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            type="button"
            className={cx("x-pg", p === page && "on")}
            aria-current={p === page ? "page" : undefined}
            aria-label={`Page ${p}`}
            onClick={() => go(p)}
          >
            {p}
          </button>
        ))}
        <button type="button" className="x-pg" disabled={page >= pages} onClick={() => go(page + 1)} aria-label="Next page">
          <ChevronRight size={16} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

/** Clamp the page and slice the rows for it. */
export function paginate<T>(list: T[], page: number, per: number) {
  const pages = Math.max(1, Math.ceil(list.length / per));
  const current = Math.min(page, pages);
  const start = (current - 1) * per;
  return { pages, page: current, start, rows: list.slice(start, start + per) };
}
