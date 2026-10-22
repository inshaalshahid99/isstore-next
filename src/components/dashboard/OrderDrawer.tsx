"use client";

import { Check, Undo2 } from "lucide-react";
import { Initials } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { ProductImage } from "@/components/ui/ProductImage";
import { cx } from "@/lib/cx";
import { fmtDate, fmtStamp, fmtTime, money, plural } from "@/lib/format";
import type { Order } from "@/lib/types";
import { useDataStore } from "@/store/data";
import { toast, useUI } from "@/store/ui";

/** Order details with a status timeline, plus fulfil and refund actions. */
export function OrderDrawer() {
  const drawer = useUI((s) => s.drawer);
  const last = useUI((s) => s.lastDrawer);
  const close = useUI((s) => s.closeDrawer);
  const orders = useDataStore((s) => s.orders);
  const open = drawer?.type === "order";
  const id = last?.type === "order" ? last.id : null;
  const order = orders.find((o) => o.id === id);

  return (
    <Drawer
      open={open}
      onClose={close}
      closeLabel="Close order details"
      title={order ? `Order #${order.id}` : "Order"}
      sub={order && `Placed ${fmtDate(order.placedAt)} at ${fmtTime(order.placedAt)}`}
      pills={
        order && (
          <>
            <StatusBadge status={order.payment} />
            <StatusBadge status={order.fulfillment} />
          </>
        )
      }
      footer={order && <OrderActions order={order} />}
    >
      {order && <OrderBody order={order} orders={orders} />}
    </Drawer>
  );
}

function OrderActions({ order }: { order: Order }) {
  const fulfil = useDataStore((s) => s.fulfilOrder);
  const refund = useDataStore((s) => s.refundOrder);
  const { ask, flashIds } = useUI.getState();
  const refunded = order.payment === "Refunded";
  const fulfilled = order.fulfillment === "Fulfilled";
  const total = money(order.total, 2);

  return (
    <>
      <Button
        variant="primary"
        icon={<Check size={16} strokeWidth={1.75} />}
        disabled={fulfilled || refunded}
        title={refunded ? "Refunded orders can't be fulfilled" : undefined}
        onClick={() => {
          fulfil(order.id);
          flashIds([order.id]);
          toast(`Order #${order.id} marked as fulfilled`);
        }}
      >
        {fulfilled ? "Fulfilled" : "Mark fulfilled"}
      </Button>
      <Button
        variant="danger"
        icon={<Undo2 size={16} strokeWidth={1.75} />}
        disabled={order.payment !== "Paid"}
        title={order.payment === "Pending" ? "Nothing to refund until payment clears" : undefined}
        onClick={() =>
          ask({
            title: `Refund order #${order.id}?`,
            body: `${total} goes back to ${order.customer}'s card. This can't be undone.`,
            confirmLabel: `Refund ${total}`,
            danger: true,
            onConfirm: () => {
              refund(order.id);
              flashIds([order.id]);
              toast(`Refunded ${total} for order #${order.id}`, { icon: "undo" });
            },
          })
        }
      >
        {refunded ? "Refunded" : "Refund"}
      </Button>
    </>
  );
}

function OrderBody({ order: o, orders }: { order: Order; orders: Order[] }) {
  const timeline: { state: "done" | "bad" | ""; title: string; sub: string }[] = [
    { state: "done", title: "Placed", sub: fmtStamp(o.placedAt) },
    { state: o.paidAt ? "done" : "", title: "Paid", sub: o.paidAt ? `${fmtStamp(o.paidAt)} · ${money(o.total, 2)} by card` : "Awaiting payment" },
    {
      state: o.shippedAt ? "done" : "",
      title: "Shipped",
      sub: o.shippedAt ? `${fmtStamp(o.shippedAt)} · UPS Ground` : o.payment === "Refunded" ? "Will not ship" : "Not shipped yet",
    },
  ];
  if (o.fulfilledAt) timeline.push({ state: "done", title: "Fulfilled", sub: fmtStamp(o.fulfilledAt) });
  if (o.refundedAt) timeline.push({ state: "bad", title: "Refunded", sub: `${fmtStamp(o.refundedAt)} · ${money(o.total, 2)} returned` });
  const count = orders.filter((x) => x.customer === o.customer).length;

  return (
    <>
      <div className="x-dsec">
        <h3>{plural(o.items, "item")}</h3>
        <ul className="x-lines">
          {o.lines.map((l) => (
            <li key={l.name}>
              <ProductImage image={l.image} alt={l.name} size={104} />
              <div>
                <b>{l.name}</b>
                <small className="x-num">
                  {l.qty} × {money(l.price, 2)}
                </small>
              </div>
              <span className="p x-num">{money(l.price * l.qty, 2)}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="x-dsec">
        <h3>Status</h3>
        <ol className="x-tl">
          {timeline.map((s) => (
            <li key={s.title} className={cx(s.state)}>
              <b>{s.title}</b>
              <small>{s.sub}</small>
            </li>
          ))}
        </ol>
      </div>
      <div className="x-dsec">
        <h3>Customer</h3>
        <div className="x-who2">
          <Initials name={o.customer} large />
          <div>
            <b>{o.customer}</b>
            <small>{o.email}</small>
            <small>{plural(count, "order")} this month</small>
          </div>
        </div>
      </div>
      <div className="x-dsec">
        <h3>Shipping address</h3>
        <p className="x-addr">
          {o.customer}
          <br />
          {o.street}
          <br />
          {o.city}
          <br />
          <span>United States</span>
        </p>
      </div>
      <div className="x-dsec">
        <h3>Summary</h3>
        <dl className="x-sum">
          <div>
            <dt>Subtotal</dt>
            <dd className="x-num">{money(o.subtotal, 2)}</dd>
          </div>
          <div>
            <dt>Shipping</dt>
            <dd className="x-num">{o.shipping ? money(o.shipping, 2) : "Free"}</dd>
          </div>
          <div className="tot">
            <dt>Total</dt>
            <dd className="x-num">{money(o.total, 2)}</dd>
          </div>
        </dl>
      </div>
    </>
  );
}
