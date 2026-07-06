import { z } from "zod";
import { fileSchema } from "./file.validator";

export const createBannerSchema = z.strictObject({
  // Multipart form values arrive as strings, so coerce numeric fields.
  // Used only by super admins; branch admins take the branch from their token.
  branchId: z.coerce.number().int().positive().optional(),
  title: z.string().trim().min(1).max(255),
  subTitle: z.string().trim().min(1).max(255),
  // Uploaded image file; the route stores the resulting Cloudinary URL.
  image: fileSchema.optional(),
  order: z.coerce.number().int().min(0).optional(),
});

export const updateBannerSchema = z.strictObject({
  // Only honoured for super admins (branch admins cannot reassign branch).
  branchId: z.coerce.number().int().positive().optional(),
  title: z.string().trim().min(1).max(255).optional(),
  subTitle: z.string().trim().min(1).max(255).optional(),
  image: fileSchema.optional(),
  // Delete the stored image (ignored when a new file is uploaded).
  removeImage: z.stringbool().optional(),
  order: z.coerce.number().int().min(0).optional(),
});

export type TCreateBannerInput = z.infer<typeof createBannerSchema>;
export type TUpdateBannerInput = z.infer<typeof updateBannerSchema>;
