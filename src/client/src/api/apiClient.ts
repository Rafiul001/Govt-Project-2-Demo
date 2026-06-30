import ky from "ky";
import { useAuthStore } from "../store/auth.store";
import type { TApiResponse, TLoginResult } from "../types";
import { API_URLS } from "./apiUrls";

/**
 * Bare ky instance used only to call the refresh endpoint. It deliberately has
 * no auth hooks so a failed refresh (itself a 401) can never recurse back into
 * the refresh logic below.
 */
const refreshClient = ky.create({ prefix: "/api/v1" });

/**
 * In-flight refresh, shared across requests. When several requests 401 at the
 * same time (e.g. on page load), the first starts the refresh and the rest
 * await the same promise instead of triggering a stampede of refresh calls.
 */
let refreshPromise: Promise<string | null> | null = null;

/**
 * Exchange the stored refresh token for a new token pair, persist it, and
 * return the new access token. Returns `null` if there is no refresh token or
 * the refresh fails (expired/invalid/revoked).
 */
async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) return null;

  try {
    const res = await refreshClient
      .post(API_URLS.ADMIN.REFRESH, { json: { refreshToken } })
      .json<TApiResponse<TLoginResult>>();
    if (!res.data) return null;
    useAuthStore.getState().setTokens(res.data);
    return res.data.accessToken;
  } catch {
    return null;
  }
}

/**
 * Shared ky instance for talking to the backend API.
 *
 * Requests target `/api/v1/*`, which Vite proxies to the Hono server during
 * development (see vite.config.ts). The access token from the auth store, when
 * present, is attached as a Bearer token on every request. On a `401`, the
 * client attempts a one-time token refresh and transparently retries the
 * original request; if the refresh fails, the tokens are cleared so the app
 * falls back to the unauthenticated state.
 */
export const apiClient = ky.create({
  prefix: "/api/v1",
  hooks: {
    beforeRequest: [
      ({ request }) => {
        const { accessToken } = useAuthStore.getState();
        if (accessToken) {
          request.headers.set("Authorization", `Bearer ${accessToken}`);
        }
      },
    ],
    afterResponse: [
      async ({ request, response, retryCount }) => {
        // Only attempt a refresh on the first 401 for this request; a 401 on
        // the retry means the fresh token was rejected too, so give up.
        if (response.status !== 401 || retryCount > 0) return;

        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const accessToken = await refreshPromise;

        if (!accessToken) {
          useAuthStore.getState().clearTokens();
          return;
        }

        const headers = new Headers(request.headers);
        headers.set("Authorization", `Bearer ${accessToken}`);
        return ky.retry({
          request: new Request(request, { headers }),
          code: "TOKEN_REFRESHED",
        });
      },
    ],
  },
});
