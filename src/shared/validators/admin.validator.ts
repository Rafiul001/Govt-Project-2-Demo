import { adminType } from "@/shared/types";
import { z } from "zod";
import { fileSchema } from "./file.validator";

export const adminLoginSchema = z.strictObject({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const createAdminSchema = z
  .strictObject({
    name: z.string().trim().min(1).max(255),
    username: z.string().trim().min(3).max(255),
    password: z.string().min(8).max(255),
    // Uploaded image file; the route stores the resulting Cloudinary URL.
    avatar: fileSchema.optional(),
    adminType: z.enum(adminType).optional(),
    // Multipart form values arrive as strings, so coerce numeric fields.
    branchId: z.coerce.number().int().positive().optional(),
  })
  .refine(
    (data) =>
      data.adminType === adminType.SUPER_ADMIN || data.branchId !== undefined,
    { message: "branchId is required for branch admins", path: ["branchId"] },
  );

export type TAdminLoginInput = z.infer<typeof adminLoginSchema>;
export type TCreateAdminInput = z.infer<typeof createAdminSchema>;
