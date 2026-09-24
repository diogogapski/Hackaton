import { parseBody, route } from "@/src/lib/http";
import { clientIp, exigirDentroDoLimite, registrarTentativa } from "@/src/lib/auth/rate-limit";
import { verificarEmailSchema } from "@/src/server/identidade/schemas";
import { confirmarEmail } from "@/src/server/identidade/verificacao-email";

export const POST = route(async (request) => {
  const { token } = await parseBody(request, verificarEmailSchema);
  const ip = clientIp(request);
  await exigirDentroDoLimite("confirmar-email", ip);
  await registrarTentativa("confirmar-email", ip);
  const resultado = await confirmarEmail(token);
  return Response.json({ ok: true, ...resultado });
});
