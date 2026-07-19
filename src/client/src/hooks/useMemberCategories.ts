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
  TCreateMemberCategoryInput,
  TMemberCategory,
  TPageParams,
  TPaginated,
  TUpdateMemberCategoryInput,
} from "../types";
import { queryKeys } from "./queryKeys";

/** List member categories (global, paginated). */
export function useMemberCategories(
  params: TPageParams = { page: 1, pageSize: 100 },
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: queryKeys.memberCategories.list(params),
    queryFn: async () => {
      const res = await apiClient
        .get(API_URLS.MEMBER_CATEGORY.LIST, {
          searchParams: {
            page: String(params.page),
            pageSize: String(params.pageSize),
          },
        })
        .json<TApiResponse<TPaginated<TMemberCategory>>>();
      return res.data;
    },
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}

/** Create a member category (JSON body; super admin only). */
export function useCreateMemberCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TCreateMemberCategoryInput) => {
      const res = await apiClient
        .post(API_URLS.MEMBER_CATEGORY.CREATE, { json: input })
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.memberCategories.all,
      });
    },
  });
}

/** Update a member category (JSON body; super admin only). */
export function useUpdateMemberCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: TUpdateMemberCategoryInput & { id: number }) => {
      const res = await apiClient
        .patch(API_URLS.MEMBER_CATEGORY.BY_ID(id), { json: input })
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.memberCategories.all,
      });
    },
  });
}

/** Delete a member category (refused while it still has members). */
export function useDeleteMemberCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient
        .delete(API_URLS.MEMBER_CATEGORY.BY_ID(id))
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.memberCategories.all,
      });
    },
  });
}
