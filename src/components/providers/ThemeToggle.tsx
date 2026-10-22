"use client";

import { Moon, Sun } from "lucide-react";
import { IconButton } from "@/components/ui/Button";
import { useDataStore } from "@/store/data";

export function ThemeToggle() {
  const theme = useDataStore((s) => s.theme);
  const toggle = useDataStore((s) => s.toggleTheme);
  const dark = theme === "dark";
  return (
    <IconButton onClick={toggle} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}>
      {dark ? <Sun size={18} strokeWidth={1.75} /> : <Moon size={18} strokeWidth={1.75} />}
    </IconButton>
  );
}
