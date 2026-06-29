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
  TAdmin,
  TApiResponse,
  TCreateAdminInput,
  TPageParams,
  TPaginated,
  TUpdateAdminInput,
  TUpdateProfileInput,
} from "../types";
import { queryKeys } from "./queryKeys";

/** List admins (super admin only), paginated server-side. */
export function useAdmins(
  params: TPageParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.admins.list(params),
    queryFn: async () => {
      const res = await apiClient
        .get(API_URLS.ADMIN.LIST, { searchParams: { ...params } })
        .json<TApiResponse<TPaginated<TAdmin>>>();
      return res.data;
    },
    placeholderData: keepPreviousData,
    enabled: options?.enabled,
  });
}

/** Create a new admin (multipart, optional avatar). */
export function useCreateAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TCreateAdminInput) => {
      const res = await apiClient
        .post(API_URLS.ADMIN.CREATE, { body: toFormData(input) })
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admins.all });
    },
  });
}

/** Update a branch admin (super admin only; multipart, optional avatar). */
export function useUpdateAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: TUpdateAdminInput & { id: number }) => {
      const res = await apiClient
        .patch(API_URLS.ADMIN.BY_ID(id), { body: toFormData(input) })
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admins.all });
    },
  });
}

/** Delete a branch admin by id (super admin only). */
export function useDeleteAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient
        .delete(API_URLS.ADMIN.BY_ID(id))
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admins.all });
    },
  });
}

/** Update the current admin's own account (password and/or avatar). */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TUpdateProfileInput) => {
      const res = await apiClient
        .patch(API_URLS.ADMIN.ME, { body: toFormData(input) })
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admins.all });
    },
  });
}
