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
 * Pagination params plus an optional `branchName` filter. Used by the public
 * read routes (notices, board of directors) so a landing site can
 * scope the list to its branch by name, e.g. `?branchName=Dhaka`.
 */
export const branchListQuerySchema = z.strictObject({
  page: z.coerce.number().int().positive().catch(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).catch(10).default(10),
  branchName: z.string().trim().min(1).optional(),
});

export type TBranchListQuery = z.infer<typeof branchListQuerySchema>;
