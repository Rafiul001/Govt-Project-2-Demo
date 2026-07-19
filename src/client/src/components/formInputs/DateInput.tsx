import { Input, Label, TextField } from "@heroui/react";
import type { AnyFieldApi } from "@tanstack/react-form";
import { getFieldError } from "../../lib/formField";
import { FieldShell } from "./FieldShell";

type TDateInputProps = {
  field: AnyFieldApi;
  label: string;
  /** `date` → `YYYY-MM-DD`; `datetime-local` → `YYYY-MM-DDTHH:mm`. */
  type?: "date" | "datetime-local";
  isRequired?: boolean;
};

/**
 * Native date / datetime picker bound to a TanStack Form field. The value is
 * the input's string form (empty string when cleared) — exactly what the API
 * expects for date fields.
 */
export function DateInput({
  field,
  label,
  type = "date",
  isRequired,
}: TDateInputProps) {
  const error = getFieldError(field);

  return (
    <FieldShell error={error}>
      <TextField
        className="flex flex-col gap-1.5"
        name={field.name}
        value={field.state.value ?? ""}
        onChange={(value) => field.handleChange(value)}
        onBlur={field.handleBlur}
        isInvalid={Boolean(error)}
        isRequired={isRequired}
      >
        <Label>{label}</Label>
        <Input type={type} />
      </TextField>
    </FieldShell>
  );
}
