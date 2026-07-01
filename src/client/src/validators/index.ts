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

const optionalFile = fileSchema.optional();

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
