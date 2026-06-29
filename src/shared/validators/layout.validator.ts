import { sidebarPosition } from "@/shared/types";
import { z } from "zod";

export const createLayoutSchema = z.strictObject({
  // Used only by super admins; branch admins take the branch from their token.
  branchId: z.number().int().positive().optional(),
  showLogo: z.boolean().optional(),
  showBanner: z.boolean().optional(),
  sidebarPosition: z.enum(sidebarPosition).optional(),
});

export const updateLayoutSchema = z.strictObject({
  // Only honoured for super admins (branch admins cannot reassign branch).
  branchId: z.number().int().positive().optional(),
  showLogo: z.boolean().optional(),
  showBanner: z.boolean().optional(),
  sidebarPosition: z.enum(sidebarPosition).optional(),
});

export type TCreateLayoutInput = z.infer<typeof createLayoutSchema>;
export type TUpdateLayoutInput = z.infer<typeof updateLayoutSchema>;
