import { z } from "zod";
import { fileSchema } from "./file.validator";

// Optional email that also tolerates an empty string from form fields.
const optionalEmail = z.union([z.literal(""), z.email()]).optional();

// The public preview URL for the branch. Any URL is allowed, but its subdomain
// must be the branch name (enforced cross-field below).
const previewUrl = z.url("Enter a valid URL").max(255);

const PREVIEW_URL_MISMATCH =
  'The branch name must be the URL subdomain (e.g. "https://dhaka.example.com" for "Dhaka")';

/**
 * The rule tying the two fields together: the first label of the preview URL's
 * host must equal the branch name (case-insensitive), e.g. `dhaka.example.com`
 * for a branch named "Dhaka". Invalid URLs fail. Exported so the route can
 * re-check against the *stored* name on partial updates.
 */
export function previewUrlMatchesName(url: string, name: string): boolean {
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
    name: z.string().trim().min(1).max(255),
    previewUrl,
    address: z.string().trim().min(1).max(255),
    phone: z.string().trim().max(50).optional(),
    email: optionalEmail,
    // Uploaded image files; the route stores the resulting Cloudinary URLs.
    logo: fileSchema.optional(),
    banner: fileSchema.optional(),
  })
  .refine((v) => previewUrlMatchesName(v.previewUrl, v.name), {
    path: ["previewUrl"],
    message: PREVIEW_URL_MISMATCH,
  });

export const updateBranchSchema = z
  .strictObject({
    name: z.string().trim().min(1).max(255).optional(),
    previewUrl: previewUrl.optional(),
    address: z.string().trim().min(1).max(255).optional(),
    phone: z.string().trim().max(50).optional(),
    email: optionalEmail,
    logo: fileSchema.optional(),
    banner: fileSchema.optional(),
  })
  // Only enforce when both fields are present in the payload; a partial update
  // that omits `name` is re-checked against the stored name in the route.
  .refine(
    (v) =>
      v.previewUrl === undefined ||
      v.name === undefined ||
      previewUrlMatchesName(v.previewUrl, v.name),
    { path: ["previewUrl"], message: PREVIEW_URL_MISMATCH },
  );

export type TCreateBranchInput = z.infer<typeof createBranchSchema>;
export type TUpdateBranchInput = z.infer<typeof updateBranchSchema>;
