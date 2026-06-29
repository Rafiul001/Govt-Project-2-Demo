import { Button, toast } from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import { useCreateAdmin } from "../../../hooks/useAdmins";
import { getApiErrorMessage } from "../../../lib/apiError";
import { createAdminSchema, type TCreateAdminForm } from "../../../validators";
import { BranchSelect, FileInput, TextInput } from "../../formInputs";

type AdminFormProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

export function AdminForm({ onSuccess, onCancel }: AdminFormProps) {
  const createMutation = useCreateAdmin();

  const form = useForm({
    defaultValues: {
      name: "",
      username: "",
      password: "",
      avatar: undefined,
      branchId: undefined,
    } as unknown as TCreateAdminForm,
    validators: { onChange: createAdminSchema },
    onSubmit: async ({ value }) => {
      try {
        await createMutation.mutateAsync({
          name: value.name,
          username: value.username,
          password: value.password,
          avatar: value.avatar,
          branchId: value.branchId,
        });
        toast.success("Admin created");
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
            label="Password"
            type="password"
            isRequired
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
              Create
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
