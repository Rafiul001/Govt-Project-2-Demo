/** Trims a string and collapses blank/whitespace-only values to null. */
export function emptyToNull(value?: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/**
 * Picks the slug source from a bilingual title, preferring English (ASCII
 * slugs) and falling back to Bangla. Empty when neither is set.
 */
export function slugSource(
  titleEn?: string | null,
  titleBn?: string | null,
): string {
  return emptyToNull(titleEn) ?? emptyToNull(titleBn) ?? "";
}
