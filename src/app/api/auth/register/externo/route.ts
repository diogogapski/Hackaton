import { parseBody, route } from "@/src/lib/http";
import { registerExternoSchema } from "@/src/server/identidade/schemas";
import { registrarUsuario } from "@/src/server/identidade/registro";

export const POST = route(async (request) => {
  const dados = await parseBody(request, registerExternoSchema);
  const user = await registrarUsuario(dados);
  return Response.json({ user }, { status: 201 });
});
