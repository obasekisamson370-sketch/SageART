const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(v: string): boolean {
  return UUID_RE.test(v);
}

/**
 * Parse a comma-separated `ids` param into a safe, de-duplicated, capped list of
 * UUIDs. Anything that isn't a valid UUID is dropped (PRD §6.4) so a hand-crafted
 * URL can never trigger an unbounded or malformed query.
 */
export function parseIdList(raw: string | undefined, cap = 30): string[] {
  if (!raw) return [];
  const seen = new Set<string>();
  for (const part of raw.split(",")) {
    const id = part.trim().toLowerCase();
    if (isUuid(id)) seen.add(id);
    if (seen.size >= cap) break;
  }
  return [...seen];
}
