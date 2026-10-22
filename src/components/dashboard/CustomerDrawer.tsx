"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Textarea } from "@/components/ui/Input";
import { useCustomers } from "@/hooks/useCustomers";
import { fmtDate, money, plural, statusOf } from "@/lib/format";
import type { Customer } from "@/lib/types";
import { useDataStore } from "@/store/data";
import { toast, useUI } from "@/store/ui";

/** Customer profile: lifetime stats, their orders and a private note. */
export function CustomerDrawer() {
  const drawer = useUI((s) => s.drawer);
  const last = useUI((s) => s.lastDrawer);
  const close = useUI((s) => s.closeDrawer);
  const notes = useDataStore((s) => s.notes);
  const setNote = useDataStore((s) => s.setNote);
  const customers = useCustomers();
  const name = last?.type === "customer" ? last.name : null;
  const customer = customers.find((c) => c.name === name);
  // An unsaved draft belongs to one customer; anyone else shows their saved note.
  const [draft, setDraft] = useState<{ name: string; text: string } | null>(null);
  const note = customer && draft?.name === customer.name ? draft.text : (customer && notes[customer.name]) || "";

  const save = () => {
    if (!customer) return;
    const v = note.trim();
    setNote(customer.name, v);
    setDraft(null);
    toast(v ? `Note saved for ${customer.name}` : `Note cleared for ${customer.name}`);
  };

  return (
    <Drawer
      open={drawer?.type === "customer"}
      onClose={close}
      closeLabel="Close customer details"
      title={customer?.name ?? "Customer"}
      sub={customer && `${customer.email} · ${customer.location}`}
      pills={customer && <Badge tone={customer.tag}>{customer.tag}</Badge>}
      footer={
        <>
          <Button onClick={close}>Close</Button>
          <Button variant="primary" icon={<Check size={16} strokeWidth={1.75} />} onClick={save}>
            Save note
          </Button>
        </>
      }
    >
      {customer && <CustomerBody customer={customer} note={note} onNote={(text) => setDraft({ name: customer.name, text })} />}
    </Drawer>
  );
}

function CustomerBody({ customer: c, note, onNote }: { customer: Customer; note: string; onNote: (text: string) => void }) {
  const openDrawer = useUI((s) => s.openDrawer);
  return (
    <>
      <div className="x-cstats">
        <div>
          <small>Orders</small>
          <b className="x-num">{c.count}</b>
        </div>
        <div>
          <small>Total spent</small>
          <b className="x-num">{money(c.spent, 2)}</b>
        </div>
        <div>
          <small>Avg order</small>
          <b className="x-num">{money(c.spent / c.count, 2)}</b>
        </div>
      </div>
      <div className="x-dsec">
        <h3>{plural(c.count, "order")}</h3>
        <ul className="x-corders">
          {[...c.orders]
            .sort((a, b) => b.placedAt.localeCompare(a.placedAt))
            .map((o) => (
              <li key={o.id}>
                <button type="button" aria-label={`Open order #${o.id}`} onClick={() => openDrawer({ type: "order", id: o.id })}>
                  <span>
                    <span className="x-oid">#{o.id}</span>
                    <small>
                      {fmtDate(o.placedAt)} · {plural(o.items, "item")}
                    </small>
                  </span>
                  <StatusBadge status={statusOf(o)} />
                  <span className="p x-num">{money(o.total, 2)}</span>
                </button>
              </li>
            ))}
        </ul>
      </div>
      <div className="x-dsec">
        <h3>
          <label htmlFor="cd-note">Notes</label>
        </h3>
        <Textarea id="cd-note" maxLength={500} placeholder="Sizing, preferences, follow-ups…" value={note} onChange={(e) => onNote(e.target.value)} />
      </div>
    </>
  );
}
