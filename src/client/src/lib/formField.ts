import type { AnyFieldApi } from "@tanstack/react-form";

/**
 * Pull the first validation error message off a TanStack Form field, but only
 * once the field has been touched. Zod (via the standard-schema validators)
 * yields issue objects with a `message`; plain strings are handled too.
 */
export function getFieldError(field: AnyFieldApi): string | undefined {
  const { isTouched, errors } = field.state.meta;
  if (!isTouched || errors.length === 0) return undefined;

  const first = errors[0];
  if (!first) return undefined;
  if (typeof first === "string") return first;
  if (typeof first === "object" && "message" in first) {
    return String((first as { message: unknown }).message);
  }
  return String(first);
}
