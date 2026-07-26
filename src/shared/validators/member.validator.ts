import { z } from "zod";
import { fileSchema } from "./file.validator";

// Member profiles upload a photo, so these validate multipart form input
// (numbers/booleans arrive as strings and are coerced). The name is bilingual
// — each language optional, at least one required. Only the name and category
// are mandatory; every other GEMS-style profile field may be left empty.

export const bloodGroups = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export const genders = ["male", "female", "other"] as const;

/**
 * Profile fields whose visibility on the public landing site is configurable
 * per member (see `publicFields` on the member schema). The identity fields —
 * names, designation, photo, display order, category and branch — are always
 * public and so are deliberately absent from this list.
 */
export const memberPublicFields = [
  "mobile",
  "email",
  "dateOfBirth",
  "bloodGroup",
  "gender",
  "nid",
  "address",
  "discipline",
  "jerseyNumber",
  "joiningDate",
  "achievements",
  "bio",
] as const;

export type TMemberPublicField = (typeof memberPublicFields)[number];

/**
 * What an anonymous visitor sees when a member has never been configured —
 * the behaviour before per-member visibility existed: contact details, NID,
 * address and date of birth stay private, everything else is public.
 */
export const defaultMemberPublicFields: TMemberPublicField[] = [
  "bloodGroup",
  "gender",
  "discipline",
  "jerseyNumber",
  "joiningDate",
  "achievements",
  "bio",
];

/**
 * The published-field list as it arrives over multipart: a JSON-encoded array
 * of field names, since a form field can only carry a string.
 */
const publicFieldsFormSchema = z
  .string()
  .transform((raw, ctx) => {
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      ctx.addIssue({ code: "custom", message: "Invalid publicFields JSON" });
      return z.NEVER;
    }
  })
  .pipe(z.array(z.enum(memberPublicFields)));

/** True when at least one language name is a non-empty (trimmed) string. */
const hasAnyName = (v: { nameBn?: string; nameEn?: string }) =>
  Boolean(v.nameBn?.trim() || v.nameEn?.trim());

const profileFields = {
  designation: z.string().trim().min(1).max(255).optional(),
  mobile: z.string().trim().min(1).max(32).optional(),
  email: z.email().max(255).optional(),
  order: z.coerce.number().int().min(0).optional(),
  // Which of the fields below reach the public site (see the member router).
  publicFields: publicFieldsFormSchema.optional(),
  // Personal
  dateOfBirth: z.iso.date().optional(),
  bloodGroup: z.enum(bloodGroups).optional(),
  gender: z.enum(genders).optional(),
  nid: z.string().trim().min(1).max(32).optional(),
  address: z.string().trim().min(1).optional(),
  // Sports
  discipline: z.string().trim().min(1).max(255).optional(),
  jerseyNumber: z.coerce.number().int().min(0).optional(),
  joiningDate: z.iso.date().optional(),
  achievements: z.string().trim().min(1).optional(),
  bio: z.string().trim().min(1).optional(),
};

export const createMemberSchema = z
  .strictObject({
    // Used only by super admins; branch admins take the branch from their token.
    branchId: z.coerce.number().int().positive().optional(),
    categoryId: z.coerce.number().int().positive(),
    nameBn: z.string().trim().max(255).optional(),
    nameEn: z.string().trim().max(255).optional(),
    // Uploaded image file; the route stores the resulting Cloudinary URL.
    photo: fileSchema.optional(),
    ...profileFields,
  })
  .refine(hasAnyName, {
    path: ["nameBn"],
    message: "Provide a name in Bangla or English",
  });

export const updateMemberSchema = z.strictObject({
  // Only honoured for super admins (branch admins cannot reassign branch).
  branchId: z.coerce.number().int().positive().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  nameBn: z.string().trim().max(255).optional(),
  nameEn: z.string().trim().max(255).optional(),
  photo: fileSchema.optional(),
  // Delete the stored photo (ignored when a new file is uploaded).
  removePhoto: z.stringbool().optional(),
  ...profileFields,
});

export type TCreateMemberInput = z.infer<typeof createMemberSchema>;
export type TUpdateMemberInput = z.infer<typeof updateMemberSchema>;
