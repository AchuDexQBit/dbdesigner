/**
 * Base URL for API calls.
 *
 * - If `VITE_API_BASE_URL` starts with `/`, it is used as a same-origin path.
 * - If it is an absolute `http(s)` URL and its **origin differs** from the page,
 *   the browser uses only that URL’s **pathname** (e.g. `/app`) on the **current**
 *   origin so requests are not cross-origin (avoids CORS). Nginx (prod) or Vite
 *   (dev) must proxy that path to the real API host.
 * - Set `VITE_API_CROSS_ORIGIN=true` to always use the full absolute URL (needs
 *   working CORS on the API).
 */
export function getApiBaseUrl(): string {
  const raw = (import.meta.env.VITE_API_BASE_URL ?? "").trim();
  const trimmed = raw.replace(/\/+$/, "");

  if (!trimmed) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  const forceCrossOrigin =
    import.meta.env.VITE_API_CROSS_ORIGIN === "true" ||
    import.meta.env.VITE_API_CROSS_ORIGIN === "1";

  if (forceCrossOrigin || !/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (typeof window === "undefined") {
    return trimmed;
  }

  try {
    const apiUrl = new URL(trimmed);
    if (apiUrl.origin === window.location.origin) {
      return trimmed;
    }
    const path = apiUrl.pathname.replace(/\/+$/, "") || "";
    if (path && path !== "/") {
      return path;
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}

function dexiVersion(): string {
  return (import.meta.env.VITE_DEXI_VERSION ?? "").trim();
}

/**
 * Headers for API calls: same rules as `fetch` in `client.ts`.
 * GET/HEAD with no body and empty `VITE_DEXI_VERSION` → no `Content-Type`, no `version`
 * (browser “simple” request, no OPTIONS preflight).
 */
export function buildApiHeaders(
  method: string,
  hasBody: boolean,
): Record<string, string> {
  const v = dexiVersion();
  const headers: Record<string, string> = {};
  const simpleRead =
    (method === "GET" || method === "HEAD") && !hasBody && !v;
  if (!simpleRead) {
    headers["Content-Type"] = "application/json";
  }
  if (v) {
    headers.version = v;
  }
  return headers;
}
