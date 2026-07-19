import { z } from "zod";

/*
 * Client-side form validators. These mirror the server schemas in
 * `src/shared/validators` (kept as separate copies because the client cannot
 * import from the server's module graph). Every schema uses `z.strictObject`.
 *
 * Forms hold every field as a controlled value, so unlike the server (where
 * multipart values arrive as strings and are coerced) these validate the real
 * JS types the form produces: `number` for numeric inputs, `boolean` for
 * switches, and `File` for uploads.
 */

/** Max upload size accepted by the API: 5 MB. */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE, "File must not exceed 5 MB");

// `File` = new upload, `undefined` = keep the saved file, `null` = remove it
// (edit forms translate `null` into the matching `remove*` API flag).
const optionalFile = fileSchema.nullish();

const branchId = z
  .number("Branch ID is required")
  .int()
  .positive("Branch ID must be a positive number");

export const adminTypeValues = ["SUPER_ADMIN", "BRANCH_ADMIN"] as const;

// --- Auth ---

export const loginSchema = z.strictObject({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
export type TLoginForm = z.infer<typeof loginSchema>;

// --- Branch ---

// Optional email that also accepts an empty string from the form field.
const optionalEmail = z
  .union([z.literal(""), z.email("Enter a valid email")])
  .optional();

// Public preview URL for the branch. Any URL, but its subdomain must be the
// branch name (checked cross-field below) — e.g. https://dhaka.example.com.
const previewUrl = z.url("Enter a valid URL").max(255);

const PREVIEW_URL_MISMATCH =
  'The branch name must be the URL subdomain (e.g. "https://dhaka.example.com" for "Dhaka")';

/** The preview URL's first host label must equal the branch name. */
function previewUrlMatchesName(url: string, name: string): boolean {
  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    return false;
  }
  const subdomain = hostname.split(".")[0]?.toLowerCase() ?? "";
  return subdomain === name.trim().toLowerCase();
}

export const createBranchSchema = z
  .strictObject({
    name: z.string().trim().min(1, "Name is required").max(255),
    previewUrl,
    address: z.string().trim().min(1, "Address is required").max(255),
    phone: z.string().trim().max(50).optional(),
    email: optionalEmail,
    logo: optionalFile,
    banner: optionalFile,
  })
  .refine((v) => previewUrlMatchesName(v.previewUrl, v.name), {
    path: ["previewUrl"],
    message: PREVIEW_URL_MISMATCH,
  });
export type TCreateBranchForm = z.infer<typeof createBranchSchema>;

export const updateBranchSchema = z
  .strictObject({
    name: z.string().trim().min(1, "Name is required").max(255).optional(),
    previewUrl: previewUrl.optional(),
    address: z
      .string()
      .trim()
      .min(1, "Address is required")
      .max(255)
      .optional(),
    phone: z.string().trim().max(50).optional(),
    email: optionalEmail,
    logo: optionalFile,
    banner: optionalFile,
    // Set to true by the Publish button on the branch editor.
    isPublished: z.boolean().optional(),
  })
  .refine(
    (v) =>
      v.previewUrl === undefined ||
      v.name === undefined ||
      previewUrlMatchesName(v.previewUrl, v.name),
    { path: ["previewUrl"], message: PREVIEW_URL_MISMATCH },
  );
export type TUpdateBranchForm = z.infer<typeof updateBranchSchema>;

// --- Admin ---

// Admins created in the panel are always branch admins, so a branch is required.
// Super admins can't be created here (only seeded via the bootstrap script).
export const createAdminSchema = z.strictObject({
  name: z.string().trim().min(1, "Name is required").max(255),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(255),
  avatar: optionalFile,
  branchId,
});
export type TCreateAdminForm = z.infer<typeof createAdminSchema>;

// Super admin editing a branch admin: all fields optional. Password is left
// blank unless it is being changed.
export const updateAdminSchema = z.strictObject({
  name: z.string().trim().min(1, "Name is required").max(255).optional(),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(255)
    .optional(),
  password: z
    .union([
      z.literal(""),
      z.string().min(8, "Password must be at least 8 characters").max(255),
    ])
    .optional(),
  avatar: optionalFile,
  branchId: branchId.optional(),
});
export type TUpdateAdminForm = z.infer<typeof updateAdminSchema>;

// An admin editing their own account: only password and avatar.
export const updateProfileSchema = z.strictObject({
  password: z
    .union([
      z.literal(""),
      z.string().min(8, "Password must be at least 8 characters").max(255),
    ])
    .optional(),
  avatar: optionalFile,
});
export type TUpdateProfileForm = z.infer<typeof updateProfileSchema>;

// --- Board of directors ---

export const createBoardOfDirectorSchema = z.strictObject({
  branchId: branchId.optional(),
  name: z.string().trim().min(1, "Name is required").max(255),
  designation: z.string().trim().min(1, "Designation is required").max(255),
  avatar: optionalFile,
  order: z.number().int().min(0).optional(),
});
export type TCreateBoardOfDirectorForm = z.infer<
  typeof createBoardOfDirectorSchema
>;

export const updateBoardOfDirectorSchema = z.strictObject({
  branchId: branchId.optional(),
  name: z.string().trim().min(1, "Name is required").max(255).optional(),
  designation: z
    .string()
    .trim()
    .min(1, "Designation is required")
    .max(255)
    .optional(),
  avatar: optionalFile,
  order: z.number().int().min(0).optional(),
});
export type TUpdateBoardOfDirectorForm = z.infer<
  typeof updateBoardOfDirectorSchema
>;

// --- Notice ---

export const createNoticeSchema = z.strictObject({
  branchId: branchId.optional(),
  title: z.string().trim().min(1, "Title is required").max(255),
  description: z.string().optional(),
  file: optionalFile,
  image: optionalFile,
  isPublished: z.boolean(),
});
export type TCreateNoticeForm = z.infer<typeof createNoticeSchema>;

export const updateNoticeSchema = z.strictObject({
  branchId: branchId.optional(),
  title: z.string().trim().min(1, "Title is required").max(255).optional(),
  description: z.string().optional(),
  file: optionalFile,
  image: optionalFile,
  isPublished: z.boolean(),
});
export type TUpdateNoticeForm = z.infer<typeof updateNoticeSchema>;

// --- Banner ---

export const createBannerSchema = z.strictObject({
  branchId: branchId.optional(),
  title: z.string().trim().min(1, "Title is required").max(255),
  subTitle: z.string().trim().min(1, "Subtitle is required").max(255),
  image: optionalFile,
  order: z.number().int().min(0).optional(),
});
export type TCreateBannerForm = z.infer<typeof createBannerSchema>;

export const updateBannerSchema = z.strictObject({
  branchId: branchId.optional(),
  title: z.string().trim().min(1, "Title is required").max(255).optional(),
  subTitle: z
    .string()
    .trim()
    .min(1, "Subtitle is required")
    .max(255)
    .optional(),
  image: optionalFile,
  order: z.number().int().min(0).optional(),
});
export type TUpdateBannerForm = z.infer<typeof updateBannerSchema>;

// --- Menu / Sub-menu / Page (bilingual) ---

// Titles are bilingual: each language is optional, but at least one must be
// filled in. The message is attached to the Bangla field so it surfaces in the
// form. The URL slug is derived server-side from the title.
const TITLE_REQUIRED = "Provide a title in Bangla or English";
const bnTitle = z.string().trim().max(255).optional();
const enTitle = z.string().trim().max(255).optional();
const hasAnyTitle = (v: { titleBn?: string; titleEn?: string }) =>
  Boolean(v.titleBn?.trim() || v.titleEn?.trim());

export const createMenuSchema = z
  .strictObject({
    branchId: branchId.optional(),
    titleBn: bnTitle,
    titleEn: enTitle,
    order: z.number().int().min(0).optional(),
  })
  .refine(hasAnyTitle, { path: ["titleBn"], message: TITLE_REQUIRED });
export type TCreateMenuForm = z.infer<typeof createMenuSchema>;

export const updateMenuSchema = createMenuSchema;
export type TUpdateMenuForm = z.infer<typeof updateMenuSchema>;

export const createSubmenuSchema = z
  .strictObject({
    branchId: branchId.optional(),
    menuId: z.number("Menu is required").int().positive(),
    titleBn: bnTitle,
    titleEn: enTitle,
    order: z.number().int().min(0).optional(),
  })
  .refine(hasAnyTitle, { path: ["titleBn"], message: TITLE_REQUIRED });
export type TCreateSubmenuForm = z.infer<typeof createSubmenuSchema>;

export const updateSubmenuSchema = createSubmenuSchema;
export type TUpdateSubmenuForm = z.infer<typeof updateSubmenuSchema>;

// The page editor always edits an existing page (created with its sub-menu), so
// every field is optional; at least one banner-title language is still required.
export const updatePageSchema = z
  .strictObject({
    bannerTitleBn: bnTitle,
    bannerTitleEn: enTitle,
    bannerImage: optionalFile,
    contentBn: z.string().optional(),
    contentEn: z.string().optional(),
    isPublished: z.boolean().optional(),
  })
  .refine((v) => Boolean(v.bannerTitleBn?.trim() || v.bannerTitleEn?.trim()), {
    path: ["bannerTitleBn"],
    message: "Provide a banner title in Bangla or English",
  });
export type TUpdatePageForm = z.infer<typeof updatePageSchema>;

// --- Member category (bilingual name + URL slug) ---

const NAME_REQUIRED = "Provide a name in Bangla or English";
const hasAnyName = (v: { nameBn?: string; nameEn?: string }) =>
  Boolean(v.nameBn?.trim() || v.nameEn?.trim());

export const createMemberCategorySchema = z
  .strictObject({
    nameBn: z.string().trim().max(255).optional(),
    nameEn: z.string().trim().max(255).optional(),
    slug: z
      .string()
      .trim()
      .min(1, "Slug is required")
      .max(255)
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
        message: "Lowercase letters/numbers separated by hyphens (e.g. players)",
      }),
    order: z.number().int().min(0).optional(),
  })
  .refine(hasAnyName, { path: ["nameBn"], message: NAME_REQUIRED });
export type TCreateMemberCategoryForm = z.infer<
  typeof createMemberCategorySchema
>;

export const updateMemberCategorySchema = createMemberCategorySchema;
export type TUpdateMemberCategoryForm = z.infer<
  typeof updateMemberCategorySchema
>;

// --- Member (GEMS-style profile) ---

export const bloodGroupValues = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export const genderValues = ["male", "female", "other"] as const;

// Optional select/date/text values that also accept the empty string the form
// controls produce when cleared; edit forms strip "" before submitting.
const optionalBloodGroup = z
  .union([z.literal(""), z.enum(bloodGroupValues)])
  .optional();
const optionalGender = z
  .union([z.literal(""), z.enum(genderValues)])
  .optional();
const optionalDate = z
  .union([z.literal(""), z.iso.date("Enter a valid date")])
  .optional();

const memberProfileFields = {
  nameBn: z.string().trim().max(255).optional(),
  nameEn: z.string().trim().max(255).optional(),
  designation: z.string().trim().max(255).optional(),
  photo: optionalFile,
  mobile: z.string().trim().max(32).optional(),
  email: optionalEmail,
  order: z.number().int().min(0).optional(),
  dateOfBirth: optionalDate,
  bloodGroup: optionalBloodGroup,
  gender: optionalGender,
  nid: z.string().trim().max(32).optional(),
  address: z.string().trim().optional(),
  discipline: z.string().trim().max(255).optional(),
  jerseyNumber: z.number().int().min(0).optional(),
  joiningDate: optionalDate,
  achievements: z.string().trim().optional(),
  bio: z.string().trim().optional(),
};

export const createMemberSchema = z
  .strictObject({
    branchId: branchId.optional(),
    categoryId: z.number("Category is required").int().positive(),
    ...memberProfileFields,
  })
  .refine(hasAnyName, { path: ["nameBn"], message: NAME_REQUIRED });
export type TCreateMemberForm = z.infer<typeof createMemberSchema>;

export const updateMemberSchema = createMemberSchema;
export type TUpdateMemberForm = z.infer<typeof updateMemberSchema>;

// --- Event ---

// `datetime-local` values (`YYYY-MM-DDTHH:mm`).
const dateTimeLocal = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export const createEventSchema = z
  .strictObject({
    branchId: branchId.optional(),
    titleBn: bnTitle,
    titleEn: enTitle,
    descriptionBn: z.string().trim().optional(),
    descriptionEn: z.string().trim().optional(),
    venue: z.string().trim().max(255).optional(),
    startAt: z
      .string()
      .regex(dateTimeLocal, "Start date and time are required"),
    endAt: z
      .union([z.literal(""), z.string().regex(dateTimeLocal, "Enter a valid date and time")])
      .optional(),
    image: optionalFile,
    isPublished: z.boolean(),
  })
  .refine(hasAnyTitle, { path: ["titleBn"], message: TITLE_REQUIRED })
  .refine((v) => !v.endAt || v.endAt >= v.startAt, {
    path: ["endAt"],
    message: "End time must not be before start time",
  });
export type TCreateEventForm = z.infer<typeof createEventSchema>;

export const updateEventSchema = createEventSchema;
export type TUpdateEventForm = z.infer<typeof updateEventSchema>;
