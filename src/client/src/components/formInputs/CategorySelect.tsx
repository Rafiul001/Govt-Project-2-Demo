import { Label, ListBox, ListBoxItem, Select } from "@heroui/react";
import type { AnyFieldApi } from "@tanstack/react-form";
import { ChevronDownIcon } from "lucide-react";
import { useMemberCategories } from "../../hooks/useMemberCategories";
import { displayTitle } from "../../lib/displayTitle";
import { getFieldError } from "../../lib/formField";
import { FieldShell } from "./FieldShell";

type TCategorySelectProps = {
  field: AnyFieldApi;
  label?: string;
  isRequired?: boolean;
};

/**
 * Member-category picker bound to a numeric TanStack Form field. Options come
 * from the (global) member-categories API.
 */
export function CategorySelect({
  field,
  label = "Category",
  isRequired,
}: TCategorySelectProps) {
  const { data, isLoading } = useMemberCategories();
  const categories = data?.items ?? [];
  const error = getFieldError(field);
  const value = field.state.value as number | undefined;

  const placeholder = isLoading
    ? "Loading categories…"
    : categories.length === 0
      ? "No categories — create one first"
      : "Select a category";

  return (
    <FieldShell error={error}>
      <Select
        className="flex flex-col gap-1.5"
        name={field.name}
        placeholder={placeholder}
        selectedKey={value != null ? String(value) : null}
        onSelectionChange={(key) =>
          field.handleChange(key == null ? undefined : Number(key))
        }
        onBlur={field.handleBlur}
        isInvalid={Boolean(error)}
        isRequired={isRequired}
        isDisabled={isLoading || categories.length === 0}
      >
        <Label>{label}</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator>
            <ChevronDownIcon className="size-4" />
          </Select.Indicator>
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {categories.map((category) => (
              <ListBoxItem key={category.id} id={String(category.id)}>
                {displayTitle(category.nameBn, category.nameEn)}
              </ListBoxItem>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
    </FieldShell>
  );
}
