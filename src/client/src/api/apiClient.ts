import ky from "ky";
import { useAuthStore } from "../store/auth.store";

/**
 * Shared ky instance for talking to the backend API.
 *
 * Requests target `/api/v1/*`, which Vite proxies to the Hono server during
 * development (see vite.config.ts). The access token from the auth store, when
 * present, is attached as a Bearer token on every request, and a `401` response
 * clears it so the app falls back to the unauthenticated state.
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
      ({ response }) => {
        if (response.status === 401) {
          useAuthStore.getState().clearTokens();
        }
      },
    ],
  },
});
