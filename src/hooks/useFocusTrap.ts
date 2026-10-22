"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE = "a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex='0']";

/** Only the top-most open layer (drawer, dialog, palette) reacts to Tab and Escape. */
const stack: symbol[] = [];

/**
 * Keeps keyboard focus inside an open layer, closes it on Escape and
 * hands focus back to whatever opened it when it closes.
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onEscape: () => void,
  initialFocus?: string,
) {
  // Latest Escape handler without re-running the trap (and re-focusing) on every render.
  const escapeRef = useRef(onEscape);
  useEffect(() => {
    escapeRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    if (!active) return;
    const id = Symbol("layer");
    stack.push(id);
    const opener = document.activeElement as HTMLElement | null;

    const focusTimer = setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const first = (initialFocus && el.querySelector<HTMLElement>(initialFocus)) || el.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus();
    }, 60);

    const onKey = (e: KeyboardEvent) => {
      if (stack[stack.length - 1] !== id) return;
      const el = ref.current;
      if (!el) return;
      if (e.key === "Escape") {
        e.preventDefault();
        escapeRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const items = [...el.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (x) => x.offsetParent !== null || (x as HTMLInputElement).type === "radio",
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (!el.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKey);
      const i = stack.indexOf(id);
      if (i > -1) stack.splice(i, 1);
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, [active, ref, initialFocus]);
}
