import { z } from "zod";

/**
 * Query for `GET /api/v1/nav/page` — resolves a single public page by its
 * branch name and the menu (+ optional sub-menu) slugs, mirroring the URL
 * path segments. Without `submenu` it resolves the page attached directly to
 * the menu (`/:menuSlug`).
 */
export const pageBySlugQuerySchema = z.strictObject({
  branchName: z.string().trim().min(1),
  menu: z.string().trim().min(1),
  submenu: z.string().trim().min(1).optional(),
});

export type TPageBySlugQuery = z.infer<typeof pageBySlugQuerySchema>;
