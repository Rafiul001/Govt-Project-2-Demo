import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HTTPError } from "ky";
import { apiClient } from "../api/apiClient";
import { API_URLS } from "../api/apiUrls";
import { toFormData } from "../api/formData";
import type {
  TApiResponse,
  TCreatePageInput,
  TPage,
  TUpdatePageInput,
} from "../types";
import { queryKeys } from "./queryKeys";

/** Get the page that belongs to a sub-menu (backs the page editor). */
export function usePageBySubmenu(submenuId: number) {
  return useQuery({
    queryKey: queryKeys.pages.bySubmenu(submenuId),
    queryFn: async () => {
      const res = await apiClient
        .get(API_URLS.PAGE.BY_SUBMENU(submenuId))
        .json<TApiResponse<TPage>>();
      return res.data;
    },
    enabled: Number.isFinite(submenuId),
  });
}

/**
 * Get the page attached directly to a menu (menus without sub-menus).
 * Resolves to `null` when the menu has no direct page — a normal state, not
 * an error — so callers can offer "Add page".
 */
export function usePageByMenu(menuId: number) {
  return useQuery({
    queryKey: queryKeys.pages.byMenu(menuId),
    queryFn: async (): Promise<TPage | null> => {
      try {
        const res = await apiClient
          .get(API_URLS.PAGE.BY_MENU(menuId))
          .json<TApiResponse<TPage>>();
        return res.data;
      } catch (error) {
        if (error instanceof HTTPError && error.response.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: Number.isFinite(menuId),
  });
}

/** Create a page attached directly to a menu (JSON). */
export function useCreatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TCreatePageInput) => {
      const res = await apiClient
        .post(API_URLS.PAGE.CREATE, { json: input })
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.all });
    },
  });
}

/** Delete a menu-attached page (sub-menu pages die with their sub-menu). */
export function useDeletePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient
        .delete(API_URLS.PAGE.BY_ID(id))
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.all });
    },
  });
}

/** Upload an image for a page's markdown content; resolves to its URL. */
export function useUploadPageImage() {
  return useMutation({
    mutationFn: async ({ id, image }: { id: number; image: File }) => {
      const res = await apiClient
        .post(API_URLS.PAGE.IMAGE(id), { body: toFormData({ image }) })
        .json<TApiResponse<{ url: string }>>();
      return res.data;
    },
  });
}

/**
 * Import an image referenced by pasted markdown (remote URL or data URI) into
 * Cloudinary; resolves to the imported URL the editor should embed instead.
 */
export function useImportPageImage() {
  return useMutation({
    mutationFn: async ({ id, url }: { id: number; url: string }) => {
      const res = await apiClient
        .post(API_URLS.PAGE.IMAGE_IMPORT(id), { json: { url } })
        .json<TApiResponse<{ url: string }>>();
      return res.data;
    },
  });
}

/** Update a page (multipart, optional banner image). */
export function useUpdatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: TUpdatePageInput & { id: number }) => {
      const res = await apiClient
        .patch(API_URLS.PAGE.BY_ID(id), { body: toFormData(input) })
        .json<TApiResponse<null>>();
      return res;
    },
    onSuccess: () => {
      // pages.all covers the by-submenu detail key too.
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.all });
      // Publishing/unpublishing changes what the public nav shows.
      queryClient.invalidateQueries({ queryKey: queryKeys.submenus.all });
    },
  });
}
