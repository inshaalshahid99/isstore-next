"use client";

import { useState, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cx } from "@/lib/cx";

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export function Input({ className, invalid, ...rest }: InputProps) {
  return (
    <input
      className={cx("x-input", className)}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid && rest.id ? `${rest.id}-err` : undefined}
      {...rest}
    />
  );
}

/** Password field with a show/hide toggle. */
export function PasswordInput(props: Omit<InputProps, "type">) {
  const [show, setShow] = useState(false);
  return (
    <div className="x-pw">
      <Input {...props} type={show ? "text" : "password"} />
      <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"}>
        {show ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
      </button>
    </div>
  );
}

export function Select({ className, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cx("x-input", className)} {...rest} />;
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx("x-input", className)} {...rest} />;
}
