import { z } from "zod";
import { fileSchema } from "./file.validator";

// Events upload an image, so these validate multipart form input (numbers,
// booleans and dates arrive as strings and are coerced). The title is
// bilingual — each language optional, at least one required. `endAt` is
// optional (single-moment events) but must not precede `startAt`.

/** True when at least one language title is a non-empty (trimmed) string. */
const hasAnyTitle = (v: { titleBn?: string; titleEn?: string }) =>
  Boolean(v.titleBn?.trim() || v.titleEn?.trim());

const endAfterStart = (v: { startAt?: Date; endAt?: Date }) =>
  !v.startAt || !v.endAt || v.endAt >= v.startAt;

export const createEventSchema = z
  .strictObject({
    // Used only by super admins; branch admins take the branch from their token.
    branchId: z.coerce.number().int().positive().optional(),
    titleBn: z.string().trim().max(255).optional(),
    titleEn: z.string().trim().max(255).optional(),
    descriptionBn: z.string().trim().min(1).optional(),
    descriptionEn: z.string().trim().min(1).optional(),
    venue: z.string().trim().min(1).max(255).optional(),
    startAt: z.coerce.date(),
    endAt: z.coerce.date().optional(),
    // Uploaded image file; the route stores the resulting Cloudinary URL.
    image: fileSchema.optional(),
    isPublished: z.stringbool().optional(),
  })
  .refine(hasAnyTitle, {
    path: ["titleBn"],
    message: "Provide a title in Bangla or English",
  })
  .refine(endAfterStart, {
    path: ["endAt"],
    message: "End time must not be before start time",
  });

export const updateEventSchema = z
  .strictObject({
    // Only honoured for super admins (branch admins cannot reassign branch).
    branchId: z.coerce.number().int().positive().optional(),
    titleBn: z.string().trim().max(255).optional(),
    titleEn: z.string().trim().max(255).optional(),
    descriptionBn: z.string().trim().min(1).optional(),
    descriptionEn: z.string().trim().min(1).optional(),
    venue: z.string().trim().min(1).max(255).optional(),
    startAt: z.coerce.date().optional(),
    endAt: z.coerce.date().optional(),
    image: fileSchema.optional(),
    // Delete the stored image (ignored when a new file is uploaded).
    removeImage: z.stringbool().optional(),
    isPublished: z.stringbool().optional(),
  })
  // Only checkable here when both are sent; the route re-checks against the
  // stored row when just one side changes.
  .refine(endAfterStart, {
    path: ["endAt"],
    message: "End time must not be before start time",
  });

export type TCreateEventInput = z.infer<typeof createEventSchema>;
export type TUpdateEventInput = z.infer<typeof updateEventSchema>;
