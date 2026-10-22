import { Box, ChartColumn, House, Settings, ShoppingBag, Users, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Shows the unfulfilled-orders count. */
  badge?: boolean;
}

export const NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: House },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag, badge: true },
  { href: "/dashboard/products", label: "Products", icon: Box },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/analytics", label: "Analytics", icon: ChartColumn },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

/** usePathname() may or may not carry the trailing slash; compare without it. */
export const normalizePath = (path: string) => (path.length > 1 ? path.replace(/\/+$/, "") : path);

export const navFor = (path: string) => NAV.find((n) => n.href === normalizePath(path)) ?? NAV[0];
