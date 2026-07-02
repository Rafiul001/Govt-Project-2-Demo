import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { apiClient } from "../api/apiClient";
import { API_URLS } from "../api/apiUrls";
import { toListSearchParams } from "../api/listParams";
import type {
  TApiResponse,
  TCreateMenuInput,
  TListParams,
  TMenu,
  TPaginated,
  TUpdateMenuInput,
} from "../types";
import { queryKeys } from "./queryKeys";

/** List menus (branch-scoped, paginated, filterable by search + branch). */
export function useMenus(params: TListParams) {
  return useQuery({
    queryKey: queryKeys.menus.list(params),
    queryFn: async () => {
      const res = await apiClient
        .get(API_URLS.MENU.LIST, { searchParams: toListSearchParams(params) })
        .json<TApiResponse<TPaginated<TMenu>>>();
      return res.data;
    },
    placeholderData: keepPreviousData,
  });
}

/** Get a single menu by id. */
export function useMenu(id: number) {
  return useQuery({
    queryKey: queryKeys.menus.detail(id),
    queryFn: async () => {
      const res = await apiClient
        .get(API_URLS.MENU.BY_ID(id))
        .json<TApiResponse<TMenu>>();
      return res.data;
    },
    enabled: Number.isFinite(id),
  });
}

/** Create a menu (JSON). */
export function useCreateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TCreateMenuInput) => {
      const res = await apiClient
        .post(API_URLS.MENU.CREATE, { json: input })
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menus.all });
    },
  });
}

/** Update a menu (JSON). */
export function useUpdateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: TUpdateMenuInput & { id: number }) => {
      const res = await apiClient
        .patch(API_URLS.MENU.BY_ID(id), { json: input })
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: (_res, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menus.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.menus.detail(id) });
    },
  });
}

/** Delete a menu by id (cascades to its sub-menus and pages). */
export function useDeleteMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient
        .delete(API_URLS.MENU.BY_ID(id))
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menus.all });
      // A deleted menu removes its sub-menus too.
      queryClient.invalidateQueries({ queryKey: queryKeys.submenus.all });
    },
  });
}
