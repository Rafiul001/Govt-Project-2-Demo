import { Pagination } from "@heroui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

type TablePaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  onChange: (page: number) => void;
};

/** Page-number pager driven by the route's search params. */
export function TablePagination({
  page,
  totalPages,
  total,
  onChange,
}: TablePaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-sm text-(--muted)">{total} item(s)</span>
      <Pagination>
        <Pagination.Content>
          <Pagination.Item>
            <Pagination.Previous
              isDisabled={page <= 1}
              onPress={() => onChange(page - 1)}
            >
              <ChevronLeftIcon className="size-4" />
            </Pagination.Previous>
          </Pagination.Item>
          {pages.map((value) => (
            <Pagination.Item key={value}>
              <Pagination.Link
                isActive={value === page}
                onPress={() => onChange(value)}
              >
                {value}
              </Pagination.Link>
            </Pagination.Item>
          ))}
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
