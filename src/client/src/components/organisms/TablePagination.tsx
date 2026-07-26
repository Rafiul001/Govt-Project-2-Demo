import { Pagination } from "@heroui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

type TablePaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  onChange: (page: number) => void;
};

/**
 * The page numbers to render: all of them while they fit, otherwise the first,
 * the last, and a window around the current page, with `null` marking a gap.
 *
 * Previously every page got a button, so a list of any size pushed the pager
 * far past a phone's width.
 */
function pageNumbers(current: number, total: number): (number | null)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }
  const wanted = [1, current - 1, current, current + 1, total]
    .filter((value) => value >= 1 && value <= total)
    .sort((a, b) => a - b);

  const result: (number | null)[] = [];
  let previous = 0;
  for (const value of wanted) {
    if (value === previous) continue;
    if (value - previous > 1) result.push(null);
    result.push(value);
    previous = value;
  }
  return result;
}

/** Page-number pager driven by the route's search params. */
export function TablePagination({
  page,
  totalPages,
  total,
  onChange,
}: TablePaginationProps) {
  return (
    <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <span className="text-sm text-muted">{total} item(s)</span>
      <Pagination>
        <Pagination.Content className="flex-wrap">
          <Pagination.Item>
            <Pagination.Previous
              isDisabled={page <= 1}
              onPress={() => onChange(page - 1)}
            >
              <ChevronLeftIcon className="size-4" />
            </Pagination.Previous>
          </Pagination.Item>
          {pageNumbers(page, totalPages).map((value, index) =>
            value === null ? (
              <Pagination.Item key={`gap-${index}`}>
                <span className="px-2 text-sm text-muted">…</span>
              </Pagination.Item>
            ) : (
              <Pagination.Item key={value}>
                <Pagination.Link
                  isActive={value === page}
                  onPress={() => onChange(value)}
                >
                  {value}
                </Pagination.Link>
              </Pagination.Item>
            ),
          )}
          <Pagination.Item>
            <Pagination.Next
              isDisabled={page >= totalPages}
              onPress={() => onChange(page + 1)}
            >
              <ChevronRightIcon className="size-4" />
            </Pagination.Next>
          </Pagination.Item>
        </Pagination.Content>
      </Pagination>
    </div>
  );
}
