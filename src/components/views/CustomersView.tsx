"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Initials } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Chips } from "@/components/ui/Chips";
import { Input } from "@/components/ui/Input";
import { Pagination, paginate } from "@/components/ui/Pagination";
import { PageHead, Panel } from "@/components/ui/Panel";
import { EmptyRow, SortTh, Table } from "@/components/ui/Table";
import { useCustomers } from "@/hooks/useCustomers";
import { money, plural } from "@/lib/format";
import type { Customer, CustomerTag, SortDir } from "@/lib/types";
import { useDataStore } from "@/store/data";
import { useUI } from "@/store/ui";

type SortKey = "name" | "email" | "location" | "count" | "spent" | "tag";
type TagFilter = "All" | CustomerTag;
const TAGS: TagFilter[] = ["All", "VIP", "Returning", "New"];
const PER_PAGE = 10;

export function CustomersView() {
  const customers = useCustomers();
  const orderCount = useDataStore((s) => s.orders.length);
  const openDrawer = useUI((s) => s.openDrawer);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<TagFilter>("All");
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "spent", dir: -1 });
  const [pageWanted, setPage] = useState(1);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers
      .filter((c) => (tag === "All" || c.tag === tag) && (!q || `${c.name} ${c.email} ${c.location}`.toLowerCase().includes(q)))
      .sort((a, b) => {
        const x: Customer[SortKey] = a[sort.key];
        const y: Customer[SortKey] = b[sort.key];
        const d = typeof x === "string" ? x.localeCompare(y as string) : (x as number) - (y as number);
        return (d || a.name.localeCompare(b.name)) * sort.dir;
      });
  }, [customers, query, tag, sort]);

  const { pages, page, start, rows } = paginate(list, pageWanted, PER_PAGE);
  const onSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: (-s.dir) as SortDir } : { key, dir: key === "count" || key === "spent" ? -1 : 1 }));
  const th = (key: SortKey, label: string, className?: string) => (
    <SortTh sortKey={key} current={sort.key} dir={sort.dir} onSort={onSort} className={className}>
      {label}
    </SortTh>
  );

  return (
    <section className="x-wrap x-view">
      <PageHead
        title="Customers"
        sub={`${plural(customers.length, "customer")} · ${customers.filter((c) => c.tag === "VIP").length} VIP · from ${plural(orderCount, "order")}`}
      />
      <Panel>
        <div className="x-tool">
          <label className="x-find">
            <Search size={16} strokeWidth={1.75} aria-hidden="true" />
            <Input
              type="search"
              placeholder="Search by name, email or city"
              aria-label="Search customers"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </label>
        </div>
        <div className="x-tool" style={{ paddingTop: 0 }}>
          <Chips
            label="Filter by tag"
            value={tag}
            onChange={(t) => {
              setTag(t);
              setPage(1);
            }}
            options={TAGS.map((t) => ({ value: t, count: t === "All" ? customers.length : customers.filter((c) => c.tag === t).length }))}
          />
        </div>
        <Table className="x-otable x-ctable">
          <thead>
            <tr>
              {th("name", "Customer")}
              {th("email", "Email")}
              {th("location", "Location")}
              {th("count", "Orders")}
              {th("spent", "Total spent", "r")}
              {th("tag", "Tag")}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((c) => {
                const open = () => openDrawer({ type: "customer", name: c.name });
                return (
                  <tr
                    key={c.name}
                    tabIndex={0}
                    aria-label={`${c.name}, open details`}
                    onClick={open}
                    onKeyDown={(e) => e.target === e.currentTarget && (e.key === "Enter" || e.key === " ") && (e.preventDefault(), open())}
                  >
                    <td className="c-cus">
                      <span className="x-cust">
                        <Initials name={c.name} />
                        <span>{c.name}</span>
                      </span>
                    </td>
                    <td className="c-mail">{c.email}</td>
                    <td className="c-loc">{c.location}</td>
                    <td className="c-cnt x-num">{plural(c.count, "order")}</td>
                    <td className="c-tot r x-num">{money(c.spent, 2)}</td>
                    <td className="c-tag">
                      <Badge tone={c.tag}>{c.tag}</Badge>
                    </td>
                  </tr>
                );
              })
            ) : (
              <EmptyRow colSpan={6}>
                No customers match{query ? ` “${query}”` : ""}
                {tag !== "All" ? ` tagged ${tag}` : ""}.
              </EmptyRow>
            )}
          </tbody>
        </Table>
        <Pagination page={page} pages={pages} start={start} shown={rows.length} total={list.length} onPage={setPage} />
      </Panel>
    </section>
  );
}
