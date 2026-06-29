import { Label, ListBox, ListBoxItem, Select } from "@heroui/react";
import type { AnyFieldApi } from "@tanstack/react-form";
import { ChevronDownIcon } from "lucide-react";
import { getFieldError } from "../../lib/formField";
import { FieldShell } from "./FieldShell";

export type TSelectOption = { value: string; label: string };

type TSelectInputProps = {
  field: AnyFieldApi;
  label: string;
  options: TSelectOption[];
  placeholder?: string;
  isRequired?: boolean;
};

/** Single-select dropdown bound to a TanStack Form field (string value). */
export function SelectInput({
  field,
  label,
  options,
  placeholder = "Select…",
  isRequired,
}: TSelectInputProps) {
  const error = getFieldError(field);

  return (
    <FieldShell error={error}>
      <Select
        className="flex flex-col gap-1.5"
        name={field.name}
        placeholder={placeholder}
        selectedKey={field.state.value ?? null}
        onSelectionChange={(key) =>
          field.handleChange(key == null ? undefined : String(key))
        }
        onBlur={field.handleBlur}
        isInvalid={Boolean(error)}
        isRequired={isRequired}
      >
        <Label>{label}</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator>
            <ChevronDownIcon className="size-4" />
          </Select.Indicator>
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {options.map((option) => (
              <ListBoxItem key={option.value} id={option.value}>
                {option.label}
              </ListBoxItem>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
    </FieldShell>
  );
}
