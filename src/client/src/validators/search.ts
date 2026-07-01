import { z } from "zod";

/**
 * Search-param schema for paginated list routes. Used by TanStack Router's
 * `validateSearch`, so it must tolerate missing/garbage values: numbers are
 * coerced from the URL strings, fall back via `.catch`, and default when absent.
 */
export const listSearchSchema = z.strictObject({
  page: z.coerce.number().int().positive().catch(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).catch(10).default(10),
});

export type TListSearch = z.infer<typeof listSearchSchema>;

/**
 * Pagination plus a free-text `search` and a `branchName` filter, all kept in
 * the URL so the filtered view is shareable and survives reloads. Shared by the
 * banners, board-of-directors, and admins list routes.
 */
export const filterSearchSchema = listSearchSchema.extend({
  search: z.string().trim().min(1).optional().catch(undefined),
  branchName: z.string().trim().min(1).optional().catch(undefined),
});

export type TFilterSearch = z.infer<typeof filterSearchSchema>;

/** Banners share the base filter schema. */
export const bannersSearchSchema = filterSearchSchema;

/**
 * Notices list also accepts a `selected` notice id, so links (e.g. from the
 * dashboard) can deep-link straight to a notice's preview.
 */
export const noticesSearchSchema = filterSearchSchema.extend({
  selected: z.coerce.number().int().positive().optional(),
});

export type TNoticesSearch = z.infer<typeof noticesSearchSchema>;
