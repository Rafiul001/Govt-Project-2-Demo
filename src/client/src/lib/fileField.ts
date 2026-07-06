/*
 * Helpers translating a FileInput field value (`File | null | undefined`)
 * into API payload parts: a `File` is a new upload, `null` means "remove the
 * saved file" and `undefined` means "keep it".
 */

/** The new file to upload, if one was chosen. */
export function filePatch(value: File | null | undefined): File | undefined {
  return value instanceof File ? value : undefined;
}

/** `true` when the saved file should be removed; omitted otherwise. */
export function fileRemoved(value: File | null | undefined): true | undefined {
  return value === null ? true : undefined;
}
