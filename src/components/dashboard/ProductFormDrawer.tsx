"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Field } from "@/components/ui/Field";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { ProductImage } from "@/components/ui/ProductImage";
import { useSpin } from "@/hooks/useSpin";
import { hasErrors, type Errors } from "@/lib/validate";
import { CATEGORIES, IMAGE_KEYS, type Category, type ImageKey, type Product } from "@/lib/types";
import { useDataStore } from "@/store/data";
import { toast, useUI } from "@/store/ui";

interface FormValues {
  name: string;
  price: string;
  stock: string;
  category: Category | "";
  image: ImageKey | "";
  description: string;
}
type Key = keyof FormValues;

const IMAGE_LABELS: Record<ImageKey, string> = {
  sneaker: "Sneaker",
  headphones: "Headphones",
  watch: "Watch",
  perfume: "Perfume",
  backpack: "Backpack",
  speaker: "Speaker",
};

const initialValues = (p: Product | undefined, fallbackCategory: Category | "All"): FormValues => ({
  name: p?.name ?? "",
  price: p ? p.price.toFixed(2) : "",
  stock: p ? String(p.stock) : "",
  category: p?.category ?? (fallbackCategory === "All" ? "" : fallbackCategory),
  image: p?.image ?? "",
  description: p?.description ?? "",
});

function validateProduct(v: FormValues, products: Product[], editingId: number | null): Errors<Key> {
  const name = v.name.trim();
  const priceS = v.price.trim().replace(/[$,\s]/g, "");
  const stockS = v.stock.trim();
  const price = Number(priceS);
  const dup = products.some((p) => p.id !== editingId && p.name.toLowerCase() === name.toLowerCase());
  return {
    name: name.length < 2 ? "Enter a product name" : dup ? "A product with this name already exists" : "",
    price: !priceS
      ? "Enter a price"
      : !/^\d+(\.\d{1,2})?$/.test(priceS) || price <= 0
        ? "Enter a price above $0, like 129.00"
        : price > 100000
          ? "Price must be under $100,000"
          : "",
    stock: stockS === "" ? "Enter stock on hand" : !/^\d+$/.test(stockS) ? "Use a whole number, 0 or more" : Number(stockS) > 99999 ? "Stock must be under 100,000" : "",
    category: v.category ? "" : "Choose a category",
    image: v.image ? "" : "Pick an image",
  };
}

/** Add / edit product slide-over with inline validation. */
export function ProductFormDrawer() {
  const drawer = useUI((s) => s.drawer);
  const last = useUI((s) => s.lastDrawer);
  const close = useUI((s) => s.closeDrawer);
  const products = useDataStore((s) => s.products);
  const saveProduct = useDataStore((s) => s.saveProduct);
  const filterCategory = useUI((s) => s.productFilters.category);
  const [loading, spin] = useSpin();

  const session = last?.type === "product" ? last : null;
  const editing = session?.id != null ? products.find((p) => p.id === session.id) : undefined;
  const nonce = session?.nonce ?? 0;

  // Form state belongs to one opening of the drawer (its nonce); a new opening starts fresh.
  const [state, setState] = useState<{ nonce: number; values: FormValues; errors: Errors<Key> } | null>(null);
  const fresh = !state || state.nonce !== nonce;
  const values = fresh ? initialValues(editing, filterCategory) : state.values;
  const errors = fresh ? {} : state.errors;

  const set = <K extends Key>(key: K, value: FormValues[K]) =>
    setState({ nonce, values: { ...values, [key]: value }, errors: { ...errors, [key]: "" } });

  const submit = () => {
    if (loading) return;
    const next = validateProduct(values, products, editing?.id ?? null);
    setState({ nonce, values, errors: next });
    if (hasErrors(next)) {
      toast("Fill in the highlighted fields", { icon: "alert" });
      const first = document.querySelector<HTMLElement>(".x-drawer.open .bad input:not([type=radio]), .x-drawer.open .bad select, .x-drawer.open .bad .x-pick input");
      first?.focus();
      return;
    }
    spin(() => {
      const saved = saveProduct(
        {
          name: values.name.trim(),
          price: Math.round(Number(values.price.replace(/[$,\s]/g, "")) * 100) / 100,
          stock: Number(values.stock),
          category: values.category as Category,
          image: values.image as ImageKey,
          description: values.description.trim(),
        },
        editing?.id,
      );
      const ui = useUI.getState();
      const { q, category } = ui.productFilters;
      const matches = (category === "All" || category === saved.category) && (!q.trim() || `${saved.name} ${saved.category} ${saved.description}`.toLowerCase().includes(q.trim().toLowerCase()));
      if (!matches) ui.setProductFilters({ q: "", category: "All" });
      ui.flashIds([`p-${saved.id}`]);
      close();
      toast(editing ? `Saved changes to ${saved.name}` : `Added ${saved.name}`, { icon: editing ? "check" : "plus" });
      setTimeout(() => document.querySelector(`[data-pid="${saved.id}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" }), 80);
    });
  };

  return (
    <Drawer
      open={drawer?.type === "product"}
      onClose={close}
      closeLabel="Close product form"
      title={editing ? "Edit product" : "Add product"}
      sub={editing ? "Changes show in the catalog as soon as you save." : "It appears in the catalog as soon as you save."}
      onSubmit={submit}
      initialFocus="#pf-name"
      bodyClassName="x-dbody--form"
      footer={
        <>
          <Button onClick={close}>Cancel</Button>
          <Button type="submit" variant="primary" loading={loading}>
            {editing ? "Save changes" : "Add product"}
          </Button>
        </>
      }
    >
      <Field label="Name" htmlFor="pf-name" error={errors.name}>
        <Input id="pf-name" maxLength={80} placeholder="Aero Court Sneaker – Black" value={values.name} invalid={!!errors.name} onChange={(e) => set("name", e.target.value)} />
      </Field>
      <div className="x-two">
        <Field label="Price" htmlFor="pf-price" error={errors.price}>
          <div className="x-pre">
            <span>$</span>
            <Input id="pf-price" className="x-num" inputMode="decimal" placeholder="129.00" value={values.price} invalid={!!errors.price} onChange={(e) => set("price", e.target.value)} />
          </div>
        </Field>
        <Field label="Stock" htmlFor="pf-stock" error={errors.stock}>
          <Input id="pf-stock" className="x-num" inputMode="numeric" placeholder="0" value={values.stock} invalid={!!errors.stock} onChange={(e) => set("stock", e.target.value)} />
        </Field>
      </div>
      <Field label="Category" htmlFor="pf-cat" error={errors.category}>
        <Select id="pf-cat" value={values.category} aria-invalid={!!errors.category || undefined} onChange={(e) => set("category", e.target.value as Category | "")}>
          <option value="">Choose a category</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
      </Field>
      <div className={errors.image ? "x-field bad" : "x-field"}>
        <span className="x-lab" id="pf-imglab">
          Image
        </span>
        <div className="x-pick" role="radiogroup" aria-labelledby="pf-imglab">
          {IMAGE_KEYS.map((k) => (
            <label key={k}>
              <input type="radio" name="pf-img" value={k} aria-label={IMAGE_LABELS[k]} checked={values.image === k} onChange={() => set("image", k)} />
              <ProductImage image={k} alt="" size={120} />
            </label>
          ))}
        </div>
        <p className="x-err">{errors.image}</p>
      </div>
      <Field label="Description" htmlFor="pf-desc" aside={<span className="x-mlab">{values.description.length} / 400</span>}>
        <Textarea id="pf-desc" maxLength={400} placeholder="Materials, fit, what's in the box…" value={values.description} onChange={(e) => set("description", e.target.value)} />
      </Field>
    </Drawer>
  );
}
