export const adminType = {
  SUPER_ADMIN: "SUPER_ADMIN",
  BRANCH_ADMIN: "BRANCH_ADMIN",
} as const;

export const adminTypes = Object.values(adminType);
export type TAdminTypes = (typeof adminTypes)[number];

export const tokenType = {
  ACCESS: "access",
  REFRESH: "refresh",
} as const;

export const tokenTypes = Object.values(tokenType);
export type TTokenType = (typeof tokenTypes)[number];

export interface TTokenPayload {
  /** Admin id */
  sub: number;
  adminType: TAdminTypes;
  /** Branch the admin belongs to; `null` for super admins. */
  branchId: number | null;
  type: TTokenType;
}
