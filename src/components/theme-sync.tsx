import { useEffect } from "react";
import { useHabits } from "@/lib/habit/store";

/** Applies the stored theme preference to <html>. */
export function ThemeSync() {
  const { data } = useHabits();
  const theme = data.theme;

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && media.matches);
      root.classList.toggle("dark", dark);
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", dark ? "#18181b" : "#fbf7f1");
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);

  return null;
}
