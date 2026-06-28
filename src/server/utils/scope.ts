import db from "@/server/db/client";
import { branchesTable } from "@/server/db/schemas";
import { adminType, type ITokenPayload } from "@/shared/types";
import { eq } from "drizzle-orm";

/** True when the authenticated admin is a super admin (not branch-scoped). */
export function isSuperAdmin(admin: ITokenPayload): boolean {
  return admin.adminType === adminType.SUPER_ADMIN;
}

/**
 * Resolves the branch a write should target:
 * - super admin → the `branchId` from the request body (if any)
 * - branch admin → their own `branchId` from the token (body is ignored)
 *
 * Returns `null` when it cannot be resolved (super admin omitted it, or a
 * branch admin has no branch assigned).
 */
export function resolveBranchId(
  admin: ITokenPayload,
  bodyBranchId?: number,
): number | null {
  return isSuperAdmin(admin) ? (bodyBranchId ?? null) : admin.branchId;
}

/** Whether a branch admin may access a row belonging to `rowBranchId`. */
export function canAccessBranch(
  admin: ITokenPayload,
  rowBranchId: number,
): boolean {
  return isSuperAdmin(admin) || admin.branchId === rowBranchId;
}

/** Checks that a branch with the given id exists. */
export async function branchExists(branchId: number): Promise<boolean> {
  const [row] = await db
    .select({ id: branchesTable.id })
    .from(branchesTable)
    .where(eq(branchesTable.id, branchId))
    .limit(1);
  return Boolean(row);
}
