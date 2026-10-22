import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackLink({ href, children, onClick }: { href: string; children: string; onClick?: () => void }) {
  return (
    <Link href={href} className="x-back" onClick={onClick}>
      <ArrowLeft size={18} strokeWidth={1.75} />
      {children}
    </Link>
  );
}
