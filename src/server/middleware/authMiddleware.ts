import { forbidden, unAuthorized } from "@/server/responses";
import type { TAppEnv } from "@/server/types";
import { verifyAccessToken } from "@/server/utils/jwt";
import { tokenType, type TAdminTypes } from "@/shared/types";
import type { Context, MiddlewareHandler } from "hono";

function extractToken(c: Context): string | undefined {
  const header = c.req.header("Authorization");
  if (header?.startsWith("Bearer ")) {
    return header.slice("Bearer ".length).trim();
  }
  return undefined;
}

/**
 * Authenticates the request via the access token (`Authorization: Bearer`
 * header) and attaches the admin payload to the context.
 *
 * @param allowedTypes Admin types permitted to access the route. When empty,
 *   any authenticated admin is allowed.
 */
export function authMiddleware(
  allowedTypes: TAdminTypes[] = [],
): MiddlewareHandler<TAppEnv> {
  return async (c, next) => {
    const token = extractToken(c);
    if (!token) {
      return unAuthorized(c);
    }

    let payload;
    try {
      payload = await verifyAccessToken(token);
    } catch (err) {
      const expired = err instanceof Error && err.name === "JwtTokenExpired";
      return unAuthorized(
        c,
        expired ? "Access token expired" : "Invalid access token",
      );
    }

    if (payload.type !== tokenType.ACCESS) {
      return unAuthorized(c, "Invalid access token");
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(payload.adminType)) {
      return forbidden(c, "You do not have permission to access this resource");
    }

    c.set("admin", payload);
    await next();
  };
}
