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
  TBoardOfDirector,
  TCreateBoardOfDirectorInput,
  TPageParams,
  TPaginated,
  TUpdateBoardOfDirectorInput,
} from "../types";
import { queryKeys } from "./queryKeys";

/** List board of directors (branch-scoped, paginated server-side). */
export function useBoardOfDirectors(params: TPageParams) {
  return useQuery({
    queryKey: queryKeys.boardOfDirectors.list(params),
    queryFn: async () => {
      const res = await apiClient
        .get(API_URLS.BOARD_OF_DIRECTORS.LIST, { searchParams: { ...params } })
        .json<TApiResponse<TPaginated<TBoardOfDirector>>>();
      return res.data;
    },
    placeholderData: keepPreviousData,
  });
}

/** Get a single board of director by id. */
export function useBoardOfDirector(id: number) {
  return useQuery({
    queryKey: queryKeys.boardOfDirectors.detail(id),
    queryFn: async () => {
      const res = await apiClient
        .get(API_URLS.BOARD_OF_DIRECTORS.BY_ID(id))
        .json<TApiResponse<TBoardOfDirector>>();
      return res.data;
    },
    enabled: Number.isFinite(id),
  });
}

/** Create a board of director (multipart, optional avatar). */
export function useCreateBoardOfDirector() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TCreateBoardOfDirectorInput) => {
      const res = await apiClient
        .post(API_URLS.BOARD_OF_DIRECTORS.CREATE, { body: toFormData(input) })
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.boardOfDirectors.all,
      });
    },
  });
}

/** Update a board of director (multipart, optional avatar). */
export function useUpdateBoardOfDirector() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: TUpdateBoardOfDirectorInput & { id: number }) => {
      const res = await apiClient
        .patch(API_URLS.BOARD_OF_DIRECTORS.BY_ID(id), {
          body: toFormData(input),
        })
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: (_res, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.boardOfDirectors.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.boardOfDirectors.detail(id),
      });
    },
  });
}

/** Delete a board of director by id. */
export function useDeleteBoardOfDirector() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient
        .delete(API_URLS.BOARD_OF_DIRECTORS.BY_ID(id))
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.boardOfDirectors.all,
      });
    },
  });
}
