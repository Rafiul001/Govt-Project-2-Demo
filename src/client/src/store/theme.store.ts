import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TThemeMode = "light" | "dark";
export type TAccent = "teal" | "blue" | "purple";

type TThemeState = {
  mode: TThemeMode;
  accent: TAccent;
  setMode: (mode: TThemeMode) => void;
  toggleMode: () => void;
  setAccent: (accent: TAccent) => void;
};

/** Available accents, surfaced for the settings page swatches. */
export const ACCENTS: { value: TAccent; label: string; color: string }[] = [
  { value: "teal", label: "Teal", color: "#009688" },
  { value: "blue", label: "Blue", color: "#03a9f4" },
  { value: "purple", label: "Purple", color: "#8a4af3" },
];

/**
 * UI theme preferences (light/dark mode + accent color), persisted to
 * localStorage. The values are applied to <html> by `useApplyTheme`.
 */
export const useThemeStore = create<TThemeState>()(
  persist(
    (set) => ({
      mode: "light",
      accent: "teal",
      setMode: (mode) => set({ mode }),
      toggleMode: () =>
        set((state) => ({ mode: state.mode === "light" ? "dark" : "light" })),
      setAccent: (accent) => set({ accent }),
    }),
    { name: "theme" },
  ),
);
