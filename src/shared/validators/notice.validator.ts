import { z } from "zod";
import { fileSchema } from "./file.validator";

export const createNoticeSchema = z.strictObject({
  // Multipart form values arrive as strings, so coerce numeric/boolean fields.
  // Used only by super admins; branch admins take the branch from their token.
  branchId: z.coerce.number().int().positive().optional(),
  title: z.string().trim().min(1).max(255),
  description: z.string().optional(),
  // Uploaded PDF file; the route stores the resulting Cloudinary URL in fileUrl.
  file: z.instanceof(File).optional(),
  // Uploaded image file; the route stores the resulting Cloudinary URL.
  image: z.instanceof(File).optional(),
  isPublished: z.stringbool().optional(),
});

export const updateNoticeSchema = z.strictObject({
  title: z.string().trim().min(1).max(255).optional(),
  description: z.string().optional(),
  file: fileSchema.optional(),
  image: fileSchema.optional(),
  isPublished: z.stringbool().optional(),
});

export type TCreateNoticeInput = z.infer<typeof createNoticeSchema>;
export type TUpdateNoticeInput = z.infer<typeof updateNoticeSchema>;
