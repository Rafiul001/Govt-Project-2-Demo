import { Switch } from "@heroui/react";
import type { AnyFieldApi } from "@tanstack/react-form";

type SwitchInputProps = {
  field: AnyFieldApi;
  label: string;
};

/** Boolean toggle bound to a TanStack Form field. */
export function SwitchInput({ field, label }: SwitchInputProps) {
  return (
    <Switch
      className="flex flex-row items-center justify-start gap-3"
      name={field.name}
      isSelected={Boolean(field.state.value)}
      onChange={(isSelected) => field.handleChange(isSelected)}
      onBlur={field.handleBlur}
    >
      <Switch.Content>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
      </Switch.Content>
      <span className="text-sm">{label}</span>
    </Switch>
  );
}
