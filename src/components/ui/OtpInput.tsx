"use client";

import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cx } from "@/lib/cx";

export const OTP_LENGTH = 6;

interface Props {
  value: string;
  onChange: (value: string) => void;
  /** Called with the full code once every box is filled. */
  onComplete?: (code: string) => void;
  error?: string;
  /** Bump to play the shake animation (wrong code). */
  shakeKey?: number;
  autoFocus?: boolean;
}

/** Six single-digit boxes with paste, arrow keys and backspace handling. */
export function OtpInput({ value, onChange, onComplete, error, shakeKey = 0, autoFocus }: Props) {
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const wrap = useRef<HTMLDivElement>(null);
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? "");

  useEffect(() => {
    const el = wrap.current;
    if (!shakeKey || !el) return;
    el.classList.remove("shake");
    void el.offsetWidth; // restart the animation
    el.classList.add("shake");
    boxes.current[0]?.focus();
  }, [shakeKey]);

  const fill = (from: number, incoming: string) => {
    const next = digits.slice();
    incoming.split("").forEach((d, k) => {
      if (from + k < OTP_LENGTH) next[from + k] = d;
    });
    const code = next.join("");
    onChange(code);
    boxes.current[Math.min(from + incoming.length, OTP_LENGTH - 1)]?.focus();
    if (next.every(Boolean)) onComplete?.(code);
  };

  const onKey = (i: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      e.preventDefault();
      const next = digits.slice();
      next[i - 1] = "";
      onChange(next.join(""));
      boxes.current[i - 1]?.focus();
    } else if (e.key === "ArrowLeft" && i > 0) boxes.current[i - 1]?.focus();
    else if (e.key === "ArrowRight" && i < OTP_LENGTH - 1) boxes.current[i + 1]?.focus();
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const d = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (d) fill(0, d);
  };

  return (
    <div ref={wrap} className={cx("x-otp", error && "bad")}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            boxes.current[i] = el;
          }}
          className="x-input"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          autoFocus={autoFocus && i === 0}
          maxLength={OTP_LENGTH}
          aria-label={`Digit ${i + 1}`}
          value={d}
          onFocus={(e) => e.currentTarget.select()}
          onKeyDown={onKey(i)}
          onPaste={onPaste}
          onChange={(e) => {
            const typed = e.target.value.replace(/\D/g, "");
            if (!typed) {
              const next = digits.slice();
              next[i] = "";
              onChange(next.join(""));
              return;
            }
            // When a box already holds a digit, the new one is the last character typed.
            const fresh = d && typed.length > 1 && typed.startsWith(d) ? typed.slice(1) : typed;
            fill(i, fresh.slice(0, OTP_LENGTH - i));
          }}
        />
      ))}
    </div>
  );
}
