"use client";

import { ConfirmDialog } from "@/components/ui/Dialog";
import { useUI } from "@/store/ui";

/** Renders the confirm dialog requested through useUI().ask(…). */
export function ConfirmHost() {
  const confirm = useUI((s) => s.confirm);
  const closeConfirm = useUI((s) => s.closeConfirm);
  return (
    <ConfirmDialog
      open={!!confirm}
      title={confirm?.title ?? ""}
      body={confirm?.body ?? ""}
      confirmLabel={confirm?.confirmLabel ?? "Confirm"}
      danger={confirm?.danger}
      onCancel={closeConfirm}
      onConfirm={() => {
        const run = confirm?.onConfirm;
        closeConfirm();
        run?.();
      }}
    />
  );
}
