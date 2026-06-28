import { z } from "zod";

/** Validates a numeric `:id` path param (coerced from the URL string). */
export const idParamSchema = z.strictObject({
  id: z.coerce.number().int().positive(),
});

export type TIdParam = z.infer<typeof idParamSchema>;
