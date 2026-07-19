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
  TEvent,
  TMember,
  TMemberCategory,
  TNavMenu,
  TNotice,
} from "./types";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3000";

/**
 * Resolves which branch the current request is for from its subdomain:
 * `dhaka.example.com` → `Dhaka`, `rajshahi.example.com` → `Rajshahi`.
 *
 * The subdomain is title-cased because the public read routes match on the
 * exact branch `name` as stored in the DB ("Dhaka") while the host is
 * lowercase.
 *
 * Returns `null` when the request carries no branch subdomain — the apex
 * domain, `www`, a raw IP, or bare `localhost` — in which case the caller
 * renders the branch directory instead of a branch site. Branch subdomains
 * are required to view a branch (`dhaka.example.com`, `barishal.localhost`).
 *
 * Reading the request host opts the page into dynamic rendering, which is what
 * we want — the same code renders a different branch per host.
 */
export async function getBranchName(): Promise<string | null> {
  const host = (await headers()).get("host") ?? "";
  const hostname = host.replace(/:\d+$/, ""); // strip port

  // An IP address host (e.g. 103.132.96.122) has no subdomain — its first
  // octet must not be mistaken for a branch name.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return null;

  // A branch host has a label *before* the site's own name: 3+ labels on a
  // real domain (dhaka.example.com) or 2+ in dev (barishal.localhost). The
  // apex (example.com), bare localhost, and www carry no branch.
  const labels = hostname.split(".").filter(Boolean);
  const minLabels = labels[labels.length - 1] === "localhost" ? 2 : 3;
  if (labels.length < minLabels) return null;

  const subdomain = labels[0]!.toLowerCase();
  if (!subdomain || subdomain === "www") return null;

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

/**
 * Finds a branch in the public list by name, case-insensitively — the host is
 * lowercase while the DB name may be cased however the admin typed it
 * ("mymensingh", "Dhaka"). Callers should use the returned branch's canonical
 * `name` for the `?branchName=`-scoped queries, which match exactly.
 */
export function findBranch(
  branches: TBranch[],
  name: string,
): TBranch | null {
  const target = name.toLowerCase();
  return branches.find((b) => b.name.toLowerCase() === target) ?? null;
}

/** Branch profile (name, logo, banner, address, contact), resolved by name. */
export async function getBranch(name?: string): Promise<TBranch | null> {
  const branchName = name ?? (await getBranchName());
  if (!branchName) return null;
  const branches = await getBranches();
  return findBranch(branches, branchName);
}

/** Published notices for the branch, newest first. */
export async function getNotices(
  name?: string,
  pageSize = 6,
): Promise<TNotice[]> {
  const branchName = name ?? (await getBranchName());
  if (!branchName) return [];
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
  if (!branchName) return EMPTY_NOTICES_PAGE;
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
  if (!branchName) return [];
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
  if (!branchName) return [];
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
  if (!branchName) return [];
  const data = await apiGet<TNavMenu[]>(
    `/api/v1/nav?branchName=${encodeURIComponent(branchName)}`,
  );
  return data ?? [];
}

/**
 * A single published page resolved by its menu (+ optional sub-menu) slugs,
 * for the branch. Without `submenuSlug` it resolves the page attached
 * directly to the menu (`/:menuSlug`). Returns `null` when the page is
 * missing or unpublished (→ 404 page).
 */
export async function getDynamicPage(
  menuSlug: string,
  submenuSlug?: string | null,
  name?: string,
): Promise<TDynamicPage | null> {
  const branchName = name ?? (await getBranchName());
  if (!branchName) return null;
  return apiGet<TDynamicPage>(
    `/api/v1/nav/page?branchName=${encodeURIComponent(branchName)}` +
      `&menu=${encodeURIComponent(menuSlug)}` +
      (submenuSlug ? `&submenu=${encodeURIComponent(submenuSlug)}` : ""),
  );
}

/**
 * All member categories (global, shared by every branch), ordered by display
 * order — they drive the "Members" nav dropdown and the `/members/:slug`
 * pages.
 */
export async function getMemberCategories(): Promise<TMemberCategory[]> {
  const data = await apiGet<TPaginated<TMemberCategory>>(
    `/api/v1/member-category?pageSize=100`,
  );
  return data?.items ?? [];
}

/**
 * The branch's members of one category, resolved by the category's URL slug.
 * Private profile fields are stripped by the API for anonymous callers.
 */
export async function getMembersByCategory(
  categorySlug: string,
  name?: string,
): Promise<TMember[]> {
  const branchName = name ?? (await getBranchName());
  if (!branchName) return [];
  const data = await apiGet<TPaginated<TMember>>(
    `/api/v1/member?branchName=${encodeURIComponent(branchName)}` +
      `&categorySlug=${encodeURIComponent(categorySlug)}&pageSize=100`,
  );
  return data?.items ?? [];
}

/**
 * Published events of the branch overlapping the inclusive `from`/`to`
 * (`YYYY-MM-DD`) window — backs the `/events` month calendar; a multi-day
 * event is returned for every month it touches.
 */
export async function getEventsForRange(
  from: string,
  to: string,
  name?: string,
): Promise<TEvent[]> {
  const branchName = name ?? (await getBranchName());
  if (!branchName) return [];
  const data = await apiGet<TPaginated<TEvent>>(
    `/api/v1/event?branchName=${encodeURIComponent(branchName)}` +
      `&from=${from}&to=${to}&pageSize=100`,
  );
  return data?.items ?? [];
}

/**
 * The branch's next published events (today onwards), soonest first — backs
 * the home-page "upcoming events" section.
 */
export async function getUpcomingEvents(
  name?: string,
  limit = 3,
): Promise<TEvent[]> {
  const branchName = name ?? (await getBranchName());
  if (!branchName) return [];
  const today = new Date().toISOString().slice(0, 10);
  // The API returns the window ordered by startAt DESC; look one year ahead
  // and keep the soonest `limit` events.
  const oneYearOn = new Date();
  oneYearOn.setFullYear(oneYearOn.getFullYear() + 1);
  const data = await apiGet<TPaginated<TEvent>>(
    `/api/v1/event?branchName=${encodeURIComponent(branchName)}` +
      `&from=${today}&to=${oneYearOn.toISOString().slice(0, 10)}&pageSize=100`,
  );
  const items = data?.items ?? [];
  return items
    .sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    )
    .slice(0, limit);
}
