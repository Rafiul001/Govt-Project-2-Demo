import { z } from "zod";

// Categories carry no file uploads, so these validate a JSON body (real
// numbers, not coerced strings). The name is bilingual — each language is
// optional, but at least one must be present. Unlike menus, the slug is
// provided explicitly (it cannot be derived when only a Bengali name is set)
// and forms the public URL `/members/:slug` on the landing sites.

/** True when at least one language name is a non-empty (trimmed) string. */
const hasAnyName = (v: { nameBn?: string; nameEn?: string }) =>
  Boolean(v.nameBn?.trim() || v.nameEn?.trim());

/** Lowercase kebab-case: `players`, `assistant-coaches`. */
export const slugSchema = z
  .string()
  .trim()
  .max(255)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: "Slug must be lowercase letters/numbers separated by hyphens",
  });

export const createMemberCategorySchema = z
  .strictObject({
    nameBn: z.string().trim().max(255).optional(),
    nameEn: z.string().trim().max(255).optional(),
    slug: slugSchema,
    order: z.number().int().min(0).optional(),
  })
  .refine(hasAnyName, {
    path: ["nameBn"],
    message: "Provide a name in Bangla or English",
  });

export const updateMemberCategorySchema = z.strictObject({
  nameBn: z.string().trim().max(255).optional(),
  nameEn: z.string().trim().max(255).optional(),
  slug: slugSchema.optional(),
  order: z.number().int().min(0).optional(),
});

export type TCreateMemberCategoryInput = z.infer<
  typeof createMemberCategorySchema
>;
export type TUpdateMemberCategoryInput = z.infer<
  typeof updateMemberCategorySchema
>;
