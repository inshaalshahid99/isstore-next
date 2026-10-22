"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Simulates a network round trip: shows a button spinner for `ms`, then runs the callback.
 * Keeps the demo feeling like a real app without a backend.
 */
export function useSpin(ms = 700): [boolean, (fn: () => void) => void] {
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const run = useCallback(
    (fn: () => void) => {
      setLoading(true);
      timer.current = setTimeout(() => {
        setLoading(false);
        fn();
      }, ms);
    },
    [ms],
  );

  return [loading, run];
}
