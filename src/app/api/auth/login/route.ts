import { prisma } from "@/src/lib/db";
import { HttpError, parseBody, route, unauthorized } from "@/src/lib/http";
import { hashPassword, verifyPassword } from "@/src/lib/auth/password";
import { createSession } from "@/src/lib/auth/session";
import { clientIp, exigirDentroDoLimite, registrarTentativa } from "@/src/lib/auth/rate-limit";
import { publicUserSelect } from "@/src/lib/auth";
import { loginSchema, onlyDigits } from "@/src/server/identidade/schemas";

// Hash fixo para comparar mesmo quando o usuário não existe (tempo de resposta uniforme).
const dummyHash = hashPassword("usuario-inexistente");

function whereDoIdentificador(identificador: string, vinculo?: string) {
  if (identificador.includes("@")) return { email: identificador.toLowerCase() };
  switch (vinculo) {
    case "ALUNO":
      return { matricula: identificador };
    case "SERVIDOR":
      return { siape: identificador };
    case "EGRESSO":
    case "EXTERNO":
      return { cpf: onlyDigits(identificador) };
    default:
      return null;
  }
}

export const POST = route(async (request) => {
  const { identificador, vinculo, senha } = await parseBody(request, loginSchema);

  const ip = clientIp(request);
  await exigirDentroDoLimite("login", ip);

  const where = whereDoIdentificador(identificador, vinculo);
  const user = where ? await prisma.user.findFirst({ where }) : null;
  const senhaOk = await verifyPassword(senha, user?.senhaHash ?? (await dummyHash));

  if (!user || !senhaOk || (vinculo && !identificador.includes("@") && user.vinculo !== vinculo)) {
    await registrarTentativa("login", ip);
    throw unauthorized("Credenciais inválidas");
  }
  if (user.situacao !== "ATIVO") throw new HttpError(403, "Conta bloqueada");

  await createSession(user.id);

  const publicUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: publicUserSelect });
  return Response.json({ user: publicUser });
});
