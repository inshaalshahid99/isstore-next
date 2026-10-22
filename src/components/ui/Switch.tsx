import type { InputHTMLAttributes } from "react";

export function Switch(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  return (
    <label className="x-sw">
      <input type="checkbox" role="switch" {...props} />
      <i />
    </label>
  );
}
