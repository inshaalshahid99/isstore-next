"use client";

import { Bell, Check, Download, Lock, LogOut, Mail, Plus, Trash2, TriangleAlert, Truck, Undo2, User, type LucideIcon } from "lucide-react";
import { cx } from "@/lib/cx";
import { useUI, type ToastIcon } from "@/store/ui";

const ICONS: Record<ToastIcon, LucideIcon> = {
  check: Check,
  alert: TriangleAlert,
  mail: Mail,
  truck: Truck,
  download: Download,
  undo: Undo2,
  trash: Trash2,
  plus: Plus,
  user: User,
  bell: Bell,
  lock: Lock,
  logout: LogOut,
};

export function Toaster() {
  const toasts = useUI((s) => s.toasts);
  return (
    <div className="x-toasts" aria-live="polite">
      {toasts.map((t) => {
        const Icon = ICONS[t.icon];
        return (
          <div key={t.id} className={cx("x-toast", t.code && "code", t.leaving && "out")}>
            <span className="ic">
              <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
            </span>
            <span>
              {t.message}
              {t.code && (
                <>
                  {" "}
                  <code>{t.code}</code>
                </>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
