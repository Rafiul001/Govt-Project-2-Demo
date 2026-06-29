import { Label, TextArea, TextField } from "@heroui/react";
import type { AnyFieldApi } from "@tanstack/react-form";
import { getFieldError } from "../../lib/formField";
import { FieldShell } from "./FieldShell";

type TTextAreaInputProps = {
  field: AnyFieldApi;
  label: string;
  placeholder?: string;
  isRequired?: boolean;
  rows?: number;
};

/** Multiline text field bound to a TanStack Form field. */
export function TextAreaInput({
  field,
  label,
  placeholder,
  isRequired,
  rows = 4,
}: TTextAreaInputProps) {
  const error = getFieldError(field);
  const resolvedPlaceholder = placeholder ?? `Enter ${label.toLowerCase()}`;

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
        <TextArea rows={rows} placeholder={resolvedPlaceholder} />
      </TextField>
    </FieldShell>
  );
}
