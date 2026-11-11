// Small fetch wrapper used by client components.
export interface ApiResult<T> {
  ok: boolean;
  status: number;
  data: T & { error?: string; fields?: Record<string, string> };
}

export async function apiRequest<T = Record<string, unknown>>(
  url: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
  body?: unknown,
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch {
    return {
      ok: false,
      status: 0,
      data: { error: "Network error – please check your connection." } as T & { error: string },
    };
  }
}
