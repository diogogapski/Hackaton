import { z } from "zod";
import { prisma } from "@/src/lib/db";
import { conflict, parseBody, route } from "@/src/lib/http";
import { publicUserSelect, requireRole } from "@/src/lib/auth";
import { createToken, hashPassword } from "@/src/lib/auth/password";
import { randomBytes } from "node:crypto";

const VALIDADE_DIAS = 7;

const convidarSchema = z.object({
  nome: z.string().trim().min(2).max(120),
  email: z.email().transform((v) => v.trim().toLowerCase()),
  vinculo: z.enum(["SERVIDOR", "EGRESSO", "EXTERNO"]).default("EXTERNO"),
});

/**
 * Cadastro de jurado pela comissão (planejamento p.26 "cadastrar/autorizar jurados"; canvas: "como jurados
 * recebem acesso?"). Cria a conta com papel JURADO e senha inutilizável e devolve um link de definição de
 * senha válido por 7 dias, que a comissão envia ao jurado pelo canal que preferir (não há envio de e-mail).
 * `termosAceitosEm` fica nulo: não há tela de aceite para contas convidadas.
 */
export const POST = route(async (request) => {
  await requireRole("ADMIN");
  const { nome, email, vinculo } = await parseBody(request, convidarSchema);

  const existente = await prisma.user.findUnique({ where: { email }, select: { id: true, papel: true } });
  if (existente) {
    throw conflict(
      existente.papel === "JURADO"
        ? "Já existe um jurado com este e-mail"
        : "Já existe uma conta com este e-mail: autorize-a como jurado em vez de convidar",
    );
  }

  const { token, tokenHash } = createToken();
  const user = await prisma.user.create({
    data: {
      nome,
      email,
      vinculo,
      papel: "JURADO",
      senhaHash: await hashPassword(randomBytes(32).toString("base64url")),
      passwordResets: { create: { tokenHash, expiraEm: new Date(Date.now() + VALIDADE_DIAS * 864e5) } },
    },
    select: publicUserSelect,
  });

  const base = process.env.APP_URL ?? new URL(request.url).origin;
  return Response.json(
    { jurado: user, linkDefinirSenha: `${base}/redefinir-senha?token=${token}`, expiraEmDias: VALIDADE_DIAS },
    { status: 201 },
  );
});
