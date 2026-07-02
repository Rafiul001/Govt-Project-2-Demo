import { z } from "zod";

/**
 * Pagination query params for list endpoints. Values arrive as strings, so they
 * are coerced; invalid values fall back via `.catch` and missing ones default.
 */
export const paginationQuerySchema = z.strictObject({
  page: z.coerce.number().int().positive().catch(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).catch(10).default(10),
});

export type TPaginationQuery = z.infer<typeof paginationQuerySchema>;

/**
 * Pagination params plus optional `branchName` and free-text `search` filters.
 * Used by the read routes (notices, board of directors, banners, admins): a
 * landing site can scope the list to its branch by name (e.g. `?branchName=Dhaka`)
 * and the dashboard can narrow it with `?search=`. Each route decides which
 * columns `search` matches against.
 */
export const branchListQuerySchema = z.strictObject({
  page: z.coerce.number().int().positive().catch(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).catch(10).default(10),
  branchName: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
});

export type TBranchListQuery = z.infer<typeof branchListQuerySchema>;

/**
 * Branch list params plus an optional `menuId` filter — used by the sub-menu
 * list route so the dashboard can show the sub-menus of a single menu.
 */
export const submenuListQuerySchema = z.strictObject({
  page: z.coerce.number().int().positive().catch(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).catch(10).default(10),
  branchName: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
  menuId: z.coerce.number().int().positive().optional(),
});

export type TSubmenuListQuery = z.infer<typeof submenuListQuerySchema>;
