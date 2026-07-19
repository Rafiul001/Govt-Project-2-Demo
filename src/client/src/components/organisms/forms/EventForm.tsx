import { Button, toast } from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import { useCreateEvent, useUpdateEvent } from "../../../hooks/useEvents";
import { useCurrentAdmin } from "../../../hooks/useCurrentAdmin";
import { getApiErrorMessage } from "../../../lib/apiError";
import { filePatch, fileRemoved } from "../../../lib/fileField";
import type { TEvent } from "../../../types";
import {
  createEventSchema,
  type TCreateEventForm,
} from "../../../validators";
import {
  BranchSelect,
  DateInput,
  FileInput,
  SwitchInput,
  TextAreaInput,
  TextInput,
} from "../../formInputs";
import { LoadingButton } from "../../molecules";

/** `2026-07-30T09:00` — an API timestamp as a `datetime-local` value. */
function toDateTimeLocal(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

type TEventFormProps = {
  initial?: TEvent;
  onSuccess: () => void;
  onCancel: () => void;
};

/** Create/edit form for an event. */
export function EventForm({ initial, onSuccess, onCancel }: TEventFormProps) {
  const isEdit = Boolean(initial);
  const admin = useCurrentAdmin();
  const isSuperAdmin = admin?.adminType === "SUPER_ADMIN";
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();

  const form = useForm({
    defaultValues: {
      branchId: initial?.branchId ?? undefined,
      titleBn: initial?.titleBn ?? "",
      titleEn: initial?.titleEn ?? "",
      descriptionBn: initial?.descriptionBn ?? "",
      descriptionEn: initial?.descriptionEn ?? "",
      venue: initial?.venue ?? "",
      startAt: toDateTimeLocal(initial?.startAt),
      endAt: toDateTimeLocal(initial?.endAt),
      image: undefined,
      isPublished: initial?.isPublished ?? true,
    } as TCreateEventForm,
    validators: { onChange: createEventSchema },
    onSubmit: async ({ value }) => {
      const payload = {
        titleBn: value.titleBn?.trim() ? value.titleBn : undefined,
        titleEn: value.titleEn?.trim() ? value.titleEn : undefined,
        descriptionBn: value.descriptionBn?.trim()
          ? value.descriptionBn
          : undefined,
        descriptionEn: value.descriptionEn?.trim()
          ? value.descriptionEn
          : undefined,
        venue: value.venue?.trim() ? value.venue : undefined,
        startAt: value.startAt,
        endAt: value.endAt || undefined,
        isPublished: value.isPublished,
        branchId: isSuperAdmin ? value.branchId : undefined,
      };
      try {
        if (initial) {
          await updateMutation.mutateAsync({
            id: initial.id,
            ...payload,
            image: filePatch(value.image),
            removeImage: fileRemoved(value.image),
          });
          toast.success("Event updated");
        } else {
          await createMutation.mutateAsync({
            ...payload,
            image: filePatch(value.image),
          });
          toast.success("Event created");
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
        {(field) => <TextInput field={field} label="Title (Bangla)" />}
      </form.Field>
      <form.Field name="titleEn">
        {(field) => <TextInput field={field} label="Title (English)" />}
      </form.Field>
      <form.Field name="descriptionBn">
        {(field) => (
          <TextAreaInput field={field} label="Description (Bangla)" rows={3} />
        )}
      </form.Field>
      <form.Field name="descriptionEn">
        {(field) => (
          <TextAreaInput field={field} label="Description (English)" rows={3} />
        )}
      </form.Field>
      <form.Field name="venue">
        {(field) => <TextInput field={field} label="Venue" />}
      </form.Field>
      <form.Field name="startAt">
        {(field) => (
          <DateInput
            field={field}
            label="Starts at"
            type="datetime-local"
            isRequired
          />
        )}
      </form.Field>
      <form.Field name="endAt">
        {(field) => (
          <DateInput field={field} label="Ends at" type="datetime-local" />
        )}
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
            existingUrl={initial?.image ?? undefined}
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
