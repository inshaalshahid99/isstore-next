import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

interface FieldProps {
  label?: ReactNode;
  htmlFor?: string;
  error?: string;
  /** Content on the right of the label row, like a character count or a link. */
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Label, control and inline error. The red state comes from the .bad class on the wrapper. */
export function Field({ label, htmlFor, error, aside, children, className }: FieldProps) {
  return (
    <div className={cx("x-field", error && "bad", className)}>
      {label !== undefined && (
        <label htmlFor={htmlFor}>
          {label}
          {aside}
        </label>
      )}
      {children}
      <p className="x-err" role={error ? "alert" : undefined} id={htmlFor ? `${htmlFor}-err` : undefined}>
        {error}
      </p>
    </div>
  );
}
