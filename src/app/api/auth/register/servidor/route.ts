import { parseBody, route } from "@/src/lib/http";
import { registerServidorSchema } from "@/src/server/identidade/schemas";
import { registrarUsuario } from "@/src/server/identidade/registro";

export const POST = route(async (request) => {
  const dados = await parseBody(request, registerServidorSchema);
  const user = await registrarUsuario({ ...dados, vinculo: "SERVIDOR" });
  return Response.json({ user }, { status: 201 });
});
