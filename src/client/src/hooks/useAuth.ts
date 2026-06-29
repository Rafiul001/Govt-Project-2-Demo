import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../api/apiClient";
import { API_URLS } from "../api/apiUrls";
import { useAuthStore } from "../store/auth.store";
import type { TApiResponse, TLoginInput, TLoginResult } from "../types";

/** Log in and persist the returned tokens in the auth store. */
export function useLogin() {
  const setTokens = useAuthStore((state) => state.setTokens);

  return useMutation({
    mutationFn: async (input: TLoginInput) => {
      const res = await apiClient
        .post(API_URLS.ADMIN.LOGIN, { json: input })
        .json<TApiResponse<TLoginResult>>();
      return res.data;
    },
    onSuccess: (tokens) => setTokens(tokens),
  });
}

/** Log out: notify the server (best effort) and clear the local tokens. */
export function useLogout() {
  const clearTokens = useAuthStore((state) => state.clearTokens);

  return useMutation({
    mutationFn: async () => {
      await apiClient.post(API_URLS.ADMIN.LOGOUT);
    },
    // Auth is stateless, so drop the tokens regardless of the request outcome.
    onSettled: () => clearTokens(),
  });
}
