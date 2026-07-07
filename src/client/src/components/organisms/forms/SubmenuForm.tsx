import { Button, toast } from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import { useCreateSubmenu, useUpdateSubmenu } from "../../../hooks/useSubmenus";
import { getApiErrorMessage } from "../../../lib/apiError";
import type { TMenu, TSubmenu } from "../../../types";
import {
  createSubmenuSchema,
  type TCreateSubmenuForm,
} from "../../../validators";
import { NumberInput, TextInput } from "../../formInputs";
import { LoadingButton } from "../../molecules";

type TSubmenuFormProps = {
  /** Parent menu — supplies the menuId and branchId for the sub-menu. */
  menu: TMenu;
  initial?: TSubmenu;
  onSuccess: () => void;
  onCancel: () => void;
};

/**
 * Create/edit a sub-menu under `menu`. Creating one also creates its (blank,
 * unpublished) page on the server, edited later from the page editor.
 */
export function SubmenuForm({
  menu,
  initial,
  onSuccess,
  onCancel,
}: TSubmenuFormProps) {
  const isEdit = Boolean(initial);
  const createMutation = useCreateSubmenu();
  const updateMutation = useUpdateSubmenu();

  const form = useForm({
    defaultValues: {
      branchId: menu.branchId,
      menuId: menu.id,
      titleBn: initial?.titleBn ?? "",
      titleEn: initial?.titleEn ?? "",
      order: initial?.order,
    } as TCreateSubmenuForm,
    validators: { onChange: createSubmenuSchema },
    onSubmit: async ({ value }) => {
      try {
        if (initial) {
          await updateMutation.mutateAsync({
            id: initial.id,
            titleBn: value.titleBn,
            titleEn: value.titleEn,
            order: value.order,
          });
          toast.success("Sub-menu updated");
        } else {
          const res = await createMutation.mutateAsync({
            branchId: menu.branchId,
            menuId: menu.id,
            titleBn: value.titleBn,
            titleEn: value.titleEn,
            order: value.order,
          });
          // The server notes when the menu's direct page was moved under an
          // auto-created sub-menu as part of this create.
          toast.success(res.message || "Sub-menu created");
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
