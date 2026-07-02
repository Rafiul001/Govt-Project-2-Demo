import { z } from "zod";

/**
 * Query for `GET /api/v1/nav/page` — resolves a single public page by its
 * branch name and the menu + sub-menu slugs (the URL path segments).
 */
export const pageBySlugQuerySchema = z.strictObject({
  branchName: z.string().trim().min(1),
  menu: z.string().trim().min(1),
  submenu: z.string().trim().min(1),
});

export type TPageBySlugQuery = z.infer<typeof pageBySlugQuerySchema>;
