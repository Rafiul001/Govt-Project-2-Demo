import { Button, toast } from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import { useCreateBranch, useUpdateBranch } from "../../../hooks/useBranches";
import { getApiErrorMessage } from "../../../lib/apiError";
import { filePatch, fileRemoved } from "../../../lib/fileField";
import type { TBranch } from "../../../types";
import {
  createBranchSchema,
  type TCreateBranchForm,
} from "../../../validators";
import { FileInput, TextInput } from "../../formInputs";

type TBranchFormProps = {
  initial?: TBranch;
  onSuccess: () => void;
  onCancel: () => void;
};

export function BranchForm({ initial, onSuccess, onCancel }: TBranchFormProps) {
  const isEdit = Boolean(initial);
  const createMutation = useCreateBranch();
  const updateMutation = useUpdateBranch();

  const form = useForm({
    defaultValues: {
      name: initial?.name ?? "",
      previewUrl: initial?.previewUrl ?? "",
      address: initial?.address ?? "",
      phone: initial?.phone ?? "",
      email: initial?.email ?? "",
      logo: undefined,
      banner: undefined,
    } as TCreateBranchForm,
    validators: { onChange: createBranchSchema },
    onSubmit: async ({ value }) => {
      try {
        const payload = {
          name: value.name,
          previewUrl: value.previewUrl,
          address: value.address,
          phone: value.phone || undefined,
          email: value.email || undefined,
          logo: filePatch(value.logo),
          banner: filePatch(value.banner),
        };
        if (initial) {
          await updateMutation.mutateAsync({
            id: initial.id,
            ...payload,
            removeLogo: fileRemoved(value.logo),
            removeBanner: fileRemoved(value.banner),
          });
          toast.success("Branch updated");
        } else {
          await createMutation.mutateAsync(payload);
          toast.success("Branch created");
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
      <form.Field name="name">
        {(field) => <TextInput field={field} label="Name" isRequired />}
      </form.Field>
      <form.Field name="previewUrl">
        {(field) => (
          <TextInput
            field={field}
            label="Preview URL"
            placeholder="https://dhaka.example.com"
            isRequired
          />
        )}
      </form.Field>
      <form.Field name="address">
        {(field) => <TextInput field={field} label="Address" isRequired />}
      </form.Field>
      <form.Field name="phone">
        {(field) => <TextInput field={field} label="Phone" />}
      </form.Field>
      <form.Field name="email">
        {(field) => <TextInput field={field} label="Email" type="email" />}
      </form.Field>
      <form.Field name="logo">
        {(field) => (
          <FileInput
            field={field}
            label="Logo"
            accept="image/*"
            existingUrl={initial?.logo}
          />
        )}
      </form.Field>
      <form.Field name="banner">
        {(field) => (
          <FileInput
            field={field}
            label="Banner"
            accept="image/*"
            existingUrl={initial?.banner}
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
