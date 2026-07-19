import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { apiClient } from "../api/apiClient";
import { API_URLS } from "../api/apiUrls";
import { toFormData } from "../api/formData";
import { toEventListSearchParams } from "../api/listParams";
import type {
  TApiResponse,
  TCreateEventInput,
  TEvent,
  TEventListParams,
  TPaginated,
  TUpdateEventInput,
} from "../types";
import { queryKeys } from "./queryKeys";

/** List events (branch-scoped, paginated, optional date window). */
export function useEvents(params: TEventListParams) {
  return useQuery({
    queryKey: queryKeys.events.list(params),
    queryFn: async () => {
      const res = await apiClient
        .get(API_URLS.EVENT.LIST, {
          searchParams: toEventListSearchParams(params),
        })
        .json<TApiResponse<TPaginated<TEvent>>>();
      return res.data;
    },
    placeholderData: keepPreviousData,
  });
}

/** Get a single event by id. */
export function useEvent(id: number) {
  return useQuery({
    queryKey: queryKeys.events.detail(id),
    queryFn: async () => {
      const res = await apiClient
        .get(API_URLS.EVENT.BY_ID(id))
        .json<TApiResponse<TEvent>>();
      return res.data;
    },
    enabled: Number.isFinite(id),
  });
}

/** Create an event (multipart, optional image). */
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TCreateEventInput) => {
      const res = await apiClient
        .post(API_URLS.EVENT.CREATE, { body: toFormData(input) })
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    },
  });
}

/** Update an event (multipart, optional image). */
export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: TUpdateEventInput & { id: number }) => {
      const res = await apiClient
        .patch(API_URLS.EVENT.BY_ID(id), { body: toFormData(input) })
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: (_res, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(id) });
    },
  });
}

/** Delete an event by id. */
export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient
        .delete(API_URLS.EVENT.BY_ID(id))
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    },
  });
}
