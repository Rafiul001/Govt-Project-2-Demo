import { Button, toast } from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import { useCurrentAdmin } from "../../../hooks/useCurrentAdmin";
import { useCreateLayout, useUpdateLayout } from "../../../hooks/useLayouts";
import { getApiErrorMessage } from "../../../lib/apiError";
import type { TLayout } from "../../../types";
import {
  createLayoutSchema,
  type TCreateLayoutForm,
} from "../../../validators";
import { BranchSelect, SelectInput, SwitchInput } from "../../formInputs";

const SIDEBAR_OPTIONS = [
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
];

type LayoutFormProps = {
  initial?: TLayout;
  onSuccess: () => void;
  onCancel: () => void;
};

export function LayoutForm({ initial, onSuccess, onCancel }: LayoutFormProps) {
  const isEdit = Boolean(initial);
  const admin = useCurrentAdmin();
  const isSuperAdmin = admin?.adminType === "SUPER_ADMIN";
  const createMutation = useCreateLayout();
  const updateMutation = useUpdateLayout();

  const form = useForm({
    defaultValues: {
      branchId: initial?.branchId ?? undefined,
      showLogo: initial?.showLogo ?? true,
      showBanner: initial?.showBanner ?? true,
      sidebarPosition: initial?.sidebarPosition ?? "right",
    } as TCreateLayoutForm,
    validators: { onChange: createLayoutSchema },
    onSubmit: async ({ value }) => {
      try {
        if (initial) {
          await updateMutation.mutateAsync({
            id: initial.id,
            showLogo: value.showLogo,
            showBanner: value.showBanner,
            sidebarPosition: value.sidebarPosition,
            branchId: isSuperAdmin ? value.branchId : undefined,
          });
          toast.success("Layout updated");
        } else {
          await createMutation.mutateAsync({
            showLogo: value.showLogo,
            showBanner: value.showBanner,
            sidebarPosition: value.sidebarPosition,
            branchId: isSuperAdmin ? value.branchId : undefined,
          });
          toast.success("Layout created");
        }
        onSuccess();
      } catch (error) {
        toast.danger(getApiErrorMessage(error));
      }
    },
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      {isSuperAdmin ? (
        <form.Field name="branchId">
          {(field) => <BranchSelect field={field} isRequired />}
        </form.Field>
      ) : null}
      <form.Field name="sidebarPosition">
        {(field) => (
          <SelectInput
            field={field}
            label="Sidebar position"
            options={SIDEBAR_OPTIONS}
            isRequired
          />
        )}
      </form.Field>
      <form.Field name="showLogo">
        {(field) => <SwitchInput field={field} label="Show logo" />}
      </form.Field>
      <form.Field name="showBanner">
        {(field) => <SwitchInput field={field} label="Show banner" />}
      </form.Field>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onPress={onCancel}>
          Cancel
        </Button>
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" variant="primary" isDisabled={isSubmitting}>
              {isEdit ? "Save changes" : "Create"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
