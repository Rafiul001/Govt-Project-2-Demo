import { Button } from "@heroui/react";
import type { AnyFieldApi } from "@tanstack/react-form";
import { FileTextIcon, Undo2Icon, UploadIcon, XIcon } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { getFieldError } from "../../lib/formField";
import { FieldShell } from "./FieldShell";

type TFileInputProps = {
  field: AnyFieldApi;
  label: string;
  /** e.g. "image/*" or "application/pdf". */
  accept?: string;
  /** Already-saved file URL, shown as the preview while no new file is chosen. */
  existingUrl?: string | null;
};

/**
 * File picker bound to a TanStack Form field.
 *
 * The field value is `File | null | undefined`: a `File` is a new upload,
 * `undefined` keeps the already-saved file (if any), and `null` marks the
 * saved file for removal on save (the form sends the matching `remove*` flag).
 */
export function FileInput({
  field,
  label,
  accept,
  existingUrl,
}: TFileInputProps) {
  const error = getFieldError(field);
  const inputRef = useRef<HTMLInputElement>(null);
  const value = field.state.value as File | null | undefined;
  const file = value instanceof File ? value : undefined;
  const isRemoving = value === null && Boolean(existingUrl);

  // Object URL previewing a newly chosen file; revoked when it changes.
  const objectUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : undefined),
    [file],
  );
  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const previewUrl = objectUrl ?? (isRemoving ? undefined : existingUrl);
  const isImagePreview = file
    ? file.type.startsWith("image/")
    : (accept?.startsWith("image") ?? true);

  const removeLabel = file ? "Discard selected file" : "Remove current file";
  const handleRemove = () => {
    // Discarding a new pick falls back to the saved file; removing the saved
    // file marks it for deletion on save.
    field.handleChange(file ? undefined : null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <FieldShell error={error}>
      <span className="text-sm font-medium">{label}</span>

      {previewUrl ? (
        isImagePreview ? (
          <img
            src={previewUrl}
            alt={`${label} preview`}
            className="h-28 w-fit max-w-full rounded-lg border border-border object-contain"
          />
        ) : (
          <a
            href={previewUrl}
            target="_blank"
            rel="noreferrer"
            className="flex w-fit items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-accent hover:bg-accent/10"
          >
            <FileTextIcon className="size-4 shrink-0" />
            <span className="truncate">
              {file ? file.name : "View current file"}
            </span>
          </a>
        )
      ) : null}

      {isRemoving ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">
            Current file will be removed on save.
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onPress={() => field.handleChange(undefined)}
          >
            <Undo2Icon className="size-4" />
            Undo
          </Button>
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onPress={() => inputRef.current?.click()}
        >
          <UploadIcon className="size-4" />
          Choose file
        </Button>
        <span className="truncate text-sm text-muted">
          {file
            ? file.name
            : existingUrl && !isRemoving
              ? "Current file"
              : "No file selected"}
        </span>
        {file || (existingUrl && !isRemoving) ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            isIconOnly
            aria-label={removeLabel}
            onPress={handleRemove}
          >
            <XIcon className="size-4" />
          </Button>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => field.handleChange(event.target.files?.[0])}
          onBlur={field.handleBlur}
        />
      </div>
    </FieldShell>
  );
}
