import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";

export type ButtonVariant = "default" | "primary" | "lime" | "danger";

const VARIANT: Record<ButtonVariant, string> = {
  default: "",
  primary: "x-btn--pri",
  lime: "x-btn--lime",
  danger: "x-btn--danger",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** Shows a spinner and blocks clicks. */
  loading?: boolean;
  /** Size to content instead of filling the row. */
  auto?: boolean;
  icon?: ReactNode;
}

export function Button({ variant = "default", loading, auto, icon, className, children, disabled, type = "button", ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={cx("x-btn", VARIANT[variant], auto && "x-btn--auto", loading && "loading", className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {icon}
      {children !== undefined && <span>{children}</span>}
    </button>
  );
}

export function IconButton({ className, type = "button", ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={cx("x-ibtn", className)} {...rest} />;
}

export function LinkButton({ className, type = "button", ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={cx("x-a", className)} {...rest} />;
}
