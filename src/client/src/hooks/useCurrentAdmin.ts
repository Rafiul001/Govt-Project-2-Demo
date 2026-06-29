import { decodeAdminToken, type TDecodedAdmin } from "../lib/token";
import { useAuthStore } from "../store/auth.store";

export type TCurrentAdmin = TDecodedAdmin;

/** The currently authenticated admin, derived from the stored access token. */
export function useCurrentAdmin(): TCurrentAdmin | null {
  const accessToken = useAuthStore((state) => state.accessToken);
  return decodeAdminToken(accessToken);
}
