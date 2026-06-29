import { Button, Card } from "@heroui/react";
import { CheckIcon, MoonIcon, SunIcon } from "lucide-react";
import { ACCENTS, useThemeStore } from "../../store/theme.store";
import { PageHeader } from "../molecules";
import { ProfileForm } from "../organisms";

export function SettingsPage() {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);
  const accent = useThemeStore((state) => state.accent);
  const setAccent = useThemeStore((state) => state.setAccent);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Personalize the look and feel of your panel."
      />

      <Card className="max-w-xl">
        <Card.Header>
          <Card.Title>Appearance</Card.Title>
          <Card.Description>Theme mode and accent color.</Card.Description>
        </Card.Header>
        <Card.Content className="space-y-6 p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium">Mode</p>
            <div className="flex gap-2">
              <Button
                variant={mode === "light" ? "primary" : "outline"}
                onPress={() => setMode("light")}
              >
                <SunIcon className="size-4" />
                Light
              </Button>
              <Button
                variant={mode === "dark" ? "primary" : "outline"}
                onPress={() => setMode("dark")}
              >
                <MoonIcon className="size-4" />
                Dark
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Accent color</p>
            <div className="flex gap-3">
              {ACCENTS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-label={option.label}
                  onClick={() => setAccent(option.value)}
                  className="grid size-10 place-items-center rounded-full text-white ring-offset-2 ring-offset-background transition data-[active=true]:ring-2 data-[active=true]:ring-accent"
                  data-active={accent === option.value}
                  style={{ backgroundColor: option.color }}
                >
                  {accent === option.value ? (
                    <CheckIcon className="size-5" />
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </Card.Content>
      </Card>

      <Card className="max-w-xl">
        <Card.Header>
          <Card.Title>Account</Card.Title>
          <Card.Description>Update your avatar and password.</Card.Description>
        </Card.Header>
        <Card.Content className="p-6">
          <ProfileForm />
        </Card.Content>
      </Card>
    </div>
  );
}
