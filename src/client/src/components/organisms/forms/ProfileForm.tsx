import { toast } from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import { useUpdateProfile } from "../../../hooks/useAdmins";
import { getApiErrorMessage } from "../../../lib/apiError";
import { filePatch, fileRemoved } from "../../../lib/fileField";
import {
  updateProfileSchema,
  type TUpdateProfileForm,
} from "../../../validators";
import { FileInput, TextInput } from "../../formInputs";
import { LoadingButton } from "../../molecules";

/** Lets the signed-in admin change their own avatar and/or password. */
export function ProfileForm() {
  const updateMutation = useUpdateProfile();

  const form = useForm({
    defaultValues: {
      password: "",
      avatar: undefined,
    } as TUpdateProfileForm,
    validators: { onChange: updateProfileSchema },
    onSubmit: async ({ value, formApi }) => {
      if (!value.password && !value.avatar) {
        toast.danger("Choose a new avatar or password to update");
        return;
      }
      try {
        await updateMutation.mutateAsync({
          password: value.password ? value.password : undefined,
          avatar: filePatch(value.avatar),
          removeAvatar: fileRemoved(value.avatar),
        });
        toast.success("Profile updated");
        formApi.reset();
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
      <form.Field name="avatar">
        {(field) => <FileInput field={field} label="Avatar" accept="image/*" />}
      </form.Field>
      <form.Field name="password">
        {(field) => (
          <TextInput
            field={field}
            label="New password"
            type="password"
            placeholder="Leave blank to keep current"
            autoComplete="new-password"
          />
        )}
      </form.Field>

      <div className="flex justify-end pt-2">
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <LoadingButton
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              Save changes
            </LoadingButton>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
