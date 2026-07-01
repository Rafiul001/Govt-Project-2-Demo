import { Button, toast } from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import {
  useCreateBoardOfDirector,
  useUpdateBoardOfDirector,
} from "../../../hooks/useBoardOfDirectors";
import { useCurrentAdmin } from "../../../hooks/useCurrentAdmin";
import { getApiErrorMessage } from "../../../lib/apiError";
import type { TBoardOfDirector } from "../../../types";
import {
  createBoardOfDirectorSchema,
  type TCreateBoardOfDirectorForm,
} from "../../../validators";
import {
  BranchSelect,
  FileInput,
  NumberInput,
  TextInput,
} from "../../formInputs";

type TBoardOfDirectorFormProps = {
  initial?: TBoardOfDirector;
  onSuccess: () => void;
  onCancel: () => void;
};

export function BoardOfDirectorForm({
  initial,
  onSuccess,
  onCancel,
}: TBoardOfDirectorFormProps) {
  const isEdit = Boolean(initial);
  const admin = useCurrentAdmin();
  const isSuperAdmin = admin?.adminType === "SUPER_ADMIN";
  const createMutation = useCreateBoardOfDirector();
  const updateMutation = useUpdateBoardOfDirector();

  const form = useForm({
    defaultValues: {
      branchId: initial?.branchId ?? undefined,
      name: initial?.name ?? "",
      designation: initial?.designation ?? "",
      order: initial?.order,
      avatar: undefined,
    } as TCreateBoardOfDirectorForm,
    validators: { onChange: createBoardOfDirectorSchema },
    onSubmit: async ({ value }) => {
      try {
        if (initial) {
          await updateMutation.mutateAsync({
            id: initial.id,
            name: value.name,
            designation: value.designation,
            order: value.order,
            avatar: value.avatar,
            branchId: isSuperAdmin ? value.branchId : undefined,
          });
          toast.success("Board member updated");
        } else {
          await createMutation.mutateAsync({
            name: value.name,
            designation: value.designation,
            order: value.order,
            avatar: value.avatar,
            branchId: isSuperAdmin ? value.branchId : undefined,
          });
          toast.success("Board member created");
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
      <form.Field name="designation">
        {(field) => <TextInput field={field} label="Designation" isRequired />}
      </form.Field>
      <form.Field name="order">
        {(field) => <NumberInput field={field} label="Display order" min={0} />}
      </form.Field>
      {isSuperAdmin ? (
        <form.Field name="branchId">
          {(field) => <BranchSelect field={field} isRequired />}
        </form.Field>
      ) : null}
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
