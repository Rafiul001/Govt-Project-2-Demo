import { Button, toast } from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import { useCreateMember, useUpdateMember } from "../../../hooks/useMembers";
import { useCurrentAdmin } from "../../../hooks/useCurrentAdmin";
import { getApiErrorMessage } from "../../../lib/apiError";
import { filePatch, fileRemoved } from "../../../lib/fileField";
import type { TMember } from "../../../types";
import {
  bloodGroupValues,
  createMemberSchema,
  genderValues,
  type TCreateMemberForm,
} from "../../../validators";
import {
  BranchSelect,
  CategorySelect,
  DateInput,
  FileInput,
  NumberInput,
  SelectInput,
  TextAreaInput,
  TextInput,
} from "../../formInputs";
import { LoadingButton } from "../../molecules";

const bloodGroupOptions = bloodGroupValues.map((value) => ({
  value,
  label: value,
}));

const genderOptions = genderValues.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

/** Optional text: empty form strings are omitted from the payload. */
function str(value: string | undefined): string | undefined {
  return value?.trim() ? value : undefined;
}

/** Section heading matching the profile view's groups. */
function SectionHeading({ children }: { children: string }) {
  return (
    <h4 className="border-b border-border pb-1 pt-2 text-sm font-semibold uppercase tracking-wide text-accent">
      {children}
    </h4>
  );
}

type TMemberFormProps = {
  initial?: TMember;
  /** Pre-selected category for new members (from the active list filter). */
  defaultCategoryId?: number;
  onSuccess: () => void;
  onCancel: () => void;
};

/** Create/edit form for a member's GEMS-style profile. */
export function MemberForm({
  initial,
  defaultCategoryId,
  onSuccess,
  onCancel,
}: TMemberFormProps) {
  const isEdit = Boolean(initial);
  const admin = useCurrentAdmin();
  const isSuperAdmin = admin?.adminType === "SUPER_ADMIN";
  const createMutation = useCreateMember();
  const updateMutation = useUpdateMember();

  const form = useForm({
    defaultValues: {
      branchId: initial?.branchId ?? undefined,
      categoryId: initial?.categoryId ?? defaultCategoryId,
      nameBn: initial?.nameBn ?? "",
      nameEn: initial?.nameEn ?? "",
      designation: initial?.designation ?? "",
      photo: undefined,
      mobile: initial?.mobile ?? "",
      email: initial?.email ?? "",
      order: initial?.order,
      dateOfBirth: initial?.dateOfBirth ?? "",
      bloodGroup: initial?.bloodGroup ?? "",
      gender: initial?.gender ?? "",
      nid: initial?.nid ?? "",
      address: initial?.address ?? "",
      discipline: initial?.discipline ?? "",
      jerseyNumber: initial?.jerseyNumber ?? undefined,
      joiningDate: initial?.joiningDate ?? "",
      achievements: initial?.achievements ?? "",
      bio: initial?.bio ?? "",
    } as TCreateMemberForm,
    validators: { onChange: createMemberSchema },
    onSubmit: async ({ value }) => {
      // Empty optional fields are omitted (they stay unchanged on edit).
      const profile = {
        nameBn: str(value.nameBn),
        nameEn: str(value.nameEn),
        designation: str(value.designation),
        mobile: str(value.mobile),
        email: str(value.email),
        order: value.order,
        dateOfBirth: str(value.dateOfBirth),
        bloodGroup: str(value.bloodGroup),
        gender: str(value.gender),
        nid: str(value.nid),
        address: str(value.address),
        discipline: str(value.discipline),
        jerseyNumber: value.jerseyNumber,
        joiningDate: str(value.joiningDate),
        achievements: str(value.achievements),
        bio: str(value.bio),
        branchId: isSuperAdmin ? value.branchId : undefined,
      };
      try {
        if (initial) {
          await updateMutation.mutateAsync({
            id: initial.id,
            ...profile,
            categoryId: value.categoryId,
            photo: filePatch(value.photo),
            removePhoto: fileRemoved(value.photo),
          });
          toast.success("Member updated");
        } else {
          await createMutation.mutateAsync({
            ...profile,
            categoryId: value.categoryId!,
            photo: filePatch(value.photo),
          });
          toast.success("Member created");
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
      <SectionHeading>Basic information</SectionHeading>
      <form.Field name="categoryId">
        {(field) => <CategorySelect field={field} isRequired />}
      </form.Field>
      {isSuperAdmin ? (
        <form.Field name="branchId">
          {(field) => <BranchSelect field={field} isRequired />}
        </form.Field>
      ) : null}
      <form.Field name="nameBn">
        {(field) => <TextInput field={field} label="Name (Bangla)" />}
      </form.Field>
      <form.Field name="nameEn">
        {(field) => <TextInput field={field} label="Name (English)" />}
      </form.Field>
      <form.Field name="designation">
        {(field) => <TextInput field={field} label="Designation" />}
      </form.Field>
      <form.Field name="photo">
        {(field) => (
          <FileInput
            field={field}
            label="Photo"
            accept="image/*"
            existingUrl={initial?.photo ?? undefined}
          />
        )}
      </form.Field>
      <form.Field name="mobile">
        {(field) => <TextInput field={field} label="Mobile" />}
      </form.Field>
      <form.Field name="email">
        {(field) => <TextInput field={field} label="Email" type="email" />}
      </form.Field>
      <form.Field name="order">
        {(field) => <NumberInput field={field} label="Display order" min={0} />}
      </form.Field>

      <SectionHeading>Personal information</SectionHeading>
      <form.Field name="dateOfBirth">
        {(field) => <DateInput field={field} label="Date of birth" />}
      </form.Field>
      <form.Field name="bloodGroup">
        {(field) => (
          <SelectInput
            field={field}
            label="Blood group"
            options={bloodGroupOptions}
          />
        )}
      </form.Field>
      <form.Field name="gender">
        {(field) => (
          <SelectInput field={field} label="Gender" options={genderOptions} />
        )}
      </form.Field>
      <form.Field name="nid">
        {(field) => <TextInput field={field} label="NID" />}
      </form.Field>
      <form.Field name="address">
        {(field) => <TextAreaInput field={field} label="Address" rows={2} />}
      </form.Field>

      <SectionHeading>Sports information</SectionHeading>
      <form.Field name="discipline">
        {(field) => (
          <TextInput
            field={field}
            label="Discipline"
            placeholder="e.g. Football"
          />
        )}
      </form.Field>
      <form.Field name="jerseyNumber">
        {(field) => <NumberInput field={field} label="Jersey number" min={0} />}
      </form.Field>
      <form.Field name="joiningDate">
        {(field) => <DateInput field={field} label="Joining date" />}
      </form.Field>
      <form.Field name="achievements">
        {(field) => (
          <TextAreaInput field={field} label="Achievements" rows={3} />
        )}
      </form.Field>
      <form.Field name="bio">
        {(field) => <TextAreaInput field={field} label="Bio" rows={3} />}
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
