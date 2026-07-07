/**
 * Server-side data layer for the public landing page.
 *
 * These run in React Server Components (server → server), so they hit the Hono
 * API's *public* GET routes directly with no auth token and no CORS concerns.
 * Everything is keyed off the branch *name*, which is derived per request from
 * the *subdomain* the visitor came in on (`dhaka.example.com` → `Dhaka`) — see
 * `getBranchName`. Notices and the board of directors are then scoped via
 * `?branchName=`, and the branch profile is resolved by matching the name in
 * the public branch list. This lets one deployment serve every branch.
 *
 * Every call is wrapped so a transient API/DB outage degrades to empty content
 * (the sections render their empty states) instead of crashing the page.
 */

import { headers } from "next/headers";
import type {
  TBanner,
  TBoardOfDirector,
  TBranch,
  TDynamicPage,
  TNavMenu,
  TNotice,
} from "./types";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3000";

/**
 * Fallback branch, used when the request carries no branch subdomain (bare
 * host, `www`, or local `localhost:3001` development). Override with the
 * `BRANCH_NAME` env var.
 */
export const BRANCH_NAME = process.env.BRANCH_NAME ?? "Dhaka";

/**
 * Resolves which branch the current request is for from its subdomain:
 * `dhaka.example.com` → `Dhaka`, `rajshahi.example.com` → `Rajshahi`.
 *
 * The subdomain is title-cased because the public read routes match on the
 * exact branch `name` as stored in the DB ("Dhaka") while the host is
 * lowercase. Falls back to `BRANCH_NAME` when there is no branch subdomain.
 *
 * Reading the request host opts the page into dynamic rendering, which is what
 * we want — the same code renders a different branch per host.
 */
export async function getBranchName(): Promise<string> {
  const host = (await headers()).get("host") ?? "";
  const hostname = host.replace(/:\d+$/, ""); // strip port
  const subdomain = hostname.split(".")[0]?.toLowerCase() ?? "";

  // An IP address host (e.g. 103.132.96.122) has no subdomain — its first
  // octet must not be mistaken for a branch name.
  const isIpHost = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);

  if (!subdomain || subdomain === "www" || subdomain === "localhost" || isIpHost) {
    return BRANCH_NAME;
  }

  return subdomain.charAt(0).toUpperCase() + subdomain.slice(1);
}

type TApiResponse<T> = { success: boolean; message: string; data: T };
type TPaginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

async function apiGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      // Always fetch fresh: dashboard edits (page content, published state,
      // deletions) must show on the public site immediately — a deleted page
      // 404s and drops out of the nav on the next request.
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as TApiResponse<T>;
    return json.data ?? null;
  } catch {
    return null;
  }
}

/** Every branch (public profiles) — backs the cross-branch "important links". */
export async function getBranches(): Promise<TBranch[]> {
  const data = await apiGet<TPaginated<TBranch>>(`/api/v1/branch?pageSize=100`);
  return data?.items ?? [];
}

/** Branch profile (name, logo, banner, address, contact), resolved by name. */
export async function getBranch(name?: string): Promise<TBranch | null> {
  const branchName = name ?? (await getBranchName());
  const branches = await getBranches();
  return branches.find((b) => b.name === branchName) ?? null;
}

/** Published notices for the branch, newest first. */
export async function getNotices(
  name?: string,
  pageSize = 6,
): Promise<TNotice[]> {
  const branchName = name ?? (await getBranchName());
  const data = await apiGet<TPaginated<TNotice>>(
    `/api/v1/notice?branchName=${encodeURIComponent(branchName)}&pageSize=${pageSize}`,
  );
  return data?.items ?? [];
}

/** One page of the notice archive, as returned by the API. */
export type TNoticesPage = TPaginated<TNotice>;

const EMPTY_NOTICES_PAGE: TNoticesPage = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
  totalPages: 1,
};

/**
 * A page of published notices for the branch — backs the `/notices` archive.
 * Search and pagination are done by the API (query params), not in the page.
 */
export async function getNoticesPage(opts: {
  search?: string;
  page?: number;
  pageSize?: number;
  name?: string;
}): Promise<TNoticesPage> {
  const branchName = opts.name ?? (await getBranchName());
  const params = new URLSearchParams({
    branchName,
    page: String(opts.page ?? 1),
    pageSize: String(opts.pageSize ?? 10),
  });
  if (opts.search) params.set("search", opts.search);

  const data = await apiGet<TPaginated<TNotice>>(`/api/v1/notice?${params}`);
  return data ?? EMPTY_NOTICES_PAGE;
}

/** Hero banners for the branch, ordered by display order. */
export async function getBanners(
  name?: string,
  pageSize = 10,
): Promise<TBanner[]> {
  const branchName = name ?? (await getBranchName());
  const data = await apiGet<TPaginated<TBanner>>(
    `/api/v1/banner?branchName=${encodeURIComponent(branchName)}&pageSize=${pageSize}`,
  );
  return data?.items ?? [];
}

/** Board of directors for the branch, ordered by display order. */
export async function getBoardOfDirectors(
  name?: string,
  pageSize = 12,
): Promise<TBoardOfDirector[]> {
  const branchName = name ?? (await getBranchName());
  const data = await apiGet<TPaginated<TBoardOfDirector>>(
    `/api/v1/board-of-directors?branchName=${encodeURIComponent(branchName)}&pageSize=${pageSize}`,
  );
  return data?.items ?? [];
}

/** Full board of directors — backs the `/board` page. */
export async function getAllBoardOfDirectors(
  name?: string,
): Promise<TBoardOfDirector[]> {
  return getBoardOfDirectors(name, 100);
}

/**
 * Published navigation tree for the branch — menus with their published
 * sub-menus. Backs the NavBar dropdowns. Empty when the branch has no
 * published pages (or on a transient API failure).
 */
export async function getNavTree(name?: string): Promise<TNavMenu[]> {
  const branchName = name ?? (await getBranchName());
  const data = await apiGet<TNavMenu[]>(
    `/api/v1/nav?branchName=${encodeURIComponent(branchName)}`,
  );
  return data ?? [];
}

/**
 * A single published page resolved by its menu + sub-menu slugs, for the
 * branch. Returns `null` when the page is missing or unpublished (→ 404 page).
 */
export async function getDynamicPage(
  menuSlug: string,
  submenuSlug: string,
  name?: string,
): Promise<TDynamicPage | null> {
  const branchName = name ?? (await getBranchName());
  return apiGet<TDynamicPage>(
    `/api/v1/nav/page?branchName=${encodeURIComponent(branchName)}` +
      `&menu=${encodeURIComponent(menuSlug)}` +
      `&submenu=${encodeURIComponent(submenuSlug)}`,
  );
}
