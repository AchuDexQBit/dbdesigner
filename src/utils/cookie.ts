function stripCookieQuotes(value: string): string {
  const t = value.trim();
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    return t.slice(1, -1).trim();
  }
  return t;
}

/** Read a cookie value by name (first match). Decodes URI-encoded values. */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  for (const segment of document.cookie.split(";")) {
    const s = segment.trim();
    if (!s.startsWith(prefix)) continue;
    const raw = s.slice(prefix.length);
    let decoded: string;
    try {
      decoded = decodeURIComponent(raw.replace(/\+/g, " "));
    } catch {
      decoded = raw;
    }
    const v = stripCookieQuotes(decoded).trim();
    return v.length ? v : null;
  }
  return null;
}
