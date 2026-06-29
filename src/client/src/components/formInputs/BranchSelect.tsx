import { Label, ListBox, ListBoxItem, Select } from "@heroui/react";
import type { AnyFieldApi } from "@tanstack/react-form";
import { ChevronDownIcon } from "lucide-react";
import { useBranches } from "../../hooks/useBranches";
import { getFieldError } from "../../lib/formField";
import { FieldShell } from "./FieldShell";

type TBranchSelectProps = {
  field: AnyFieldApi;
  label?: string;
  isRequired?: boolean;
};

/**
 * Branch picker bound to a numeric TanStack Form field. Options come from the
 * branches API (super-admin only, which is the only context this is shown in).
 */
export function BranchSelect({
  field,
  label = "Branch",
  isRequired,
}: TBranchSelectProps) {
  const { data, isLoading } = useBranches({ page: 1, pageSize: 100 });
  const branches = data?.items ?? [];
  const error = getFieldError(field);
  const value = field.state.value as number | undefined;

  const placeholder = isLoading
    ? "Loading branches…"
    : branches.length === 0
      ? "No branches — create one first"
      : "Select a branch";

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
        isDisabled={isLoading || branches.length === 0}
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
            {branches.map((branch) => (
              <ListBoxItem key={branch.id} id={String(branch.id)}>
                {branch.name}
              </ListBoxItem>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
    </FieldShell>
  );
}
