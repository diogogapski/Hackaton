import { z, ZodError, type ZodType } from "zod";
import { Prisma } from "@/src/generated/prisma/client";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export const badRequest = (msg: string, details?: unknown) => new HttpError(400, msg, details);
export const unauthorized = (msg = "Não autenticado") => new HttpError(401, msg);
export const forbidden = (msg = "Sem permissão") => new HttpError(403, msg);
export const notFound = (msg = "Não encontrado") => new HttpError(404, msg);
export const conflict = (msg: string) => new HttpError(409, msg);

type Handler<C> = (request: Request, context: C) => Promise<Response>;

const METODOS_QUE_ALTERAM = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Defesa contra CSRF (além do cookie SameSite=Lax): requisições que alteram dados vindas de
 * navegador precisam ter `Origin` igual ao host da aplicação. Clientes sem `Origin`
 * (curl, testes, apps) passam — eles não carregam o cookie da vítima.
 */
export function origemPermitida(request: Request) {
  if (!METODOS_QUE_ALTERAM.has(request.method)) return true;
  const origin = request.headers.get("origin");
  if (!origin) return true;

  let hostOrigem: string;
  try {
    hostOrigem = new URL(origin).host;
  } catch {
    return false;
  }
  const hosts = [
    request.headers.get("x-forwarded-host"),
    request.headers.get("host"),
    process.env.APP_URL ? new URL(process.env.APP_URL).host : null,
  ];
  return hosts.some((h) => h?.split(",")[0].trim() === hostOrigem);
}

/**
 * Envolve um Route Handler convertendo HttpError, ZodError e erros conhecidos
 * do Prisma em respostas JSON padronizadas: `{ error, details? }`.
 */
export function route<C = unknown>(handler: Handler<C>): Handler<C> {
  return async (request, context) => {
    try {
      if (!origemPermitida(request)) throw new HttpError(403, "Origem da requisição não permitida");
      return await handler(request, context);
    } catch (error) {
      if (error instanceof HttpError) {
        return Response.json(
          { error: error.message, details: error.details },
          { status: error.status },
        );
      }
      if (error instanceof ZodError) {
        return Response.json(
          { error: "Dados inválidos", details: z.flattenError(error) },
          { status: 400 },
        );
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return Response.json(
            { error: "Registro duplicado", details: error.meta },
            { status: 409 },
          );
        }
        if (error.code === "P2025") {
          return Response.json({ error: "Não encontrado" }, { status: 404 });
        }
      }
      console.error(error);
      return Response.json({ error: "Erro interno" }, { status: 500 });
    }
  };
}

export async function parseBody<T>(request: Request, schema: ZodType<T>): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw badRequest("JSON inválido");
  }
  return schema.parse(body);
}

export function parseQuery<T>(request: Request, schema: ZodType<T>): T {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  return schema.parse(params);
}
