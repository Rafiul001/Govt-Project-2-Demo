import type { TListParams, TPageParams } from "../types";

/** Centralized TanStack Query keys, so queries and invalidations stay in sync. */
export const queryKeys = {
  admins: {
    all: ["admins"] as const,
    list: (params: TListParams) => ["admins", "list", params] as const,
  },
  branches: {
    all: ["branches"] as const,
    list: (params: TPageParams) => ["branches", "list", params] as const,
    detail: (id: number | string) => ["branches", id] as const,
  },
  boardOfDirectors: {
    all: ["board-of-directors"] as const,
    list: (params: TListParams) =>
      ["board-of-directors", "list", params] as const,
    detail: (id: number | string) => ["board-of-directors", id] as const,
  },
  notices: {
    all: ["notices"] as const,
    list: (params: TListParams) => ["notices", "list", params] as const,
    detail: (id: number | string) => ["notices", id] as const,
  },
  banners: {
    all: ["banners"] as const,
    list: (params: TListParams) => ["banners", "list", params] as const,
    detail: (id: number | string) => ["banners", id] as const,
  },
} as const;
