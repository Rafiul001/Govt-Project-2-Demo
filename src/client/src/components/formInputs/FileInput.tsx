import { Button } from "@heroui/react";
import type { AnyFieldApi } from "@tanstack/react-form";
import { UploadIcon, XIcon } from "lucide-react";
import { useRef } from "react";
import { getFieldError } from "../../lib/formField";
import { FieldShell } from "./FieldShell";

type FileInputProps = {
  field: AnyFieldApi;
  label: string;
  /** e.g. "image/*" or "application/pdf". */
  accept?: string;
};

/** File picker bound to a TanStack Form field (value is `File | undefined`). */
export function FileInput({ field, label, accept }: FileInputProps) {
  const error = getFieldError(field);
  const inputRef = useRef<HTMLInputElement>(null);
  const file = field.state.value as File | undefined;

  return (
    <FieldShell error={error}>
      <span className="text-sm font-medium">{label}</span>
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
          {file ? file.name : "No file selected"}
        </span>
        {file ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            isIconOnly
            aria-label="Remove file"
            onPress={() => {
              field.handleChange(undefined);
              if (inputRef.current) inputRef.current.value = "";
            }}
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
