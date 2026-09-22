// Trims, collapses internal whitespace, and lowercases a string for
// case-insensitive, whitespace-insensitive comparison. Returns undefined for
// empty/absent input so "unset" compares equal to "unset" (not to "").
export function normalizeText(value?: string | null): string | undefined {
  if (!value) return undefined;
  const collapsed = value.trim().replace(/\s+/g, " ");
  return collapsed ? collapsed.toLowerCase() : undefined;
}
