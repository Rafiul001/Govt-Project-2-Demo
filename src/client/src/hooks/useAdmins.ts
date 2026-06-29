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
} from "../types";
import { queryKeys } from "./queryKeys";

/** List admins (super admin only), paginated server-side. */
export function useAdmins(params: TPageParams) {
  return useQuery({
    queryKey: queryKeys.admins.list(params),
    queryFn: async () => {
      const res = await apiClient
        .get(API_URLS.ADMIN.LIST, { searchParams: { ...params } })
        .json<TApiResponse<TPaginated<TAdmin>>>();
      return res.data;
    },
    placeholderData: keepPreviousData,
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
