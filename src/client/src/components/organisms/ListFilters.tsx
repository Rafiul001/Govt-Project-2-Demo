import {
  Button,
  Input,
  ListBox,
  ListBoxItem,
  Select,
  TextField,
} from "@heroui/react";
import { ChevronDownIcon, SearchIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useBranches } from "../../hooks/useBranches";
import { useCurrentAdmin } from "../../hooks/useCurrentAdmin";
import { useMemberCategories } from "../../hooks/useMemberCategories";
import { displayTitle } from "../../lib/displayTitle";

const ALL_BRANCHES = "all";
const ALL_CATEGORIES = "all";

/**
 * Debounced search field. Owns its input text so keystrokes stay smooth and
 * never remount the field (which would drop focus). It stays mounted and adopts
 * external changes to the URL `value` (e.g. browser back/forward) during render
 * — our own debounced pushes also update `value`, but by then `text` already
 * matches, so those are no-ops and typing is never interrupted.
 */
function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const [text, setText] = useState(value);
  const [seenValue, setSeenValue] = useState(value);

  if (value !== seenValue) {
    setSeenValue(value);
    setText(value);
  }

  useEffect(() => {
    const next = text.trim();
    if (next === value) return;
    const id = setTimeout(() => onChange(next), 350);
    return () => clearTimeout(id);
  }, [text, value, onChange]);

  return (
    <TextField
      className="flex flex-1 flex-col gap-1.5"
      aria-label={placeholder}
      value={text}
      onChange={setText}
    >
      <div className="relative w-full">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <Input className="w-full pl-9" placeholder={placeholder} />
      </div>
    </TextField>
  );
}

type ListFiltersProps = {
  search?: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  /**
   * When provided, a branch filter is shown to super admins (branch admins are
   * already pinned to their own branch server-side, so it's hidden for them).
   */
  branchName?: string;
  onBranchChange?: (value: string) => void;
  /** When provided, a member-category filter is shown (members page). */
  categoryId?: number;
  onCategoryChange?: (value: number | undefined) => void;
};

/** Search box + optional branch/category filter toolbar for the list pages. */
export function ListFilters({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  branchName,
  onBranchChange,
  categoryId,
  onCategoryChange,
}: ListFiltersProps) {
  const admin = useCurrentAdmin();
  const isSuperAdmin = admin?.adminType === "SUPER_ADMIN";
  const showBranchFilter = Boolean(onBranchChange) && isSuperAdmin;
  const showCategoryFilter = Boolean(onCategoryChange);

  const branchesQuery = useBranches(
    { page: 1, pageSize: 100 },
    { enabled: showBranchFilter },
  );
  const branches = branchesQuery.data?.items ?? [];

  const categoriesQuery = useMemberCategories(
    { page: 1, pageSize: 100 },
    { enabled: showCategoryFilter },
  );
  const categories = categoriesQuery.data?.items ?? [];

  const hasActiveFilters =
    Boolean(search) || Boolean(branchName) || categoryId !== undefined;
  const clearFilters = () => {
    onSearchChange("");
    onBranchChange?.("");
    onCategoryChange?.(undefined);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <SearchInput
        value={search ?? ""}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
      />

      {showBranchFilter ? (
        <Select
          className="flex flex-col gap-1.5 sm:w-64"
          aria-label="Filter by branch"
          selectedKey={branchName ?? ALL_BRANCHES}
          onSelectionChange={(key) =>
            onBranchChange?.(key === ALL_BRANCHES ? "" : String(key))
          }
        >
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator>
              <ChevronDownIcon className="size-4" />
            </Select.Indicator>
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBoxItem id={ALL_BRANCHES}>All branches</ListBoxItem>
              {branches.map((branch) => (
                <ListBoxItem key={branch.id} id={branch.name}>
                  {branch.name}
                </ListBoxItem>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      ) : null}

      {showCategoryFilter ? (
        <Select
          className="flex flex-col gap-1.5 sm:w-56"
          aria-label="Filter by category"
          selectedKey={
            categoryId !== undefined ? String(categoryId) : ALL_CATEGORIES
          }
          onSelectionChange={(key) =>
            onCategoryChange?.(
              key == null || key === ALL_CATEGORIES ? undefined : Number(key),
            )
          }
        >
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator>
              <ChevronDownIcon className="size-4" />
            </Select.Indicator>
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBoxItem id={ALL_CATEGORIES}>All categories</ListBoxItem>
              {categories.map((category) => (
                <ListBoxItem key={category.id} id={String(category.id)}>
                  {displayTitle(category.nameBn, category.nameEn)}
                </ListBoxItem>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      ) : null}

      {hasActiveFilters ? (
        <Button
          variant="ghost"
          onPress={clearFilters}
          className="shrink-0"
          aria-label="Clear filters"
        >
          <XIcon className="size-4" />
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}
