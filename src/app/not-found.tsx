import Link from "next/link";
import { LogoMark } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <div className="x-boot">
      <div className="x-soon">
        <LogoMark />
        <h2>Page not found</h2>
        <p>That page doesn&apos;t exist in this store.</p>
        <Link className="x-btn x-btn--pri x-btn--auto" href="/">
          Back to ISStore
        </Link>
      </div>
    </div>
  );
}
