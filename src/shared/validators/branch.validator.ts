import { z } from "zod";
import { fileSchema } from "./file.validator";

// Optional email that also tolerates an empty string from form fields.
const optionalEmail = z.union([z.literal(""), z.email()]).optional();

export const createBranchSchema = z.strictObject({
  name: z.string().trim().min(1).max(255),
  address: z.string().trim().min(1).max(255),
  phone: z.string().trim().max(50).optional(),
  email: optionalEmail,
  // Uploaded image files; the route stores the resulting Cloudinary URLs.
  logo: fileSchema.optional(),
  banner: fileSchema.optional(),
});

export const updateBranchSchema = z.strictObject({
  name: z.string().trim().min(1).max(255).optional(),
  address: z.string().trim().min(1).max(255).optional(),
  phone: z.string().trim().max(50).optional(),
  email: optionalEmail,
  logo: fileSchema.optional(),
  banner: fileSchema.optional(),
});

export type TCreateBranchInput = z.infer<typeof createBranchSchema>;
export type TUpdateBranchInput = z.infer<typeof updateBranchSchema>;
