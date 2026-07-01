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
import type { TBanner, TBoardOfDirector, TBranch, TNotice } from "./types";

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

  if (!subdomain || subdomain === "www" || subdomain === "localhost") {
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
      // Re-fetch at most once a minute; keeps the public site fresh without
      // hammering the API on every request.
      next: { revalidate: 60 },
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

/** Every notice for the branch — backs the full `/notices` archive page. */
export async function getAllNotices(name?: string): Promise<TNotice[]> {
  return getNotices(name, 100);
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
