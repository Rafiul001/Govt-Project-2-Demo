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
  TBranch,
  TCreateBranchInput,
  TPageParams,
  TPaginated,
  TUpdateBranchInput,
} from "../types";
import { queryKeys } from "./queryKeys";

/** List branches (super admin only), paginated server-side. */
export function useBranches(
  params: TPageParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.branches.list(params),
    queryFn: async () => {
      const res = await apiClient
        .get(API_URLS.BRANCH.LIST, { searchParams: { ...params } })
        .json<TApiResponse<TPaginated<TBranch>>>();
      return res.data;
    },
    placeholderData: keepPreviousData,
    enabled: options?.enabled,
  });
}

/** Get a single branch by id. */
export function useBranch(id: number) {
  return useQuery({
    queryKey: queryKeys.branches.detail(id),
    queryFn: async () => {
      const res = await apiClient
        .get(API_URLS.BRANCH.BY_ID(id))
        .json<TApiResponse<TBranch>>();
      return res.data;
    },
    enabled: Number.isFinite(id),
  });
}

/** Create a branch (multipart, optional logo + banner). */
export function useCreateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TCreateBranchInput) => {
      const res = await apiClient
        .post(API_URLS.BRANCH.CREATE, { body: toFormData(input) })
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.branches.all });
    },
  });
}

/** Update a branch (multipart, optional logo + banner). */
export function useUpdateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: TUpdateBranchInput & { id: number }) => {
      const res = await apiClient
        .patch(API_URLS.BRANCH.BY_ID(id), { body: toFormData(input) })
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: (_res, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.branches.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.branches.detail(id),
      });
    },
  });
}

/** Delete a branch by id. */
export function useDeleteBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient
        .delete(API_URLS.BRANCH.BY_ID(id))
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.branches.all });
    },
  });
}
