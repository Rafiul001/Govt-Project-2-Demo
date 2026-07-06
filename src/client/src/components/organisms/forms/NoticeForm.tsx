import { Button, toast } from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import { useCurrentAdmin } from "../../../hooks/useCurrentAdmin";
import { useCreateNotice, useUpdateNotice } from "../../../hooks/useNotices";
import { getApiErrorMessage } from "../../../lib/apiError";
import { filePatch, fileRemoved } from "../../../lib/fileField";
import type { TNotice } from "../../../types";
import {
  createNoticeSchema,
  type TCreateNoticeForm,
} from "../../../validators";
import {
  BranchSelect,
  FileInput,
  SwitchInput,
  TextAreaInput,
  TextInput,
} from "../../formInputs";

type TNoticeFormProps = {
  initial?: TNotice;
  onSuccess: () => void;
  onCancel: () => void;
};

export function NoticeForm({ initial, onSuccess, onCancel }: TNoticeFormProps) {
  const isEdit = Boolean(initial);
  const admin = useCurrentAdmin();
  const isSuperAdmin = admin?.adminType === "SUPER_ADMIN";
  const createMutation = useCreateNotice();
  const updateMutation = useUpdateNotice();

  const form = useForm({
    defaultValues: {
      branchId: initial?.branchId ?? undefined,
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      file: undefined,
      image: undefined,
      isPublished: initial?.isPublished ?? true,
    } as TCreateNoticeForm,
    validators: { onChange: createNoticeSchema },
    onSubmit: async ({ value }) => {
      try {
        if (initial) {
          await updateMutation.mutateAsync({
            id: initial.id,
            title: value.title,
            description: value.description,
            file: filePatch(value.file),
            image: filePatch(value.image),
            removeFile: fileRemoved(value.file),
            removeImage: fileRemoved(value.image),
            isPublished: value.isPublished,
            branchId: isSuperAdmin ? value.branchId : undefined,
          });
          toast.success("Notice updated");
        } else {
          await createMutation.mutateAsync({
            title: value.title,
            description: value.description,
            file: filePatch(value.file),
            image: filePatch(value.image),
            isPublished: value.isPublished,
            branchId: isSuperAdmin ? value.branchId : undefined,
          });
          toast.success("Notice created");
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
      <form.Field name="description">
        {(field) => <TextAreaInput field={field} label="Description" />}
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
      <form.Field name="file">
        {(field) => (
          <FileInput
            field={field}
            label="PDF document"
            accept="application/pdf"
            existingUrl={initial?.fileUrl}
          />
        )}
      </form.Field>
      <form.Field name="isPublished">
        {(field) => <SwitchInput field={field} label="Published" />}
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
