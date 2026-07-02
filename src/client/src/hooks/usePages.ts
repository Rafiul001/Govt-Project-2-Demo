import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/apiClient";
import { API_URLS } from "../api/apiUrls";
import { toFormData } from "../api/formData";
import type { TApiResponse, TPage, TUpdatePageInput } from "../types";
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
