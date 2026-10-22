# ISStore: E-commerce Admin Dashboard (Next.js + TypeScript)

ISStore is a fully working e-commerce admin dashboard: orders, products, customers, analytics and settings in one fast, dark-first workspace. It is a front-end demo with no backend, so every change you make is saved in your browser and survives a refresh.

**Live demo:** https://inshaalshahid.com/isstore-next/
Click **Try demo account**, or sign in with `demo@isstore.shop` / `demo1234`.

This is the Next.js + TypeScript rebuild of the original vanilla HTML/CSS/JS version ([case study](https://inshaalshahid.com/work/isstore/)). It looks and behaves the same, but it is built from typed, reusable components, real routes and a persisted state store.

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router), exported as static files (`output: "export"`) |
| Language | TypeScript (strict) |
| UI | React 19, hand-written CSS ported from the original design system (no CSS framework) |
| State | Zustand with `persist` middleware (localStorage) |
| Charts | Recharts |
| Icons | lucide-react |
| Font | Geist and Geist Mono via the `geist` package (self-hosted, no Google Fonts request) |
| Quality | ESLint (`eslint-config-next` core-web-vitals + TypeScript rules) |

## Features

**Auth (client-side demo)**
- One-click demo account, or email + password for the demo user and any account you sign up
- Sign up with a password strength meter, terms checkbox and validation
- One-time code screen (`/verify`) for sign-up, email-code sign-in, two-factor sign-in and password reset. The demo code appears in a toast.
- Forgot password, then set a new password
- Route guards: `/` and the auth pages send signed-in users to the dashboard, and dashboard pages send signed-out users to `/login`

**Dashboard**
- **Overview:** KPI cards with count-up and sparklines, a 7D / 30D / 90D switch, a revenue area chart against the previous period, recent orders and top products
- **Orders:** search, status tabs with counts, sortable columns, pagination, select rows to bulk-ship, CSV export (all, filtered or selected), and a detail drawer with a status timeline plus fulfil and refund actions (refund asks for confirmation)
- **Products:** grid or list view, category chips, search, an add/edit drawer with validation (name, price, stock, category, image picker, description) and a delete confirmation
- **Customers:** derived from orders, with search, tag filters (VIP, Returning, New), sorting, pagination, and a profile drawer with order history and private notes
- **Analytics:** monthly revenue bars, conversion funnel, sales by category donut, traffic sources and top countries
- **Settings:** profile with avatar upload (stored as a data URL), store details, notification switches, password change, two-factor authentication (OTP demo), active sessions, and **Reset demo data**
- **Command palette** (Ctrl/Cmd + K, or `/`) to jump to any page, product, order or customer
- Toasts, a dark/light theme toggle, an Orders badge that counts unfulfilled orders, and notifications that open the related order
- Responsive: a sticky, collapsible sidebar on desktop and an off-canvas drawer on mobile, with no horizontal scroll at 375px
- Accessible: drawers and dialogs trap focus and close on Escape, sortable headers expose `aria-sort`, rows can be opened from the keyboard

## Project structure

```
src/
  app/                    routes (App Router)
    (auth)/               login, signup, verify, forgot-password, reset-password
    dashboard/            overview, orders, products, customers, analytics, settings
    globals.css           design tokens and component styles
  components/
    ui/                   Button, Field, Input, Drawer, Dialog, Badge, Table, KpiCard, OtpInput, Pagination…
    layout/               DashboardShell, Sidebar, Topbar, Notifications, AccountMenu
    dashboard/            OrderDrawer, CustomerDrawer, ProductFormDrawer, CommandPalette, ConfirmHost
    charts/               RevenueChart, MonthlyBars, CategoryDonut (Recharts)
    views/                one component per dashboard page
    auth/                 auth forms
  store/                  Zustand stores: data (persisted), auth (persisted), ui (transient)
  lib/                    types, seed data, formatting, validation, CSV export
  hooks/                  useSpin, useFocusTrap, useDismiss, useCountdown, useCustomers
```

The seed data (12 products, 30 orders) is generated deterministically, so **Settings → Reset demo data** always restores exactly the same store.

## Run locally

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:3000/isstore-next/ (the app uses a `basePath`, see below).

Other scripts:

```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm run build       # static export to ./out
```

## Build and deploy (static export)

`next.config.ts` sets:

```ts
output: "export",
basePath: "/isstore-next",
trailingSlash: true,
images: { unoptimized: true },
```

`npm run build` writes plain HTML, CSS and JS to `out/`. Upload the contents of `out/` to a folder called `isstore-next` on any static host (it is served from cPanel on the live site). There are no API routes, middleware or server features, so no Node server is needed.

To host it somewhere else, change `basePath` in `next.config.ts`. Internal links use `next/link` and the router, which add the base path automatically, and files in `/public` go through `src/lib/asset.ts`.

## Notes

- This is a demo: accounts, passwords and codes live in your browser's localStorage, not on a server. Don't use a real password.
- Clearing site data, or **Reset demo data**, restores the original store.

## Author

Designed and developed by **Inshaal Shahid**, front-end developer (React, Next.js, Shopify).
Portfolio: https://inshaalshahid.com
