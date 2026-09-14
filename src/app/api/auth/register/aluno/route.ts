import { parseBody, route } from "@/src/lib/http";
import { registerAlunoSchema } from "@/src/server/identidade/schemas";
import { registrarUsuario } from "@/src/server/identidade/registro";

export const POST = route(async (request) => {
  const dados = await parseBody(request, registerAlunoSchema);
  const user = await registrarUsuario({ ...dados, vinculo: "ALUNO" });
  return Response.json({ user }, { status: 201 });
});
