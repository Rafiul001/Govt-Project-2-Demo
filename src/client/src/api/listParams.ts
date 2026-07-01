import type { TListParams } from "../types";

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
