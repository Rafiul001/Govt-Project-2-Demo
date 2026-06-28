import { z } from "zod";

export const createNoticeSchema = z.strictObject({
  // Used only by super admins; branch admins take the branch from their token.
  branchId: z.number().int().positive().optional(),
  title: z.string().trim().min(1).max(255),
  description: z.string().optional(),
  fileUrl: z.url().max(255).optional(),
  image: z.url().max(255).optional(),
  isPublished: z.boolean().optional(),
});

export const updateNoticeSchema = z.strictObject({
  title: z.string().trim().min(1).max(255).optional(),
  description: z.string().optional(),
  fileUrl: z.url().max(255).optional(),
  image: z.url().max(255).optional(),
  isPublished: z.boolean().optional(),
});

export type TCreateNoticeInput = z.infer<typeof createNoticeSchema>;
export type TUpdateNoticeInput = z.infer<typeof updateNoticeSchema>;
