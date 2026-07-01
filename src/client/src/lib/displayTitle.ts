/**
 * Dashboard display label for a bilingual title. Shows both languages when
 * present, otherwise whichever exists; never blank.
 */
export function displayTitle(
  bn: string | null | undefined,
  en: string | null | undefined,
): string {
  return [bn, en].filter(Boolean).join("  •  ") || "(untitled)";
}
