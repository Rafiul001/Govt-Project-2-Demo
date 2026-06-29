/** Offset for a 1-based page. */
export function pageOffset(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}

/** Standard paginated payload returned by list endpoints. */
export function paginated<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
) {
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
