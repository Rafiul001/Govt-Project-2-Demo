import { z } from "zod";
import { fileSchema } from "./file.validator";

export const createBoardOfDirectorSchema = z.strictObject({
  // Multipart form values arrive as strings, so coerce numeric fields.
  // Used only by super admins; branch admins take the branch from their token.
  branchId: z.coerce.number().int().positive().optional(),
  name: z.string().trim().min(1).max(255),
  designation: z.string().trim().min(1).max(255),
  // Uploaded image file; the route stores the resulting Cloudinary URL.
  avatar: fileSchema.optional(),
  order: z.coerce.number().int().min(0).optional(),
});

export const updateBoardOfDirectorSchema = z.strictObject({
  // Only honoured for super admins (branch admins cannot reassign branch).
  branchId: z.coerce.number().int().positive().optional(),
  name: z.string().trim().min(1).max(255).optional(),
  designation: z.string().trim().min(1).max(255).optional(),
  avatar: fileSchema.optional(),
  order: z.coerce.number().int().min(0).optional(),
});

export type TCreateBoardOfDirectorInput = z.infer<
  typeof createBoardOfDirectorSchema
>;
export type TUpdateBoardOfDirectorInput = z.infer<
  typeof updateBoardOfDirectorSchema
>;
