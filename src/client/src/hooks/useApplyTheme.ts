import { useEffect } from "react";
import { useThemeStore } from "../store/theme.store";

/**
 * Reflect the theme store onto the document root: the `light`/`dark` class
 * controls HeroUI's color mode, and `data-accent` selects the brand accent
 * (see index.css). Call once near the app root.
 */
export function useApplyTheme() {
  const mode = useThemeStore((state) => state.mode);
  const accent = useThemeStore((state) => state.accent);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(mode);
    root.dataset.accent = accent;
  }, [mode, accent]);
}
