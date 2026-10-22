"use client";

import { useMemo } from "react";
import { deriveCustomers } from "@/lib/data";
import { useDataStore } from "@/store/data";

/** Customers are derived from orders, so refunds and new shipments update them automatically. */
export function useCustomers() {
  const orders = useDataStore((s) => s.orders);
  return useMemo(() => deriveCustomers(orders), [orders]);
}
