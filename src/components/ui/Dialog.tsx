"use client";

import { useId, useRef, type ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { cx } from "@/lib/cx";
import { Button } from "./Button";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  icon?: ReactNode;
  className?: string;
  role?: "dialog" | "alertdialog";
  initialFocus?: string;
  children: ReactNode;
}

/** Centered modal over a dimmed backdrop. Clicking the backdrop or pressing Escape closes it. */
export function Dialog({ open, onClose, title, icon, className, role = "dialog", initialFocus, children }: DialogProps) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useFocusTrap(ref, open, onClose, initialFocus);
  if (!open) return null;
  return (
    <div className="x-modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} className={cx("x-panel x-dialog", className)} role={role} aria-modal="true" aria-labelledby={titleId}>
        {icon && <div className="ic">{icon}</div>}
        <h2 id={titleId}>{title}</h2>
        {children}
      </div>
    </div>
  );
}

interface ConfirmProps {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({ open, title, body, confirmLabel, danger, onCancel, onConfirm }: ConfirmProps) {
  return (
    <Dialog open={open} onClose={onCancel} title={title} role="alertdialog" initialFocus="[data-cancel]" icon={<TriangleAlert size={20} strokeWidth={1.75} />}>
      <p>{body}</p>
      <div className="x-acts">
        <Button auto data-cancel onClick={onCancel}>
          Cancel
        </Button>
        <Button auto variant={danger ? "danger" : "primary"} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
