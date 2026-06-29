import type { TPageParams } from "../types";

/** Centralized TanStack Query keys, so queries and invalidations stay in sync. */
export const queryKeys = {
  admins: {
    all: ["admins"] as const,
    list: (params: TPageParams) => ["admins", "list", params] as const,
  },
  branches: {
    all: ["branches"] as const,
    list: (params: TPageParams) => ["branches", "list", params] as const,
    detail: (id: number | string) => ["branches", id] as const,
  },
  boardOfDirectors: {
    all: ["board-of-directors"] as const,
    list: (params: TPageParams) =>
      ["board-of-directors", "list", params] as const,
    detail: (id: number | string) => ["board-of-directors", id] as const,
  },
  layouts: {
    all: ["layouts"] as const,
    list: (params: TPageParams) => ["layouts", "list", params] as const,
    detail: (id: number | string) => ["layouts", id] as const,
  },
  notices: {
    all: ["notices"] as const,
    list: (params: TPageParams) => ["notices", "list", params] as const,
    detail: (id: number | string) => ["notices", id] as const,
  },
} as const;
