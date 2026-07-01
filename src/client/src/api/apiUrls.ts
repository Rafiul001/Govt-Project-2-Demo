/**
 * API endpoint paths, relative to the ky `prefixUrl` (`/api/v1`).
 *
 * Paths are intentionally written without a leading slash so ky resolves them
 * against the prefix. Routes with a dynamic `:id` are exposed as functions.
 */
export const API_URLS = {
  ADMIN: {
    LOGIN: "admin/login",
    LOGOUT: "admin/logout",
    REFRESH: "admin/refresh",
    LIST: "admin",
    CREATE: "admin",
    ME: "admin/me",
    BY_ID: (id: number | string) => `admin/${id}`,
  },
  BRANCH: {
    LIST: "branch",
    CREATE: "branch",
    BY_ID: (id: number | string) => `branch/${id}`,
  },
  BOARD_OF_DIRECTORS: {
    LIST: "board-of-directors",
    CREATE: "board-of-directors",
    BY_ID: (id: number | string) => `board-of-directors/${id}`,
  },
  NOTICE: {
    LIST: "notice",
    CREATE: "notice",
    BY_ID: (id: number | string) => `notice/${id}`,
  },
  BANNER: {
    LIST: "banner",
    CREATE: "banner",
    BY_ID: (id: number | string) => `banner/${id}`,
  },
} as const;
