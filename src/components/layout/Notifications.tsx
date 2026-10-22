"use client";

import { useCallback, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Bell, CreditCard, ShoppingBag, Star, TriangleAlert } from "lucide-react";
import { IconButton, LinkButton } from "@/components/ui/Button";
import { useDismiss } from "@/hooks/useDismiss";
import { cx } from "@/lib/cx";
import { STATIC_NOTES } from "@/lib/data";
import { ago, money } from "@/lib/format";
import { useDataStore } from "@/store/data";
import { toast, useUI } from "@/store/ui";

const STATIC_ICONS = { alert: TriangleAlert, card: CreditCard, star: Star };

export function Notifications() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  const orders = useDataStore((s) => s.orders);
  const read = useDataStore((s) => s.readNotes);
  const markRead = useDataStore((s) => s.markRead);
  const openDrawer = useUI((s) => s.openDrawer);

  const items = useMemo(() => {
    const newest = [...orders].sort((a, b) => b.placedAt.localeCompare(a.placedAt)).slice(0, 5);
    return [
      ...newest.map((o) => ({ id: o.id, orderId: o.id, Icon: ShoppingBag, title: `New order #${o.id} · ${money(o.total, 2)}`, sub: `${o.customer} · ${ago(o.placedAt)}` })),
      ...STATIC_NOTES.map((n) => ({ id: n.id, orderId: undefined, Icon: STATIC_ICONS[n.icon], title: n.title, sub: n.sub })),
    ];
  }, [orders]);

  const unread = items.some((n) => !read.includes(n.id));

  return (
    <div className="x-dd" ref={ref}>
      <IconButton onClick={() => setOpen((v) => !v)} aria-label="Notifications" aria-expanded={open}>
        <Bell size={18} strokeWidth={1.75} />
        {unread && <span className="x-ping" />}
      </IconButton>
      <div className={cx("x-menu", open && "open")} inert={!open}>
        <div className="x-mhead">
          Notifications
          <LinkButton
            onClick={() => {
              markRead(items.map((n) => n.id));
              toast("All notifications marked as read");
            }}
          >
            Mark all read
          </LinkButton>
        </div>
        <div>
          {items.map(({ id, orderId, Icon, title, sub }) => {
            const activate = () => {
              if (!orderId) return;
              markRead([id]);
              setOpen(false);
              openDrawer({ type: "order", id: orderId });
            };
            return (
              <div
                key={id}
                className={cx("x-note", read.includes(id) && "read")}
                {...(orderId
                  ? {
                      "data-oid": orderId,
                      role: "button",
                      tabIndex: 0,
                      onClick: activate,
                      onKeyDown: (e: KeyboardEvent) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          activate();
                        }
                      },
                    }
                  : {})}
              >
                <span className="ic">
                  <Icon size={16} strokeWidth={1.75} />
                </span>
                <div>
                  <p>{title}</p>
                  <small>{sub}</small>
                </div>
                <span className="u" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
