/**
 * Finds image references inside markdown that need rescuing after a paste.
 *
 * Content pasted from other sites/documents keeps its original image sources:
 * remote URLs (which may be hotlink-blocked or vanish), inline `data:` URIs,
 * session-local `blob:` URLs, or local file paths that only exist on the
 * author's machine. The editor imports what it can into Cloudinary and warns
 * about what it can't — this module only classifies, it does not fetch.
 */

/** Hostname of our own image CDN — such srcs are already safe to keep. */
const CLOUDINARY_HOST = "res.cloudinary.com";

/** Every image src in the markdown: `![…](src)` plus inline `<img src>`. */
export function extractImageSrcs(markdown: string): string[] {
  const srcs = new Set<string>();
  // Markdown image, optionally with a "title" after the src. Data URIs contain
  // no whitespace or parens, so stopping at those is safe for all src kinds.
  for (const match of markdown.matchAll(
    /!\[[^\]]*\]\(\s*([^()\s]+)(?:\s+"[^"]*")?\s*\)/g,
  )) {
    srcs.add(match[1]);
  }
  // The editor serializes resized images as inline HTML.
  for (const match of markdown.matchAll(
    /<img\b[^>]*\bsrc=["']([^"']+)["']/gi,
  )) {
    srcs.add(match[1]);
  }
  return [...srcs];
}

/**
 * Extracts embedded raster images from clipboard RTF, in document order.
 *
 * Desktop word processors (LibreOffice, Word) copy mixed text+image content as
 * HTML whose <img> srcs point at temp files on the author's machine — but the
 * same clipboard's RTF flavor carries the actual image bytes, hex-encoded in
 * `{\pict … \jpegblip|\pngblip … <hex>}` groups. Those bytes are the only
 * recoverable copy of the images, so the editor pairs them with the dead
 * `file://` srcs by position. Vector duplicates (`\wmetafile`, `\emfblip`) are
 * ignored — writers emit them only as legacy fallbacks for the same picture.
 */
export function extractRtfImages(rtf: string): File[] {
  const files: File[] = [];
  const blipRe = /\\(jpegblip|pngblip)/g;

  for (let match = blipRe.exec(rtf); match; match = blipRe.exec(rtf)) {
    const type = match[1] === "jpegblip" ? "image/jpeg" : "image/png";
    const ext = match[1] === "jpegblip" ? "jpg" : "png";
    let hex = "";

    // Walk the rest of the \pict group: skip control words ("\picw120") and
    // nested groups ("{\*\picprop …}"), accumulate the bare hex payload.
    let i = blipRe.lastIndex;
    while (i < rtf.length && rtf[i] !== "}") {
      const ch = rtf[i];
      if (ch === "\\") {
        i += 1;
        while (i < rtf.length && /[a-z0-9-]/i.test(rtf[i])) i += 1;
        if (rtf[i] === " ") i += 1;
      } else if (ch === "{") {
        let depth = 1;
        i += 1;
        while (i < rtf.length && depth > 0) {
          if (rtf[i] === "{") depth += 1;
          else if (rtf[i] === "}") depth -= 1;
          i += 1;
        }
      } else if (/[0-9a-fA-F]/.test(ch)) {
        hex += ch;
        i += 1;
      } else {
        i += 1; // whitespace/newlines inside the payload
      }
    }
    blipRe.lastIndex = i;

    if (hex.length >= 16 && hex.length % 2 === 0) {
      const bytes = new Uint8Array(hex.length / 2);
      for (let j = 0; j < bytes.length; j += 1) {
        bytes[j] = parseInt(hex.slice(j * 2, j * 2 + 2), 16);
      }
      files.push(new File([bytes], `pasted-image.${ext}`, { type }));
    }
  }

  return files;
}

export type TImageSrcTriage = {
  /** Importable server-side: external http(s) URLs and inline data URIs. */
  importable: string[];
  /** Fetchable only in this browser session; upload client-side. */
  blobs: string[];
  /** Unreachable from anywhere but the author's machine (file:// etc.). */
  unreachable: string[];
};

/** Sorts image srcs by how (or whether) they can be brought into Cloudinary. */
export function triageImageSrcs(srcs: string[]): TImageSrcTriage {
  const triage: TImageSrcTriage = {
    importable: [],
    blobs: [],
    unreachable: [],
  };

  for (const src of srcs) {
    if (/^https?:\/\//i.test(src) || src.startsWith("//")) {
      if (!src.includes(`//${CLOUDINARY_HOST}/`)) {
        triage.importable.push(src);
      }
    } else if (src.startsWith("data:image/")) {
      triage.importable.push(src);
    } else if (src.startsWith("blob:")) {
      triage.blobs.push(src);
    } else {
      // file:// URLs and bare relative paths point at the author's machine or
      // the source document's host — nothing on our side can retrieve them.
      triage.unreachable.push(src);
    }
  }

  return triage;
}
