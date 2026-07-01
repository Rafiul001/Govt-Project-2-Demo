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
 * Notices list also accepts a `selected` notice id, so links (e.g. from the
 * dashboard) can deep-link straight to a notice's preview.
 */
export const noticesSearchSchema = listSearchSchema.extend({
  selected: z.coerce.number().int().positive().optional(),
});

export type TNoticesSearch = z.infer<typeof noticesSearchSchema>;

/**
 * Banners list accepts a free-text `search` and a `branchName` filter, both
 * kept in the URL so the view is shareable and survives reloads.
 */
export const bannersSearchSchema = listSearchSchema.extend({
  search: z.string().trim().min(1).optional().catch(undefined),
  branchName: z.string().trim().min(1).optional().catch(undefined),
});

export type TBannersSearch = z.infer<typeof bannersSearchSchema>;
