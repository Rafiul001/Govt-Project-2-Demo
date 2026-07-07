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
  TCreateSubmenuInput,
  TPaginated,
  TSubmenu,
  TSubmenuListParams,
  TUpdateSubmenuInput,
} from "../types";
import { queryKeys } from "./queryKeys";

/** List sub-menus (branch-scoped, paginated, filterable by menu + search). */
export function useSubmenus(params: TSubmenuListParams) {
  return useQuery({
    queryKey: queryKeys.submenus.list(params),
    queryFn: async () => {
      const searchParams = toListSearchParams(params);
      if (params.menuId != null) searchParams.menuId = String(params.menuId);
      const res = await apiClient
        .get(API_URLS.SUBMENU.LIST, { searchParams })
        .json<TApiResponse<TPaginated<TSubmenu>>>();
      return res.data;
    },
    placeholderData: keepPreviousData,
  });
}

/** Get a single sub-menu by id. */
export function useSubmenu(id: number) {
  return useQuery({
    queryKey: queryKeys.submenus.detail(id),
    queryFn: async () => {
      const res = await apiClient
        .get(API_URLS.SUBMENU.BY_ID(id))
        .json<TApiResponse<TSubmenu>>();
      return res.data;
    },
    enabled: Number.isFinite(id),
  });
}

/** Create a sub-menu (JSON); the backend also creates its blank page. */
export function useCreateSubmenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TCreateSubmenuInput) => {
      const res = await apiClient
        .post(API_URLS.SUBMENU.CREATE, { json: input })
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.submenus.all });
      // If the menu had a page attached directly, the backend moved it under
      // an auto-created sub-menu — the page's attachment changed.
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.all });
    },
  });
}

/** Update a sub-menu (JSON). */
export function useUpdateSubmenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: TUpdateSubmenuInput & { id: number }) => {
      const res = await apiClient
        .patch(API_URLS.SUBMENU.BY_ID(id), { json: input })
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: (_res, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.submenus.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.submenus.detail(id),
      });
    },
  });
}

/** Delete a sub-menu by id (cascades to its page). */
export function useDeleteSubmenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient
        .delete(API_URLS.SUBMENU.BY_ID(id))
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.submenus.all });
    },
  });
}
