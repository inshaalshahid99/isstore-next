import { strength } from "@/lib/format";

export function StrengthMeter({ password }: { password: string }) {
  return (
    <div className="x-meter" data-s={strength(password)} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </div>
  );
}
