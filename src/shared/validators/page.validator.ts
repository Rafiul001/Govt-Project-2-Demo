import { z } from "zod";
import { fileSchema } from "./file.validator";

// A page carries a banner image upload, so updates are sent as multipart form
// data (numeric/boolean fields arrive as strings and are coerced). A sub-menu
// page is created implicitly with its sub-menu; a menu-attached page is
// created explicitly (JSON, below). Banner title and body are bilingual; the
// update route enforces that at least one banner-title language stays set (it
// has the existing row for context).

/**
 * Create a page attached directly to a menu (no sub-menu). Only valid for
 * menus without sub-menus; the page's banner title defaults to the menu title.
 */
export const createPageSchema = z.strictObject({
  menuId: z.number().int().positive(),
  // Super admins must name the branch; branch admins are pinned to their own.
  branchId: z.number().int().positive().optional(),
});

export type TCreatePageInput = z.infer<typeof createPageSchema>;

export const updatePageSchema = z.strictObject({
  bannerTitleBn: z.string().trim().max(255).optional(),
  bannerTitleEn: z.string().trim().max(255).optional(),
  // Uploaded banner image; the route stores the resulting Cloudinary URL.
  bannerImage: fileSchema.optional(),
  // Delete the stored banner image (ignored when a new file is uploaded).
  removeBannerImage: z.stringbool().optional(),
  // Markdown body per language.
  contentBn: z.string().optional(),
  contentEn: z.string().optional(),
  isPublished: z.stringbool().optional(),
});

export type TUpdatePageInput = z.infer<typeof updatePageSchema>;

// Image uploaded from the markdown editor; the route returns the Cloudinary
// URL, which the editor embeds into the page content as `![](url)`.
export const uploadPageImageSchema = z.strictObject({
  image: fileSchema,
});

export type TUploadPageImageInput = z.infer<typeof uploadPageImageSchema>;

// An image referenced by pasted markdown, imported server-side into Cloudinary
// so the page never depends on a host we don't control. Accepts a remote
// http(s) URL or an inline data URI (pastes from some editors embed base64).
// The generous max length exists for data URIs; sent as JSON, not multipart.
export const importPageImageSchema = z.strictObject({
  url: z
    .string()
    .max(10_000_000)
    .refine(
      (value) =>
        /^https?:\/\//i.test(value) || value.startsWith("data:image/"),
      "url must be an http(s) URL or a data:image/… URI",
    ),
});

export type TImportPageImageInput = z.infer<typeof importPageImageSchema>;
