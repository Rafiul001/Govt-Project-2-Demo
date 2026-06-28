import { z } from "zod";

/** Maximum accepted upload size: 5 MB. */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** An uploaded file constrained to at most 5 MB. */
export const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: "File must not exceed 5 MB",
  });
