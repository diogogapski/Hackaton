import { parseBody, route } from "@/src/lib/http";
import { registerExternoSchema } from "@/src/server/identidade/schemas";
import { registrarUsuario } from "@/src/server/identidade/registro";
import { clientIp, exigirDentroDoLimite, registrarTentativa } from "@/src/lib/auth/rate-limit";

export const POST = route(async (request) => {
  const dados = await parseBody(request, registerExternoSchema);
  const ip = clientIp(request);
  await exigirDentroDoLimite("cadastro", ip);
  await registrarTentativa("cadastro", ip);
  const user = await registrarUsuario(dados);
  return Response.json({ user, verificacaoPendente: true }, { status: 201 });
});
