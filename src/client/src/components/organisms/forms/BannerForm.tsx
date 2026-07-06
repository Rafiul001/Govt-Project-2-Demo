import { Button, toast } from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import { useCreateBanner, useUpdateBanner } from "../../../hooks/useBanners";
import { useCurrentAdmin } from "../../../hooks/useCurrentAdmin";
import { getApiErrorMessage } from "../../../lib/apiError";
import { filePatch, fileRemoved } from "../../../lib/fileField";
import type { TBanner } from "../../../types";
import {
  createBannerSchema,
  type TCreateBannerForm,
} from "../../../validators";
import {
  BranchSelect,
  FileInput,
  NumberInput,
  TextInput,
} from "../../formInputs";

type TBannerFormProps = {
  initial?: TBanner;
  onSuccess: () => void;
  onCancel: () => void;
};

export function BannerForm({ initial, onSuccess, onCancel }: TBannerFormProps) {
  const isEdit = Boolean(initial);
  const admin = useCurrentAdmin();
  const isSuperAdmin = admin?.adminType === "SUPER_ADMIN";
  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();

  const form = useForm({
    defaultValues: {
      branchId: initial?.branchId ?? undefined,
      title: initial?.title ?? "",
      subTitle: initial?.subTitle ?? "",
      order: initial?.order,
      image: undefined,
    } as TCreateBannerForm,
    validators: { onChange: createBannerSchema },
    onSubmit: async ({ value }) => {
      try {
        if (initial) {
          await updateMutation.mutateAsync({
            id: initial.id,
            title: value.title,
            subTitle: value.subTitle,
            order: value.order,
            image: filePatch(value.image),
            removeImage: fileRemoved(value.image),
            branchId: isSuperAdmin ? value.branchId : undefined,
          });
          toast.success("Banner updated");
        } else {
          await createMutation.mutateAsync({
            title: value.title,
            subTitle: value.subTitle,
            order: value.order,
            image: filePatch(value.image),
            branchId: isSuperAdmin ? value.branchId : undefined,
          });
          toast.success("Banner created");
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
      <form.Field name="title">
        {(field) => <TextInput field={field} label="Title" isRequired />}
      </form.Field>
      <form.Field name="subTitle">
        {(field) => <TextInput field={field} label="Subtitle" isRequired />}
      </form.Field>
      <form.Field name="order">
        {(field) => <NumberInput field={field} label="Display order" min={0} />}
      </form.Field>
      {isSuperAdmin ? (
        <form.Field name="branchId">
          {(field) => <BranchSelect field={field} isRequired />}
        </form.Field>
      ) : null}
      <form.Field name="image">
        {(field) => (
          <FileInput
            field={field}
            label="Image"
            accept="image/*"
            existingUrl={initial?.image}
          />
        )}
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
