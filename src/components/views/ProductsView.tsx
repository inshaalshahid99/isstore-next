"use client";

import { useMemo } from "react";
import { Box, LayoutGrid, List, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Chips } from "@/components/ui/Chips";
import { Input } from "@/components/ui/Input";
import { PageHead, Panel } from "@/components/ui/Panel";
import { ProductImage } from "@/components/ui/ProductImage";
import { Segmented } from "@/components/ui/Segmented";
import { cx } from "@/lib/cx";
import { stockOf } from "@/lib/data";
import { money, plural } from "@/lib/format";
import { CATEGORIES, type Product } from "@/lib/types";
import { useDataStore } from "@/store/data";
import { toast, useUI, type ProductFilters } from "@/store/ui";

const ICON = { size: 16, strokeWidth: 1.75 };

export function ProductsView() {
  const products = useDataStore((s) => s.products);
  const deleteProduct = useDataStore((s) => s.deleteProduct);
  const filters = useUI((s) => s.productFilters);
  const setFilters = useUI((s) => s.setProductFilters);
  const openForm = useUI((s) => s.openProductForm);
  const ask = useUI((s) => s.ask);
  const flash = useUI((s) => s.flash);

  const list = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return products.filter(
      (p) => (filters.category === "All" || p.category === filters.category) && (!q || `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q)),
    );
  }, [products, filters]);

  const low = products.filter((p) => p.stock <= 10).length;
  const categoryOptions = (["All", ...CATEGORIES] as const).map((c) => ({
    value: c,
    count: c === "All" ? products.length : products.filter((p) => p.category === c).length,
  }));

  const confirmDelete = (p: Product) =>
    ask({
      title: "Delete product?",
      body: `“${p.name}” will be removed from your catalog. This can't be undone.`,
      confirmLabel: "Delete",
      danger: true,
      onConfirm: () => {
        deleteProduct(p.id);
        toast(`Deleted ${p.name}`, { icon: "trash" });
      },
    });

  const none = !products.length;

  return (
    <section className="x-wrap x-view">
      <PageHead title="Products" sub={plural(products.length, "product") + (low ? ` · ${low} low or out of stock` : "")}>
        <Button variant="primary" icon={<Plus size={18} strokeWidth={1.75} />} onClick={() => openForm(null)}>
          Add product
        </Button>
      </PageHead>

      <Panel>
        <div className="x-tool">
          <label className="x-find">
            <Search {...ICON} aria-hidden="true" />
            <Input type="search" placeholder="Search products" aria-label="Search products" value={filters.q} onChange={(e) => setFilters({ q: e.target.value })} />
          </label>
          <Segmented<ProductFilters["view"]>
            mode="toggle"
            label="Layout"
            value={filters.view}
            onChange={(view) => setFilters({ view })}
            options={[
              { value: "grid", label: <><LayoutGrid {...ICON} />Grid</> },
              { value: "list", label: <><List {...ICON} />List</> },
            ]}
          />
        </div>
        <div className="x-tool" style={{ paddingTop: 0 }}>
          <Chips label="Filter by category" options={categoryOptions} value={filters.category} onChange={(category) => setFilters({ category })} />
        </div>
      </Panel>

      {list.length ? (
        <div className={cx("x-pgrid", filters.view === "list" && "list")}>
          {list.map((p) => {
            const stock = stockOf(p.stock);
            return (
              <article key={p.id} className={cx("x-panel x-pcard", flash.includes(`p-${p.id}`) && "flash")} data-pid={p.id}>
                <div className="x-pimg">
                  <ProductImage image={p.image} alt={p.name} size={480} />
                </div>
                <div className="x-pinfo">
                  <div className="nm">
                    <h3>{p.name}</h3>
                    <small>
                      {p.category} · {plural(p.stock, "unit")}
                    </small>
                  </div>
                  <p className="pr x-num">{money(p.price, p.price % 1 ? 2 : 0)}</p>
                  <Badge tone={stock.level}>{stock.label}</Badge>
                </div>
                <div className="x-pacts">
                  <Button icon={<Pencil {...ICON} />} aria-label={`Edit ${p.name}`} onClick={() => openForm(p.id)}>
                    Edit
                  </Button>
                  <Button variant="danger" icon={<Trash2 {...ICON} />} aria-label={`Delete ${p.name}`} onClick={() => confirmDelete(p)}>
                    Delete
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="x-panel x-soon">
          <div className="ic">
            <Box size={26} strokeWidth={1.75} />
          </div>
          <h2>{none ? "No products yet" : "No products match"}</h2>
          <p>
            {none
              ? "Add your first product to start selling."
              : `Nothing${filters.q ? ` for “${filters.q}”` : ""}${filters.category !== "All" ? ` in ${filters.category}` : ""}. Try another search or category.`}
          </p>
          <Button onClick={() => (none ? openForm(null) : setFilters({ q: "", category: "All" }))}>{none ? "Add product" : "Clear filters"}</Button>
        </div>
      )}
    </section>
  );
}
