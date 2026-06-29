import { Input, Label, TextField } from "@heroui/react";
import type { AnyFieldApi } from "@tanstack/react-form";
import { getFieldError } from "../../lib/formField";
import { FieldShell } from "./FieldShell";

type TTextInputProps = {
  field: AnyFieldApi;
  label: string;
  type?: "text" | "password" | "email";
  placeholder?: string;
  isRequired?: boolean;
  autoComplete?: string;
};

/** Text/password/email field bound to a TanStack Form field. */
export function TextInput({
  field,
  label,
  type = "text",
  placeholder,
  isRequired,
  autoComplete,
}: TTextInputProps) {
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
        <Input
          type={type}
          placeholder={resolvedPlaceholder}
          autoComplete={autoComplete}
        />
      </TextField>
    </FieldShell>
  );
}
