import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { apiClient } from "../api/apiClient";
import { API_URLS } from "../api/apiUrls";
import type {
  TApiResponse,
  TCreateLayoutInput,
  TLayout,
  TPageParams,
  TPaginated,
  TUpdateLayoutInput,
} from "../types";
import { queryKeys } from "./queryKeys";

/** List layouts (branch-scoped, paginated server-side). */
export function useLayouts(params: TPageParams) {
  return useQuery({
    queryKey: queryKeys.layouts.list(params),
    queryFn: async () => {
      const res = await apiClient
        .get(API_URLS.LAYOUT.LIST, { searchParams: { ...params } })
        .json<TApiResponse<TPaginated<TLayout>>>();
      return res.data;
    },
    placeholderData: keepPreviousData,
  });
}

/** Get a single layout by id. */
export function useLayout(id: number) {
  return useQuery({
    queryKey: queryKeys.layouts.detail(id),
    queryFn: async () => {
      const res = await apiClient
        .get(API_URLS.LAYOUT.BY_ID(id))
        .json<TApiResponse<TLayout>>();
      return res.data;
    },
    enabled: Number.isFinite(id),
  });
}

/** Create a layout (JSON body). */
export function useCreateLayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TCreateLayoutInput) => {
      const res = await apiClient
        .post(API_URLS.LAYOUT.CREATE, { json: input })
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.layouts.all });
    },
  });
}

/** Update a layout (JSON body). */
export function useUpdateLayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: TUpdateLayoutInput & { id: number }) => {
      const res = await apiClient
        .patch(API_URLS.LAYOUT.BY_ID(id), { json: input })
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: (_res, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.layouts.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.layouts.detail(id),
      });
    },
  });
}

/** Delete a layout by id. */
export function useDeleteLayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient
        .delete(API_URLS.LAYOUT.BY_ID(id))
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.layouts.all });
    },
  });
}
