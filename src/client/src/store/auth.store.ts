import { create } from "zustand";
import { persist } from "zustand/middleware";

type TTokens = {
  accessToken: string;
  refreshToken: string;
};

type TAuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  /** Store the tokens returned by a successful login. */
  setTokens: (tokens: TTokens) => void;
  /** Discard the tokens (logout). Auth is stateless, so this is client-side. */
  clearTokens: () => void;
};

/**
 * Holds the JWT access/refresh tokens, persisted to localStorage so the session
 * survives a page reload. The backend auth is stateless, so the client is the
 * sole owner of these tokens.
 */
export const useAuthStore = create<TAuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      setTokens: ({ accessToken, refreshToken }) =>
        set({ accessToken, refreshToken }),
      clearTokens: () => set({ accessToken: null, refreshToken: null }),
    }),
    { name: "auth" },
  ),
);

/** Convenience selector: whether an access token is currently held. */
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.accessToken !== null);
