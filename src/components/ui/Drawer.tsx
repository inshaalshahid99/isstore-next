"use client";

import { useId, useRef, type FormEvent, type ReactNode } from "react";
import { X } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { cx } from "@/lib/cx";
import { IconButton } from "./Button";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  sub?: ReactNode;
  pills?: ReactNode;
  footer?: ReactNode;
  closeLabel?: string;
  /** Wraps body and footer in a form so Enter submits. */
  onSubmit?: () => void;
  initialFocus?: string;
  bodyClassName?: string;
  children: ReactNode;
}

/** Right-hand slide-over panel. Stays mounted so it can animate in and out. */
export function Drawer({ open, onClose, title, sub, pills, footer, closeLabel = "Close", onSubmit, initialFocus, bodyClassName, children }: DrawerProps) {
  const ref = useRef<HTMLElement>(null);
  const titleId = useId();
  useFocusTrap(ref, open, onClose, initialFocus ?? "[data-close]");

  const inner = (
    <>
      <div className="x-dhead">
        <div>
          <h2 id={titleId}>{title}</h2>
          {sub && <p>{sub}</p>}
          {pills && <div className="x-pills">{pills}</div>}
        </div>
        <IconButton data-close onClick={onClose} aria-label={closeLabel}>
          <X size={18} strokeWidth={1.75} />
        </IconButton>
      </div>
      <div className={cx("x-dbody", bodyClassName)}>{children}</div>
      {footer && <div className="x-dfoot">{footer}</div>}
    </>
  );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit?.();
  };

  return (
    <>
      <div className={cx("x-dback", open && "open")} onClick={onClose} aria-hidden="true" />
      <aside
        ref={ref}
        className={cx("x-drawer", open && "open")}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-hidden={!open}
        inert={!open}
      >
        {onSubmit ? (
          <form onSubmit={submit} noValidate style={{ display: "contents" }}>
            {inner}
          </form>
        ) : (
          inner
        )}
      </aside>
    </>
  );
}
