import { Input, Label, TextField } from "@heroui/react";
import type { AnyFieldApi } from "@tanstack/react-form";
import { getFieldError } from "../../lib/formField";
import { FieldShell } from "./FieldShell";

type NumberInputProps = {
  field: AnyFieldApi;
  label: string;
  placeholder?: string;
  isRequired?: boolean;
  min?: number;
};

/**
 * Numeric field. Keeps the form value as `number | undefined` (empty input maps
 * to `undefined`) while rendering a controlled string in the underlying input.
 */
export function NumberInput({
  field,
  label,
  placeholder,
  isRequired,
  min,
}: NumberInputProps) {
  const error = getFieldError(field);
  const value = field.state.value;

  return (
    <FieldShell error={error}>
      <TextField
        className="flex flex-col gap-1.5"
        name={field.name}
        value={value === undefined || value === null ? "" : String(value)}
        onChange={(next) =>
          field.handleChange(next === "" ? undefined : Number(next))
        }
        onBlur={field.handleBlur}
        isInvalid={Boolean(error)}
        isRequired={isRequired}
      >
        <Label>{label}</Label>
        <Input
          type="number"
          inputMode="numeric"
          min={min}
          placeholder={placeholder}
        />
      </TextField>
    </FieldShell>
  );
}
