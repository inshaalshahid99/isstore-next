"use client";

import { useCallback, useEffect, useState } from "react";

/** Seconds left until an action (like "Resend code") unlocks. `restart()` starts it again. */
export function useCountdown(seconds: number) {
  const [left, setLeft] = useState(seconds);
  const [run, setRun] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setLeft((s) => (s <= 1 ? (clearInterval(t), 0) : s - 1)), 1000);
    return () => clearInterval(t);
  }, [run]);

  const restart = useCallback(() => {
    setLeft(seconds);
    setRun((r) => r + 1);
  }, [seconds]);

  return { left, restart };
}
