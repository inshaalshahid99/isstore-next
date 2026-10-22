import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AppRoot } from "@/components/providers/AppRoot";
import "./globals.css";

export const metadata: Metadata = {
  title: "ISStore (Next.js) | Inshaal Shahid",
  description:
    "ISStore is an e-commerce admin dashboard built with Next.js, React and TypeScript by front-end developer Inshaal Shahid. Try the demo account to explore orders, products, customers and analytics.",
  authors: [{ name: "Inshaal Shahid", url: "https://inshaalshahid.com" }],
  metadataBase: new URL("https://inshaalshahid.com"),
  alternates: { canonical: "/isstore-next/" },
  openGraph: {
    title: "ISStore (Next.js) | Inshaal Shahid",
    description: "A fully working e-commerce admin dashboard demo built with Next.js + TypeScript.",
    url: "https://inshaalshahid.com/isstore-next/",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b10",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <AppRoot>{children}</AppRoot>
      </body>
    </html>
  );
}
