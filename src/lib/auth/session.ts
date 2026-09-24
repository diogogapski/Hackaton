import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "hackif_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

let chave: Uint8Array | undefined;

function secret() {
  if (chave) return chave;
  let value = process.env.AUTH_SECRET?.trim();
  if (!value && process.env.NODE_ENV !== "production") {
    value = "hackif-desenvolvimento-local-nao-usar-em-producao";
  }
  if (!value) throw new Error("AUTH_SECRET é obrigatória em produção");
  const exemplos = [
    "troque-este-valor",
    "gere-uma-chave-aleatoria-com-pelo-menos-32-caracteres",
    "hackif-desenvolvimento-local-nao-usar-em-producao",
  ];
  if (process.env.NODE_ENV === "production" && (value.length < 32 || exemplos.includes(value))) {
    throw new Error("AUTH_SECRET precisa ter pelo menos 32 caracteres e não pode ser o valor de exemplo");
  }
  chave = new TextEncoder().encode(value);
  return chave;
}

export async function createSession(userId: string) {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secret());

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Lê o cookie de sessão: id do usuário e instante de emissão (segundos), ou null se ausente/inválido. */
export async function readSession(): Promise<{ userId: string; emitidaEm: number } | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (!payload.sub || typeof payload.iat !== "number") return null;
    return { userId: payload.sub, emitidaEm: payload.iat };
  } catch {
    return null;
  }
}

/** Marco para invalidar sessões anteriores. Arredonda para o segundo (resolução do `iat` do JWT). */
export const inicioNovasSessoes = () => new Date(Math.floor(Date.now() / 1000) * 1000);
