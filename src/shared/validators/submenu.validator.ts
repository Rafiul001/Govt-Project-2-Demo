import { z } from "zod";

// Sub-menus carry no file uploads, so these validate a JSON body. Creating a
// sub-menu also creates its (blank, unpublished) page — see the sub-menu route.
// The title is bilingual: each language optional, at least one required.

const hasAnyTitle = (v: { titleBn?: string; titleEn?: string }) =>
  Boolean(v.titleBn?.trim() || v.titleEn?.trim());

export const createSubmenuSchema = z
  .strictObject({
    // Used only by super admins; branch admins take the branch from their token.
    branchId: z.number().int().positive().optional(),
    menuId: z.number().int().positive(),
    titleBn: z.string().trim().max(255).optional(),
    titleEn: z.string().trim().max(255).optional(),
    order: z.number().int().min(0).optional(),
  })
  .refine(hasAnyTitle, {
    path: ["titleBn"],
    message: "Provide a title in Bangla or English",
  });

export const updateSubmenuSchema = z.strictObject({
  // Only honoured for super admins (branch admins cannot reassign branch).
  branchId: z.number().int().positive().optional(),
  // Move the sub-menu to another menu of the same branch.
  menuId: z.number().int().positive().optional(),
  titleBn: z.string().trim().max(255).optional(),
  titleEn: z.string().trim().max(255).optional(),
  order: z.number().int().min(0).optional(),
});

export type TCreateSubmenuInput = z.infer<typeof createSubmenuSchema>;
export type TUpdateSubmenuInput = z.infer<typeof updateSubmenuSchema>;
