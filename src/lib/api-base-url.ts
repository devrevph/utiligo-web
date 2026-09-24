const DEFAULT_API_BASE_URL = "https://utiligo-api-production.up.railway.app";

/**
 * NEXT_PUBLIC_UTILIGO_API_BASE_URL, normalized. A value without a scheme
 * (e.g. "api.example.com") would otherwise be treated by fetch as a path on
 * this site and silently 404 against the Next server.
 */
export const API_BASE_URL = (() => {
  const raw = process.env.NEXT_PUBLIC_UTILIGO_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withScheme.replace(/\/+$/, "");
})();
