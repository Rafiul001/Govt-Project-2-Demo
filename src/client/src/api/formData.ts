/**
 * Build a `FormData` body from a plain object for `multipart/form-data`
 * endpoints (avatar/image/file uploads).
 *
 * `undefined`/`null` fields are skipped; `File` values are appended as-is and
 * everything else is stringified (the backend coerces numbers/booleans).
 */
export function toFormData(input: Record<string, unknown>): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null) {
      continue;
    }
    if (value instanceof File) {
      formData.append(key, value);
    } else {
      formData.append(key, String(value));
    }
  }

  return formData;
}
