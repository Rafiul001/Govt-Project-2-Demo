import { deleteImage } from "./cloudinary/imageUpload";

/** The image-bearing columns of a page row. */
type TPageImageSource = {
  bannerImage: string | null;
  contentBn: string | null;
  contentEn: string | null;
};

// Markdown image: ![alt](url "title") — captures the URL up to whitespace or
// the closing paren, tolerating an optional <angle-bracketed> URL and title.
const MD_IMAGE = /!\[[^\]]*\]\(\s*<?([^\s)>]+)>?(?:\s+["'][^"']*["'])?\s*\)/g;
// Inline HTML image: <img src="url">.
const HTML_IMAGE = /<img\b[^>]*\bsrc=["']([^"']+)["']/gi;

/** Only assets we host are deletable; leave foreign URLs alone. */
const isCloudinaryUrl = (url: string) =>
  url.startsWith("https://res.cloudinary.com/");

/** Extract every image URL referenced in a markdown document. */
export function extractMarkdownImageUrls(markdown: string): string[] {
  const urls: string[] = [];
  for (const pattern of [MD_IMAGE, HTML_IMAGE]) {
    for (const match of markdown.matchAll(pattern)) {
      if (match[1]) {
        urls.push(match[1]);
      }
    }
  }
  return urls;
}

/** Every Cloudinary image a page references: banner + both markdown bodies. */
export function collectPageImageUrls(page: TPageImageSource): string[] {
  const urls = new Set<string>();
  if (page.bannerImage) {
    urls.add(page.bannerImage);
  }
  for (const markdown of [page.contentBn, page.contentEn]) {
    for (const url of extractMarkdownImageUrls(markdown ?? "")) {
      urls.add(url);
    }
  }
  return [...urls].filter(isCloudinaryUrl);
}

/**
 * Delete every Cloudinary image referenced by the given (already deleted)
 * pages. Failures are tolerated per-image so one stale asset cannot fail the
 * request that removed the rows.
 */
export async function deletePageImages(
  pages: TPageImageSource[],
): Promise<void> {
  const urls = new Set(pages.flatMap(collectPageImageUrls));
  await Promise.allSettled([...urls].map((url) => deleteImage(url)));
}
