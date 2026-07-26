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

/**
 * Icon keys a highlight card may use. Both the dashboard and the landing page
 * map these to a concrete lucide icon, so the set must stay in sync with the
 * `HIGHLIGHT_ICONS` maps in each app.
 */
export const aboutHighlightIcons = [
  "shield-check",
  "users",
  "building",
  "landmark",
  "award",
  "scale",
  "handshake",
  "globe",
  "file-text",
  "heart",
  "sparkles",
  "target",
] as const;

/** One card of the public "About us" section's highlight row. */
export const aboutHighlightSchema = z.strictObject({
  icon: z.enum(aboutHighlightIcons).optional(),
  titleBn: z.string().trim().max(255).optional(),
  titleEn: z.string().trim().max(255).optional(),
  bodyBn: z.string().trim().max(1000).optional(),
  bodyEn: z.string().trim().max(1000).optional(),
});

export type TAboutHighlight = z.infer<typeof aboutHighlightSchema>;

/** At most six cards — the public row is laid out three-up. */
export const aboutHighlightsSchema = z.array(aboutHighlightSchema).max(6);

/**
 * Highlights as they arrive over multipart: a JSON-encoded array, since a form
 * field can only carry a string. Parsed here so the route stores real JSON.
 */
const aboutHighlightsFormSchema = z
  .string()
  .transform((raw, ctx) => {
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      ctx.addIssue({ code: "custom", message: "Invalid highlights JSON" });
      return z.NEVER;
    }
  })
  .pipe(aboutHighlightsSchema);

/**
 * The editable "About us" copy. Every field is optional in both languages —
 * the landing page falls back to its own default text for anything left blank.
 */
const aboutFields = {
  aboutTitleBn: z.string().trim().max(255).optional(),
  aboutTitleEn: z.string().trim().max(255).optional(),
  aboutSubtitleBn: z.string().trim().max(1000).optional(),
  aboutSubtitleEn: z.string().trim().max(1000).optional(),
  aboutIntroBn: z.string().trim().max(4000).optional(),
  aboutIntroEn: z.string().trim().max(4000).optional(),
  aboutHighlights: aboutHighlightsFormSchema.optional(),
};

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
    ...aboutFields,
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
    // Delete the stored logo/banner (ignored when a new file is uploaded).
    removeLogo: z.stringbool().optional(),
    removeBanner: z.stringbool().optional(),
    // Multipart values arrive as strings; coerce the publish flag to a boolean.
    isPublished: z.stringbool().optional(),
    ...aboutFields,
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
