import type { ITokenPayload } from "@/shared/types";

/**
 * Hono environment shared across the server. The authenticated admin's token
 * payload is attached to the context by `authMiddleware`.
 */
export type TAppEnv = {
  Variables: {
    admin: ITokenPayload;
  };
};
