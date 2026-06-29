import { Button } from "@heroui/react";
import { MoonIcon, SunIcon } from "lucide-react";
import { useThemeStore } from "../../store/theme.store";

/** Icon button that flips between light and dark mode. */
export function ThemeModeToggle() {
  const mode = useThemeStore((state) => state.mode);
  const toggleMode = useThemeStore((state) => state.toggleMode);

  return (
    <Button
      variant="ghost"
      size="sm"
      isIconOnly
      aria-label={
        mode === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
      onPress={toggleMode}
    >
      {mode === "dark" ? (
        <SunIcon className="size-5" />
      ) : (
        <MoonIcon className="size-5" />
      )}
    </Button>
  );
}
