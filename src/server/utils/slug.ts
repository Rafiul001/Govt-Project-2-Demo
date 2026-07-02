/**
 * URL-slug helpers for menus and sub-menus.
 *
 * Slugs are derived from the (possibly Bengali) title and form the path
 * segments of a page URL (`/:menuSlug/:submenuSlug`). Unicode letters/numbers
 * are kept (so a Bengali title yields a Bengali slug, percent-encoded in the
 * URL); everything else collapses to hyphens.
 */

/** Turns a title into a URL slug, or "" when it has no slug-able characters. */
export function slugify(input: string): string {
  return input
    .normalize("NFKC")
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Builds a slug from `title` that is unique within its scope, appending `-2`,
 * `-3`, … until `exists` reports the candidate is free. `exists` runs the
 * scope-specific uniqueness check (per branch for menus, per menu for
 * sub-menus). Falls back to "page" when the title has no slug-able characters.
 */
export async function uniqueSlug(
  title: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const root = slugify(title) || "page";
  let candidate = root;
  let n = 2;
  while (await exists(candidate)) {
    candidate = `${root}-${n++}`;
  }
  return candidate;
}
