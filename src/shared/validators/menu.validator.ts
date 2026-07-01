import { z } from "zod";

// Menus carry no file uploads, so these validate a JSON body (real numbers, not
// coerced strings). The title is bilingual — each language is optional, but at
// least one must be present. The `slug` is derived server-side from the title.

/** True when at least one language title is a non-empty (trimmed) string. */
const hasAnyTitle = (v: { titleBn?: string; titleEn?: string }) =>
  Boolean(v.titleBn?.trim() || v.titleEn?.trim());

export const createMenuSchema = z
  .strictObject({
    // Used only by super admins; branch admins take the branch from their token.
    branchId: z.number().int().positive().optional(),
    titleBn: z.string().trim().max(255).optional(),
    titleEn: z.string().trim().max(255).optional(),
    order: z.number().int().min(0).optional(),
  })
  .refine(hasAnyTitle, {
    path: ["titleBn"],
    message: "Provide a title in Bangla or English",
  });

export const updateMenuSchema = z.strictObject({
  // Only honoured for super admins (branch admins cannot reassign branch).
  branchId: z.number().int().positive().optional(),
  titleBn: z.string().trim().max(255).optional(),
  titleEn: z.string().trim().max(255).optional(),
  order: z.number().int().min(0).optional(),
});

export type TCreateMenuInput = z.infer<typeof createMenuSchema>;
export type TUpdateMenuInput = z.infer<typeof updateMenuSchema>;
