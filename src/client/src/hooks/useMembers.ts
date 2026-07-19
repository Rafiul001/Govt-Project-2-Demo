import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { keepPreviousData } from "@tanstack/react-query";
import { apiClient } from "../api/apiClient";
import { API_URLS } from "../api/apiUrls";
import { toFormData } from "../api/formData";
import { toMemberListSearchParams } from "../api/listParams";
import type {
  TApiResponse,
  TCreateMemberInput,
  TMember,
  TMemberListParams,
  TPaginated,
  TUpdateMemberInput,
} from "../types";
import { queryKeys } from "./queryKeys";

/** List members (branch-scoped, paginated, filterable by category). */
export function useMembers(params: TMemberListParams) {
  return useQuery({
    queryKey: queryKeys.members.list(params),
    queryFn: async () => {
      const res = await apiClient
        .get(API_URLS.MEMBER.LIST, {
          searchParams: toMemberListSearchParams(params),
        })
        .json<TApiResponse<TPaginated<TMember>>>();
      return res.data;
    },
    placeholderData: keepPreviousData,
  });
}

/** Get a single member by id. */
export function useMember(id: number) {
  return useQuery({
    queryKey: queryKeys.members.detail(id),
    queryFn: async () => {
      const res = await apiClient
        .get(API_URLS.MEMBER.BY_ID(id))
        .json<TApiResponse<TMember>>();
      return res.data;
    },
    enabled: Number.isFinite(id),
  });
}

/** Create a member (multipart, optional photo). */
export function useCreateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TCreateMemberInput) => {
      const res = await apiClient
        .post(API_URLS.MEMBER.CREATE, { body: toFormData(input) })
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
    },
  });
}

/** Update a member (multipart, optional photo). */
export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: TUpdateMemberInput & { id: number }) => {
      const res = await apiClient
        .patch(API_URLS.MEMBER.BY_ID(id), { body: toFormData(input) })
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: (_res, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.members.detail(id) });
    },
  });
}

/** Delete a member by id. */
export function useDeleteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient
        .delete(API_URLS.MEMBER.BY_ID(id))
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
    },
  });
}

/**
 * Download the member list as a CSV file, applying the same filters as the
 * list view (page/pageSize are ignored server-side — the whole filtered list
 * is exported). Triggers a browser download of the returned blob.
 */
export function useExportMembersCsv() {
  return useMutation({
    mutationFn: async (params: TMemberListParams) => {
      const blob = await apiClient
        .get(API_URLS.MEMBER.EXPORT_CSV, {
          searchParams: toMemberListSearchParams(params),
        })
        .blob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "members.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    },
  });
}
