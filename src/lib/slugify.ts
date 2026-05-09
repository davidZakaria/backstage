/**
 * ASCII URL slug from a label (uses English title for best results).
 */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

/**
 * URL slug from an optional explicit value or {@link slugify} of `fallbackLabel`.
 * Returns null if the result is empty (e.g. Arabic-only label with no explicit slug).
 */
export function finalizeSlug(
  explicit: string | undefined | null,
  fallbackLabel: string,
): string | null {
  const slugRaw = (explicit?.trim() || slugify(fallbackLabel)).replace(/^-+|-+$/g, "");
  return slugRaw || null;
}
