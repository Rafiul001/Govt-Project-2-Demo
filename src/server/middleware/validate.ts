import { unprocessable } from "@/server/responses";
import { zValidator } from "@hono/zod-validator";
import type { ZodType } from "zod";
import { z } from "zod";

/**
 * Validates the JSON request body against a Zod schema. On failure it responds
 * with the standard `unprocessable` (422) envelope; on success the parsed data
 * is available via `c.req.valid("json")`.
 */
export function validateJson<T extends ZodType>(schema: T) {
  return zValidator("json", schema, (result, c) => {
    if (!result.success) {
      return unprocessable(
        c,
        "Validation failed",
        z.treeifyError(result.error),
      );
    }
  });
}
