import { randomUUID } from "node:crypto";
import config from "../../config";
import { cloudinary, publicIdFromUrl } from "./client";

export type TUploadedPdf = {
  // Full Cloudinary delivery URL — persist this; it is the handle for
  // replace/delete.
  url: string;
  // Cloudinary public_id of the stored asset.
  publicId: string;
};

// Cloudinary folder PDFs are stored under.
const FOLDER = config.CLOUDINARY_PDF_FOLDER;
// Cloudinary resource kind for PDFs. "raw" stores the file as-is (extension
// included in the public_id) rather than treating it as an image.
const RESOURCE_TYPE = "raw" as const;

/** Encode an uploaded File as a base64 data URI Cloudinary can ingest. */
const toDataUri = async (file: File): Promise<string> => {
  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString("base64")}`;
};

/**
 * Upload a PDF File to Cloudinary. Returns the full delivery URL (persist this)
 * and the asset's public_id.
 */
export const uploadPdf = async (file: File): Promise<TUploadedPdf> => {
  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    throw new Error("Uploaded file must be a PDF");
  }
  const result = await cloudinary.uploader.upload(await toDataUri(file), {
    folder: FOLDER,
    resource_type: RESOURCE_TYPE,
    // Data URIs carry no filename, so Cloudinary would otherwise mint a random
    // public_id with no extension — and for "raw" assets the extension lives in
    // the public_id, so the delivery URL (and any download) would lack ".pdf".
    // Give it an explicit, unique public_id ending in ".pdf".
    public_id: `${randomUUID()}.pdf`,
  });
  return { url: result.secure_url, publicId: result.public_id };
};

/**
 * Replace an existing PDF with a new File.
 * Uploads the new file, then removes the old one by its stored URL.
 */
export const replacePdf = async (
  oldUrl: string,
  file: File,
): Promise<TUploadedPdf> => {
  const uploaded = await uploadPdf(file);
  if (oldUrl) {
    await deletePdf(oldUrl);
  }
  return uploaded;
};

/**
 * Delete a PDF by its stored Cloudinary delivery URL.
 * Returns true once the asset is gone (whether removed now or already absent).
 */
export const deletePdf = async (url: string): Promise<boolean> => {
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
