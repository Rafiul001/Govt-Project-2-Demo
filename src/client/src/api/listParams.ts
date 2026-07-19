import type {
  TEventListParams,
  TListParams,
  TMemberListParams,
} from "../types";

/**
 * Build a `searchParams` object for a paginated list request, forwarding only
 * the filters that are actually set — so we never send `search=undefined` or an
 * empty `branchName` over the wire.
 */
export function toListSearchParams(
  params: TListParams,
): Record<string, string> {
  const searchParams: Record<string, string> = {
    page: String(params.page),
    pageSize: String(params.pageSize),
  };
  if (params.search) searchParams.search = params.search;
  if (params.branchName) searchParams.branchName = params.branchName;
  return searchParams;
}

/** Member list params: base filters plus the optional category filter. */
export function toMemberListSearchParams(
  params: TMemberListParams,
): Record<string, string> {
  const searchParams = toListSearchParams(params);
  if (params.categoryId) searchParams.categoryId = String(params.categoryId);
  return searchParams;
}

/** Event list params: base filters plus the optional date window. */
export function toEventListSearchParams(
  params: TEventListParams,
): Record<string, string> {
  const searchParams = toListSearchParams(params);
  if (params.from) searchParams.from = params.from;
  if (params.to) searchParams.to = params.to;
  return searchParams;
}
