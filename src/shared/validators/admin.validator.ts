import { z } from "zod";
import { fileSchema } from "./file.validator";

export const adminLoginSchema = z.strictObject({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Admins created through the API are always branch admins (so `branchId` is
// required). Super admins can only be seeded via the bootstrap script, never
// created by another super admin through the panel.
export const createAdminSchema = z.strictObject({
  name: z.string().trim().min(1).max(255),
  username: z.string().trim().min(3).max(255),
  password: z.string().min(8).max(255),
  // Uploaded image file; the route stores the resulting Cloudinary URL.
  avatar: fileSchema.optional(),
  // Multipart form values arrive as strings, so coerce numeric fields.
  branchId: z.coerce.number().int().positive(),
});

// Super admin editing a branch admin. Every field is optional (only the
// changed ones are sent); `password` is re-hashed only when provided.
export const updateAdminSchema = z.strictObject({
  name: z.string().trim().min(1).max(255).optional(),
  username: z.string().trim().min(3).max(255).optional(),
  password: z.string().min(8).max(255).optional(),
  avatar: fileSchema.optional(),
  branchId: z.coerce.number().int().positive().optional(),
});

// An admin editing their own account: only password and avatar are allowed.
export const updateProfileSchema = z.strictObject({
  password: z.string().min(8).max(255).optional(),
  avatar: fileSchema.optional(),
});

export type TAdminLoginInput = z.infer<typeof adminLoginSchema>;
export type TCreateAdminInput = z.infer<typeof createAdminSchema>;
export type TUpdateAdminInput = z.infer<typeof updateAdminSchema>;
export type TUpdateProfileInput = z.infer<typeof updateProfileSchema>;
