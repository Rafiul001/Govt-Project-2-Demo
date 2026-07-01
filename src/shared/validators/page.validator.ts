import { z } from "zod";
import { fileSchema } from "./file.validator";

// A page carries a banner image upload, so it is sent as multipart form data
// (numeric/boolean fields arrive as strings and are coerced). A page is created
// implicitly with its sub-menu; only updates are accepted here. Banner title
// and body are bilingual; the route enforces that at least one banner-title
// language stays set (it has the existing row for context).

export const updatePageSchema = z.strictObject({
  bannerTitleBn: z.string().trim().max(255).optional(),
  bannerTitleEn: z.string().trim().max(255).optional(),
  // Uploaded banner image; the route stores the resulting Cloudinary URL.
  bannerImage: fileSchema.optional(),
  // Markdown body per language.
  contentBn: z.string().optional(),
  contentEn: z.string().optional(),
  isPublished: z.stringbool().optional(),
});

export type TUpdatePageInput = z.infer<typeof updatePageSchema>;
