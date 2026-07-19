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

/**
 * Members list: base filters plus a category filter and the card-grid/table
 * view toggle — all in the URL like every other list screen.
 */
export const membersSearchSchema = filterSearchSchema.extend({
  categoryId: z.coerce.number().int().positive().optional().catch(undefined),
  view: z.enum(["grid", "table"]).catch("grid").default("grid"),
});

export type TMembersSearch = z.infer<typeof membersSearchSchema>;

/**
 * Events list: base filters plus the list/calendar view toggle and the
 * calendar's `YYYY-MM` month (defaults to the current month when absent).
 */
export const eventsSearchSchema = filterSearchSchema.extend({
  view: z.enum(["list", "calendar"]).catch("list").default("list"),
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
    .optional()
    .catch(undefined),
});

export type TEventsSearch = z.infer<typeof eventsSearchSchema>;
