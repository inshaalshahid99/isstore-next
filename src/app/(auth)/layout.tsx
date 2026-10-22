import Image from "next/image";
import type { ReactNode } from "react";
import { AuthRedirect } from "@/components/auth/AuthRedirect";
import { ThemeToggle } from "@/components/providers/ThemeToggle";
import { LogoMark } from "@/components/ui/Logo";
import { asset } from "@/lib/asset";

/** Split auth screen: photo hero on the left, the form card on the right. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="x-auth">
      <AuthRedirect />
      <aside className="x-hero">
        <Image src={asset("/images/auth-hero.webp")} alt="A softly lit flagship store interior" fill priority sizes="(max-width: 900px) 100vw, 52vw" />
        <div className="x-hero__top">
          <LogoMark />
          ISStore
        </div>
        <div className="x-hero__copy">
          <h1>Run your store like a flagship.</h1>
          <p>Orders, products, customers and revenue in one calm, fast workspace.</p>
        </div>
      </aside>
      <div className="x-authside">
        <div className="x-authtools">
          <ThemeToggle />
        </div>
        <div className="x-card">{children}</div>
      </div>
    </div>
  );
}
