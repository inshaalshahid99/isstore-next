"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { avatarStyle } from "@/components/ui/Avatar";
import { useDismiss } from "@/hooks/useDismiss";
import { cx } from "@/lib/cx";
import { initials } from "@/lib/format";
import { useAuthStore } from "@/store/auth";
import { useDataStore } from "@/store/data";
import { toast } from "@/store/ui";

export function AccountMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);
  const profile = useDataStore((s) => s.profile);

  const signOut = () => {
    setOpen(false);
    useAuthStore.getState().signOut();
    toast("Signed out", { icon: "logout" });
    router.replace("/login");
  };

  return (
    <div className="x-dd" ref={ref}>
      <button type="button" className={cx("x-av", profile.avatar && "img")} style={avatarStyle(profile.avatar)} onClick={() => setOpen((v) => !v)} aria-label="Account menu" aria-expanded={open}>
        {initials(profile.name)}
      </button>
      <div className={cx("x-menu x-menu--sm", open && "open")} inert={!open}>
        <div className="x-who">
          <b>{profile.name}</b>
          <span>{profile.email}</span>
        </div>
        <Link href="/dashboard/settings" className="x-mi" onClick={close} style={{ textDecoration: "none" }}>
          <User size={18} strokeWidth={1.75} />
          Profile &amp; settings
        </Link>
        <button type="button" className="x-mi x-mi--red" onClick={signOut}>
          <LogOut size={18} strokeWidth={1.75} />
          Sign out
        </button>
      </div>
    </div>
  );
}
