import { Button, toast } from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import { useCreateAdmin, useUpdateAdmin } from "../../../hooks/useAdmins";
import { getApiErrorMessage } from "../../../lib/apiError";
import type { TAdmin } from "../../../types";
import {
  createAdminSchema,
  updateAdminSchema,
  type TCreateAdminForm,
} from "../../../validators";
import { BranchSelect, FileInput, TextInput } from "../../formInputs";

type TAdminFormProps = {
  initial?: TAdmin;
  onSuccess: () => void;
  onCancel: () => void;
};

export function AdminForm({ initial, onSuccess, onCancel }: TAdminFormProps) {
  const isEdit = Boolean(initial);
  const createMutation = useCreateAdmin();
  const updateMutation = useUpdateAdmin();

  const form = useForm({
    defaultValues: {
      name: initial?.name ?? "",
      username: initial?.username ?? "",
      password: "",
      avatar: undefined,
      branchId: initial?.branchId ?? undefined,
    } as unknown as TCreateAdminForm,
    // Edit mode validates with the all-optional schema (password may be blank);
    // cast keeps the form's value type aligned with the create schema.
    validators: {
      onChange: (isEdit
        ? updateAdminSchema
        : createAdminSchema) as typeof createAdminSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        if (initial) {
          await updateMutation.mutateAsync({
            id: initial.id,
            name: value.name,
            username: value.username,
            // Only send the password when the admin actually typed a new one.
            password: value.password ? value.password : undefined,
            avatar: value.avatar,
            branchId: value.branchId,
          });
          toast.success("Admin updated");
        } else {
          await createMutation.mutateAsync({
            name: value.name,
            username: value.username,
            password: value.password,
            avatar: value.avatar,
            branchId: value.branchId,
          });
          toast.success("Admin created");
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
      <form.Field name="username">
        {(field) => (
          <TextInput
            field={field}
            label="Username"
            isRequired
            autoComplete="off"
          />
        )}
      </form.Field>
      <form.Field name="password">
        {(field) => (
          <TextInput
            field={field}
            label={isEdit ? "New password" : "Password"}
            type="password"
            isRequired={!isEdit}
            placeholder={isEdit ? "Leave blank to keep current" : undefined}
            autoComplete="new-password"
          />
        )}
      </form.Field>
      <form.Field name="branchId">
        {(field) => <BranchSelect field={field} isRequired />}
      </form.Field>
      <form.Field name="avatar">
        {(field) => <FileInput field={field} label="Avatar" accept="image/*" />}
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
