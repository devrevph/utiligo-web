/** Only allow same-origin app paths as post-login redirects (no `//evil.com`). */
export function safeNextPath(raw: string | null | undefined, fallback = "/home"): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  return raw;
}

export function nextPathFromLocation(fallback = "/home"): string {
  if (typeof window === "undefined") return fallback;
  return safeNextPath(new URLSearchParams(window.location.search).get("next"), fallback);
}
