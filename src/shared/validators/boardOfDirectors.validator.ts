import { z } from "zod";

export const createBoardOfDirectorSchema = z.strictObject({
  // Used only by super admins; branch admins take the branch from their token.
  branchId: z.number().int().positive().optional(),
  name: z.string().trim().min(1).max(255),
  designation: z.string().trim().min(1).max(255),
  avatar: z.url().max(255).optional(),
  order: z.number().int().min(0).optional(),
});

export const updateBoardOfDirectorSchema = z.strictObject({
  name: z.string().trim().min(1).max(255).optional(),
  designation: z.string().trim().min(1).max(255).optional(),
  avatar: z.url().max(255).optional(),
  order: z.number().int().min(0).optional(),
});

export type TCreateBoardOfDirectorInput = z.infer<
  typeof createBoardOfDirectorSchema
>;
export type TUpdateBoardOfDirectorInput = z.infer<
  typeof updateBoardOfDirectorSchema
>;
