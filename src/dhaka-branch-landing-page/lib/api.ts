/**
 * Server-side data layer for the public landing page.
 *
 * These run in React Server Components (server → server), so they hit the Hono
 * API's *public* GET routes directly with no auth token and no CORS concerns.
 * Everything is keyed off the branch *name* (`BRANCH_NAME`): notices and the
 * board of directors are scoped via `?branchName=`, and the branch profile is
 * resolved by matching the name in the public branch list.
 *
 * Every call is wrapped so a transient API/DB outage degrades to empty content
 * (the sections render their empty states) instead of crashing the page.
 */

import type { TBoardOfDirector, TBranch, TNotice } from "./types";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3000";

/** The branch this site represents. Override with the `BRANCH_NAME` env var. */
export const BRANCH_NAME = process.env.BRANCH_NAME ?? "Dhaka";

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

/** Branch profile (name, logo, banner, address, contact), resolved by name. */
export async function getBranch(
  name: string = BRANCH_NAME,
): Promise<TBranch | null> {
  const data = await apiGet<TPaginated<TBranch>>(`/api/v1/branch?pageSize=100`);
  return data?.items.find((b) => b.name === name) ?? null;
}

/** Published notices for the branch, newest first. */
export async function getNotices(
  name: string = BRANCH_NAME,
  pageSize = 6,
): Promise<TNotice[]> {
  const data = await apiGet<TPaginated<TNotice>>(
    `/api/v1/notice?branchName=${encodeURIComponent(name)}&pageSize=${pageSize}`,
  );
  return data?.items ?? [];
}

/** Every notice for the branch — backs the full `/notices` archive page. */
export async function getAllNotices(
  name: string = BRANCH_NAME,
): Promise<TNotice[]> {
  return getNotices(name, 100);
}

/** Board of directors for the branch, ordered by display order. */
export async function getBoardOfDirectors(
  name: string = BRANCH_NAME,
  pageSize = 12,
): Promise<TBoardOfDirector[]> {
  const data = await apiGet<TPaginated<TBoardOfDirector>>(
    `/api/v1/board-of-directors?branchName=${encodeURIComponent(name)}&pageSize=${pageSize}`,
  );
  return data?.items ?? [];
}

/** Full board of directors — backs the `/board` page. */
export async function getAllBoardOfDirectors(
  name: string = BRANCH_NAME,
): Promise<TBoardOfDirector[]> {
  return getBoardOfDirectors(name, 100);
}
