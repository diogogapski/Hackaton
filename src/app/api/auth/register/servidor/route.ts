import { parseBody, route } from "@/src/lib/http";
import { registerServidorSchema } from "@/src/server/identidade/schemas";
import { registrarUsuario } from "@/src/server/identidade/registro";
import { clientIp, exigirDentroDoLimite, registrarTentativa } from "@/src/lib/auth/rate-limit";

export const POST = route(async (request) => {
  const dados = await parseBody(request, registerServidorSchema);
  const ip = clientIp(request);
  await exigirDentroDoLimite("cadastro", ip);
  await registrarTentativa("cadastro", ip);
  const user = await registrarUsuario({ ...dados, vinculo: "SERVIDOR" });
  return Response.json({ user, verificacaoPendente: true }, { status: 201 });
});
