import { parseBody, route } from "@/src/lib/http";
import { registerAlunoSchema } from "@/src/server/identidade/schemas";
import { registrarUsuario } from "@/src/server/identidade/registro";
import { clientIp, exigirDentroDoLimite, registrarTentativa } from "@/src/lib/auth/rate-limit";

export const POST = route(async (request) => {
  const dados = await parseBody(request, registerAlunoSchema);
  const ip = clientIp(request);
  await exigirDentroDoLimite("cadastro", ip);
  await registrarTentativa("cadastro", ip);
  const user = await registrarUsuario({ ...dados, vinculo: "ALUNO" });
  return Response.json({ user, verificacaoPendente: true }, { status: 201 });
});
