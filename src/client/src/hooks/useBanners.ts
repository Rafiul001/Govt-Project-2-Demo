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
  TBanner,
  TBannerListParams,
  TCreateBannerInput,
  TPaginated,
  TUpdateBannerInput,
} from "../types";
import { queryKeys } from "./queryKeys";

/** List banners (branch-scoped, paginated, filterable by search + branch). */
export function useBanners(params: TBannerListParams) {
  return useQuery({
    queryKey: queryKeys.banners.list(params),
    queryFn: async () => {
      // Only forward defined filters so we never send `search=undefined`.
      const searchParams: Record<string, string> = {
        page: String(params.page),
        pageSize: String(params.pageSize),
      };
      if (params.search) searchParams.search = params.search;
      if (params.branchName) searchParams.branchName = params.branchName;

      const res = await apiClient
        .get(API_URLS.BANNER.LIST, { searchParams })
        .json<TApiResponse<TPaginated<TBanner>>>();
      return res.data;
    },
    placeholderData: keepPreviousData,
  });
}

/** Get a single banner by id. */
export function useBanner(id: number) {
  return useQuery({
    queryKey: queryKeys.banners.detail(id),
    queryFn: async () => {
      const res = await apiClient
        .get(API_URLS.BANNER.BY_ID(id))
        .json<TApiResponse<TBanner>>();
      return res.data;
    },
    enabled: Number.isFinite(id),
  });
}

/** Create a banner (multipart, optional image). */
export function useCreateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TCreateBannerInput) => {
      const res = await apiClient
        .post(API_URLS.BANNER.CREATE, { body: toFormData(input) })
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.banners.all });
    },
  });
}

/** Update a banner (multipart, optional image). */
export function useUpdateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: TUpdateBannerInput & { id: number }) => {
      const res = await apiClient
        .patch(API_URLS.BANNER.BY_ID(id), { body: toFormData(input) })
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: (_res, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.banners.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.banners.detail(id),
      });
    },
  });
}

/** Delete a banner by id. */
export function useDeleteBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient
        .delete(API_URLS.BANNER.BY_ID(id))
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.banners.all });
    },
  });
}
