import { API_BASE_URL } from "./api-base-url";
import { getFirebaseAuth } from "./firebase";

export { API_BASE_URL };

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Nest's ValidationPipe sends `message` as a string[] (one entry per failed
 * field) — flatten it so callers can always show `error.message` directly.
 */
function messageFromBody(body: string, fallback: string): string {
  try {
    const parsed = JSON.parse(body) as { message?: unknown };
    const raw = parsed.message;
    if (typeof raw === "string" && raw.trim()) return raw;
    if (Array.isArray(raw)) {
      const joined = raw.filter((m) => typeof m === "string").join("\n");
      if (joined) return joined;
    }
  } catch {
    // not JSON — fall through to the raw text
  }
  return body.trim() || fallback;
}

/** Firebase refreshes the ID token itself (~hourly), so read it per request instead of caching it. */
export async function getIdToken(forceRefresh = false): Promise<string | null> {
  const user = getFirebaseAuth().currentUser;
  return user ? user.getIdToken(forceRefresh) : null;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = await getIdToken();
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Can't reach Utiligo right now. Check your connection and try again.", 0);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ApiError(messageFromBody(text, res.statusText || "Request failed"), res.status);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};

export function errorMessage(err: unknown, fallback: string): string {
  const e = err as { code?: string; message?: unknown };
  if (e?.code === "auth/too-many-requests") {
    return "Too many attempts — please wait a bit before trying again.";
  }
  if (e?.code === "auth/network-request-failed") {
    return "Can't reach the sign-in service. Check your connection and try again.";
  }
  if (typeof e?.message === "string" && e.message.trim()) return e.message;
  return fallback;
}
