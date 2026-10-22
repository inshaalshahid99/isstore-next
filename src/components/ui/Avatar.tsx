import { cx } from "@/lib/cx";
import { hue, initials } from "@/lib/format";

/** Coloured initials for a customer. */
export function Initials({ name, large }: { name: string; large?: boolean }) {
  return (
    <span className={cx("x-ini", large && "lg", hue(name))} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

/** Initials over a gradient, or the uploaded photo when there is one. */
export function avatarStyle(src: string | null) {
  return src ? { backgroundImage: `url("${src}")` } : undefined;
}
