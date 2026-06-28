import { v2 as cloudinary } from "cloudinary";
import config from "../../config";

// Configure the shared Cloudinary client once at module load. The SDK parses
// credentials from the CLOUDINARY_URL env var; reading config here ensures it is
// present (requireEnv throws otherwise). Both the image and PDF upload services
// import this configured instance.
void config.CLOUDINARY_URL;
cloudinary.config({ secure: true });

/** Cloudinary resource kinds used by this app. */
export type TResourceType = "image" | "raw";

/**
 * Derive a Cloudinary public_id from a previously stored delivery URL.
 * URLs look like:
 *   https://res.cloudinary.com/<cloud>/<type>/upload/v123/<folder>/<name>.<ext>
 * The public_id is everything after the optional version segment. For "image"
 * resources the file extension is dropped (Cloudinary stores it without one);
 * for "raw" resources (PDFs) the extension is part of the public_id.
 */
export const publicIdFromUrl = (
  url: string,
  resourceType: TResourceType,
): string | null => {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
  if (!match) {
    return null;
  }
  const path = match[1];
  if (path === undefined) {
    return null;
  }
  return resourceType === "raw" ? path : path.replace(/\.[^/.]+$/, "");
};

export { cloudinary };
