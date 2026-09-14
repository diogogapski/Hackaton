// Cliente HTTP usado pelos componentes do navegador.

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

/** fetch para a API interna. Lança ApiError com a mensagem `{ error }` do backend. */
export async function api<T = unknown>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(path, {
    method: options.method ?? "GET",
    headers: options.body === undefined ? undefined : { "content-type": "application/json" },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, json?.error ?? `Erro ${res.status}`, json?.details);
  return json as T;
}

/** Transforma `details` do backend (lista, flattenError do Zod) em linhas legíveis. */
export function detalhesDoErro(error: unknown): string[] {
  if (!(error instanceof ApiError) || !error.details) return [];
  const d = error.details as { formErrors?: string[]; fieldErrors?: Record<string, string[]> } | string[];
  if (Array.isArray(d)) return d.map(String);
  return [
    ...(d.formErrors ?? []),
    ...Object.entries(d.fieldErrors ?? {}).map(([campo, erros]) => `${campo}: ${erros.join(", ")}`),
  ];
}

export const comHackathon = (path: string, hackathonId?: string | null) =>
  hackathonId ? `${path}${path.includes("?") ? "&" : "?"}hackathonId=${encodeURIComponent(hackathonId)}` : path;
