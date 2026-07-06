import { Button, toast } from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import { useCurrentAdmin } from "../../../hooks/useCurrentAdmin";
import { useCreateMenu, useUpdateMenu } from "../../../hooks/useMenus";
import { getApiErrorMessage } from "../../../lib/apiError";
import type { TMenu } from "../../../types";
import { createMenuSchema, type TCreateMenuForm } from "../../../validators";
import { BranchSelect, NumberInput, TextInput } from "../../formInputs";
import { LoadingButton } from "../../molecules";

type TMenuFormProps = {
  initial?: TMenu;
  onSuccess: () => void;
  onCancel: () => void;
};

/** Create/edit a top-level menu. The URL slug is derived from the title. */
export function MenuForm({ initial, onSuccess, onCancel }: TMenuFormProps) {
  const isEdit = Boolean(initial);
  const admin = useCurrentAdmin();
  const isSuperAdmin = admin?.adminType === "SUPER_ADMIN";
  const createMutation = useCreateMenu();
  const updateMutation = useUpdateMenu();

  const form = useForm({
    defaultValues: {
      branchId: initial?.branchId ?? undefined,
      titleBn: initial?.titleBn ?? "",
      titleEn: initial?.titleEn ?? "",
      order: initial?.order,
    } as TCreateMenuForm,
    validators: { onChange: createMenuSchema },
    onSubmit: async ({ value }) => {
      try {
        if (initial) {
          await updateMutation.mutateAsync({
            id: initial.id,
            titleBn: value.titleBn,
            titleEn: value.titleEn,
            order: value.order,
            branchId: isSuperAdmin ? value.branchId : undefined,
          });
          toast.success("Menu updated");
        } else {
          await createMutation.mutateAsync({
            titleBn: value.titleBn,
            titleEn: value.titleEn,
            order: value.order,
            branchId: isSuperAdmin ? value.branchId : undefined,
          });
          toast.success("Menu created");
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
      <form.Field name="titleBn">
        {(field) => <TextInput field={field} label="Title (বাংলা)" />}
      </form.Field>
      <form.Field name="titleEn">
        {(field) => <TextInput field={field} label="Title (English)" />}
      </form.Field>
      <form.Field name="order">
        {(field) => <NumberInput field={field} label="Display order" min={0} />}
      </form.Field>
      {isSuperAdmin ? (
        <form.Field name="branchId">
          {(field) => <BranchSelect field={field} isRequired />}
        </form.Field>
      ) : null}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onPress={onCancel}>
          Cancel
        </Button>
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <LoadingButton
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              {isEdit ? "Save changes" : "Create"}
            </LoadingButton>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
