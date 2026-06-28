import config from "../../config";
import { cloudinary, publicIdFromUrl } from "./client";

export type TUploadedImage = {
  // Full Cloudinary delivery URL — persist this; it is the handle for
  // replace/delete.
  url: string;
  // Cloudinary public_id of the stored asset.
  publicId: string;
};

// Cloudinary folder images are stored under.
const FOLDER = config.CLOUDINARY_IMAGE_FOLDER;
// Cloudinary resource kind for images.
const RESOURCE_TYPE = "image" as const;
// Allowed image content types.
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

/** Encode an uploaded File as a base64 data URI Cloudinary can ingest. */
const toDataUri = async (file: File): Promise<string> => {
  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString("base64")}`;
};

/**
 * Upload an image File to Cloudinary. Returns the full delivery URL (persist
 * this) and the asset's public_id.
 */
export const uploadImage = async (file: File): Promise<TUploadedImage> => {
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error("Uploaded file must be an image");
  }
  const result = await cloudinary.uploader.upload(await toDataUri(file), {
    folder: FOLDER,
    resource_type: RESOURCE_TYPE,
  });
  return { url: result.secure_url, publicId: result.public_id };
};

/**
 * Replace an existing image with a new File.
 * Uploads the new file, then removes the old one by its stored URL.
 */
export const replaceImage = async (
  oldUrl: string,
  file: File,
): Promise<TUploadedImage> => {
  const uploaded = await uploadImage(file);
  if (oldUrl) {
    await deleteImage(oldUrl);
  }
  return uploaded;
};

/**
 * Delete an image by its stored Cloudinary delivery URL.
 * Returns true once the asset is gone (whether removed now or already absent).
 */
export const deleteImage = async (url: string): Promise<boolean> => {
  if (!url) {
    return false;
  }
  const publicId = publicIdFromUrl(url, RESOURCE_TYPE);
  if (!publicId) {
    return false;
  }
  await cloudinary.uploader.destroy(publicId, {
    resource_type: RESOURCE_TYPE,
  });
  return true;
};
