import { Button, toast } from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import {
  useCreateMemberCategory,
  useUpdateMemberCategory,
} from "../../../hooks/useMemberCategories";
import { getApiErrorMessage } from "../../../lib/apiError";
import type { TMemberCategory } from "../../../types";
import {
  createMemberCategorySchema,
  type TCreateMemberCategoryForm,
} from "../../../validators";
import { NumberInput, TextInput } from "../../formInputs";
import { LoadingButton } from "../../molecules";

type TMemberCategoryFormProps = {
  initial?: TMemberCategory;
  onSuccess: () => void;
  onCancel: () => void;
};

/** Create/edit form for a member category (super admin only). */
export function MemberCategoryForm({
  initial,
  onSuccess,
  onCancel,
}: TMemberCategoryFormProps) {
  const isEdit = Boolean(initial);
  const createMutation = useCreateMemberCategory();
  const updateMutation = useUpdateMemberCategory();

  const form = useForm({
    defaultValues: {
      nameBn: initial?.nameBn ?? "",
      nameEn: initial?.nameEn ?? "",
      slug: initial?.slug ?? "",
      order: initial?.order,
    } as TCreateMemberCategoryForm,
    validators: { onChange: createMemberCategorySchema },
    onSubmit: async ({ value }) => {
      try {
        // Empty name strings are sent as-is: the API turns them into NULL, so
        // clearing one language of an existing name works.
        if (initial) {
          await updateMutation.mutateAsync({
            id: initial.id,
            nameBn: value.nameBn,
            nameEn: value.nameEn,
            slug: value.slug,
            order: value.order,
          });
          toast.success("Category updated");
        } else {
          await createMutation.mutateAsync({
            nameBn: value.nameBn,
            nameEn: value.nameEn,
            slug: value.slug,
            order: value.order,
          });
          toast.success("Category created");
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
      <form.Field name="nameBn">
        {(field) => <TextInput field={field} label="Name (Bangla)" />}
      </form.Field>
      <form.Field name="nameEn">
        {(field) => <TextInput field={field} label="Name (English)" />}
      </form.Field>
      <form.Field name="slug">
        {(field) => (
          <TextInput
            field={field}
            label="URL slug"
            placeholder="e.g. players"
            isRequired
          />
        )}
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
