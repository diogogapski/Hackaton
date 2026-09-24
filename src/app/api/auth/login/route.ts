import { prisma } from "@/src/lib/db";
import { HttpError, parseBody, route, unauthorized } from "@/src/lib/http";
import { hashPassword, verifyPassword } from "@/src/lib/auth/password";
import { createSession } from "@/src/lib/auth/session";
import { clientIp, exigirDentroDoLimite, rateLimitKey, registrarTentativa } from "@/src/lib/auth/rate-limit";
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
    default: {
      // Login único (sem vínculo): o mesmo campo aceita matrícula, SIAPE ou CPF.
      const digitos = onlyDigits(identificador);
      const ou: object[] = [{ matricula: identificador }, { siape: identificador }];
      if (digitos.length === 11) ou.push({ cpf: digitos });
      return { OR: ou };
    }
  }
}

export const POST = route(async (request) => {
  const { identificador, vinculo, senha } = await parseBody(request, loginSchema);

  const ip = clientIp(request);
  const conta = rateLimitKey(identificador);
  await Promise.all([exigirDentroDoLimite("login", ip), exigirDentroDoLimite("login-conta", conta)]);

  // Matrícula, SIAPE e CPF são únicos cada um, mas um número pode coincidir entre campos de pessoas
  // diferentes: nesse caso vale a conta cuja senha confere.
  const candidatos = await prisma.user.findMany({ where: whereDoIdentificador(identificador, vinculo), take: 3 });
  let user = candidatos[0] ?? null;
  let senhaOk = false;
  if (candidatos.length === 0) {
    await verifyPassword(senha, await dummyHash);
  } else {
    for (const candidato of candidatos) {
      if (await verifyPassword(senha, candidato.senhaHash)) {
        user = candidato;
        senhaOk = true;
        break;
      }
    }
  }

  // Egresso e externo usam o mesmo acesso por CPF (planejamento: /login/externo).
  const grupo = (v: string) => (v === "EGRESSO" ? "EXTERNO" : v);
  const vinculoConfere = !vinculo || identificador.includes("@") || (user && grupo(user.vinculo) === grupo(vinculo));

  if (!user || !senhaOk || !vinculoConfere) {
    await Promise.all([registrarTentativa("login", ip), registrarTentativa("login-conta", conta)]);
    throw unauthorized("Credenciais inválidas");
  }
  if (user.situacao !== "ATIVO") throw new HttpError(403, "Conta bloqueada");
  if (!user.emailVerificadoEm) throw new HttpError(403, "Confirme seu e-mail antes de entrar");

  await createSession(user.id);

  const publicUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: publicUserSelect });
  return Response.json({ user: publicUser });
});
