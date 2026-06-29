import { QueryClient } from "@tanstack/react-query";

/** Shared TanStack Query client, provided at the app root. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 1 minute
      retry: 1,
    },
  },
});
