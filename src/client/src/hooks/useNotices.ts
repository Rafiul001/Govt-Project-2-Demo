import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { apiClient } from "../api/apiClient";
import { API_URLS } from "../api/apiUrls";
import { toFormData } from "../api/formData";
import type {
  TApiResponse,
  TCreateNoticeInput,
  TNotice,
  TPageParams,
  TPaginated,
  TUpdateNoticeInput,
} from "../types";
import { queryKeys } from "./queryKeys";

/** List notices (branch-scoped, paginated server-side). */
export function useNotices(params: TPageParams) {
  return useQuery({
    queryKey: queryKeys.notices.list(params),
    queryFn: async () => {
      const res = await apiClient
        .get(API_URLS.NOTICE.LIST, { searchParams: { ...params } })
        .json<TApiResponse<TPaginated<TNotice>>>();
      return res.data;
    },
    placeholderData: keepPreviousData,
  });
}

/** Get a single notice by id. */
export function useNotice(id: number) {
  return useQuery({
    queryKey: queryKeys.notices.detail(id),
    queryFn: async () => {
      const res = await apiClient
        .get(API_URLS.NOTICE.BY_ID(id))
        .json<TApiResponse<TNotice>>();
      return res.data;
    },
    enabled: Number.isFinite(id),
  });
}

/** Create a notice (multipart, optional image + PDF). */
export function useCreateNotice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TCreateNoticeInput) => {
      const res = await apiClient
        .post(API_URLS.NOTICE.CREATE, { body: toFormData(input) })
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notices.all });
    },
  });
}

/** Update a notice (multipart, optional image + PDF). */
export function useUpdateNotice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: TUpdateNoticeInput & { id: number }) => {
      const res = await apiClient
        .patch(API_URLS.NOTICE.BY_ID(id), { body: toFormData(input) })
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: (_res, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notices.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.notices.detail(id),
      });
    },
  });
}

/** Delete a notice by id. */
export function useDeleteNotice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient
        .delete(API_URLS.NOTICE.BY_ID(id))
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notices.all });
    },
  });
}
