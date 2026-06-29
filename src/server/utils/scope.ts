import db from "@/server/db/client";
import { branchesTable } from "@/server/db/schemas";
import { adminType, type TTokenPayload } from "@/shared/types";
import { eq } from "drizzle-orm";

/** True when the authenticated admin is a super admin (not branch-scoped). */
export function isSuperAdmin(admin: TTokenPayload): boolean {
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
  admin: TTokenPayload,
  bodyBranchId?: number,
): number | null {
  return isSuperAdmin(admin) ? (bodyBranchId ?? null) : admin.branchId;
}

/**
 * Resolves a branch reassignment on an UPDATE. Only super admins may move a row
 * to another branch; for branch admins the requested value is ignored.
 *
 * Returns the new branchId to apply, or `undefined` when no change should be
 * made (branch admin, or super admin who didn't send one).
 */
export function resolveBranchUpdate(
  admin: TTokenPayload,
  bodyBranchId?: number,
): number | undefined {
  return isSuperAdmin(admin) ? bodyBranchId : undefined;
}

/** Whether a branch admin may access a row belonging to `rowBranchId`. */
export function canAccessBranch(
  admin: TTokenPayload,
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
