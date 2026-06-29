import type { TAdminType } from "../types";

export type TDecodedAdmin = {
  id: number;
  adminType: TAdminType;
  branchId: number | null;
};

/**
 * Decode the JWT payload without verification (UX/routing only — the server
 * still enforces auth). Returns null if the token is missing or malformed.
 */
export function decodeAdminToken(token: string | null): TDecodedAdmin | null {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = JSON.parse(atob(payload)) as {
      sub: number;
      adminType: TAdminType;
      branchId: number | null;
    };
    return {
      id: json.sub,
      adminType: json.adminType,
      branchId: json.branchId ?? null,
    };
  } catch {
    return null;
  }
}
