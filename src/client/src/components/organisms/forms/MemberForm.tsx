import { Button, Checkbox, toast } from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import { useCreateMember, useUpdateMember } from "../../../hooks/useMembers";
import { useCurrentAdmin } from "../../../hooks/useCurrentAdmin";
import { getApiErrorMessage } from "../../../lib/apiError";
import { filePatch, fileRemoved } from "../../../lib/fileField";
import type { TMember } from "../../../types";
import {
  bloodGroupValues,
  createMemberSchema,
  defaultMemberPublicFieldValues,
  genderValues,
  memberPublicFieldValues,
  type TCreateMemberForm,
  type TMemberPublicFieldValue,
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

/**
 * Human labels for the configurable public fields, grouped the way the profile
 * itself is. Anything the admin leaves unchecked is stripped from the member's
 * public profile by the API — it never reaches the landing site.
 */
const PUBLIC_FIELD_GROUPS: {
  title: string;
  fields: { name: TMemberPublicFieldValue; label: string }[];
}[] = [
  {
    title: "Contact",
    fields: [
      { name: "mobile", label: "Mobile" },
      { name: "email", label: "Email" },
    ],
  },
  {
    title: "Personal",
    fields: [
      { name: "dateOfBirth", label: "Date of birth" },
      { name: "bloodGroup", label: "Blood group" },
      { name: "gender", label: "Gender" },
      { name: "nid", label: "NID" },
      { name: "address", label: "Address" },
    ],
  },
  {
    title: "Sports",
    fields: [
      { name: "discipline", label: "Discipline" },
      { name: "jerseyNumber", label: "Jersey number" },
      { name: "joiningDate", label: "Joining date" },
      { name: "achievements", label: "Achievements" },
      { name: "bio", label: "Bio" },
    ],
  },
];

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
      // A member that has never been configured starts from the API's own
      // default set, so editing an existing profile does not silently change
      // what the public site already shows.
      publicFields: (initial?.publicFields ??
        defaultMemberPublicFieldValues) as TMemberPublicFieldValue[],
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
        // Multipart carries strings only, so the published-field list goes as
        // JSON. Always sent — an empty list is a meaningful choice.
        publicFields: JSON.stringify(value.publicFields ?? []),
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
      {/* Actions sit at the top: these forms are long enough that a footer
          submit falls well below the fold. Sticky so it stays reachable while
          the page scrolls. */}
      <div className="sticky top-0 z-10 -mx-6 -mt-6 flex justify-end gap-2 border-b border-border bg-surface-secondary px-6 py-3">
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

      <SectionHeading>Basic information</SectionHeading>
      <div className="grid gap-4 sm:grid-cols-2">
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
        <form.Field name="order">
          {(field) => (
            <NumberInput field={field} label="Display order" min={0} />
          )}
        </form.Field>
        <form.Field name="mobile">
          {(field) => <TextInput field={field} label="Mobile" />}
        </form.Field>
        <form.Field name="email">
          {(field) => <TextInput field={field} label="Email" type="email" />}
        </form.Field>
        <div className="sm:col-span-2">
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
        </div>
      </div>

      <SectionHeading>Personal information</SectionHeading>
      <div className="grid gap-4 sm:grid-cols-2">
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
        <div className="sm:col-span-2">
          <form.Field name="address">
            {(field) => (
              <TextAreaInput field={field} label="Address" rows={2} />
            )}
          </form.Field>
        </div>
      </div>

      <SectionHeading>Sports information</SectionHeading>
      <div className="grid gap-4 sm:grid-cols-2">
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
          {(field) => (
            <NumberInput field={field} label="Jersey number" min={0} />
          )}
        </form.Field>
        <div className="sm:col-span-2">
          <form.Field name="joiningDate">
            {(field) => <DateInput field={field} label="Joining date" />}
          </form.Field>
        </div>
        <div className="sm:col-span-2">
          <form.Field name="achievements">
            {(field) => (
              <TextAreaInput field={field} label="Achievements" rows={3} />
            )}
          </form.Field>
        </div>
        <div className="sm:col-span-2">
          <form.Field name="bio">
            {(field) => <TextAreaInput field={field} label="Bio" rows={3} />}
          </form.Field>
        </div>
      </div>

      <SectionHeading>Public profile</SectionHeading>
      <p className="-mt-2 text-sm text-muted">
        Tick the fields this member agrees to show on the public site. Name,
        designation and photo are always public; anything left unticked is
        stripped from the profile before it leaves the API.
      </p>
      <form.Field name="publicFields">
        {(field) => {
          const selected = new Set<TMemberPublicFieldValue>(
            (field.state.value ?? []) as TMemberPublicFieldValue[],
          );
          const toggle = (name: TMemberPublicFieldValue, on: boolean) => {
            const next = new Set(selected);
            if (on) next.add(name);
            else next.delete(name);
            // Store in the canonical order so the saved list is stable.
            field.handleChange(
              memberPublicFieldValues.filter((value) => next.has(value)),
            );
          };

          return (
            <div className="grid gap-4 sm:grid-cols-3">
              {PUBLIC_FIELD_GROUPS.map((group) => (
                <fieldset
                  key={group.title}
                  className="rounded-xl border border-border p-4"
                >
                  <legend className="px-1 text-sm font-medium text-muted">
                    {group.title}
                  </legend>
                  <div className="flex flex-col gap-2.5">
                    {group.fields.map(({ name, label }) => (
                      <Checkbox
                        key={name}
                        // `relative` anchors React Aria's visually-hidden
                        // input, as on SwitchInput.
                        className="relative flex flex-row items-center gap-2"
                        isSelected={selected.has(name)}
                        onChange={(isSelected) => toggle(name, isSelected)}
                      >
                        <Checkbox.Content>
                          <Checkbox.Control>
                            <Checkbox.Indicator />
                          </Checkbox.Control>
                        </Checkbox.Content>
                        <span className="text-sm">{label}</span>
                      </Checkbox>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          );
        }}
      </form.Field>
    </form>
  );
}
