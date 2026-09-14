import { prisma } from "@/src/lib/db";
import { parseBody, parseQuery, route } from "@/src/lib/http";
import { hackathonIdQuerySchema, projetoCreateSchema, projetoUpdateSchema } from "@/src/server/hackathon/schemas";
import {
  camposDeEnvio,
  contextoProjeto,
  garantirProjeto,
  garantirSemProjeto,
  validarEscrita,
} from "@/src/server/projetos/service";

/** Projeto da equipe do usuário logado na edição atual (ou `?hackathonId=`). */
export const GET = route(async (request) => {
  const { hackathonId } = parseQuery(request, hackathonIdQuerySchema);
  const { projeto, equipe } = await contextoProjeto(hackathonId);
  return Response.json({ projeto, equipe: equipe && { id: equipe.id, nome: equipe.nome, situacao: equipe.situacao } });
});

export const POST = route(async (request) => {
  const { hackathonId } = parseQuery(request, hackathonIdQuerySchema);
  const { enviar, ...dados } = await parseBody(request, projetoCreateSchema);
  const ctx = await contextoProjeto(hackathonId);

  await garantirSemProjeto(ctx);
  await validarEscrita(ctx, { desafioId: dados.desafioId, enviar });

  const projeto = await prisma.projeto.create({
    data: {
      ...dados,
      teamId: ctx.equipe!.id,
      hackathonId: ctx.hackathon.id,
      ...camposDeEnvio(enviar, null),
    },
  });
  return Response.json({ projeto }, { status: 201 });
});

export const PUT = route(async (request) => {
  const { hackathonId } = parseQuery(request, hackathonIdQuerySchema);
  const { enviar, ...dados } = await parseBody(request, projetoUpdateSchema);
  const ctx = await contextoProjeto(hackathonId);

  const atual = garantirProjeto(ctx);
  await validarEscrita(ctx, { desafioId: dados.desafioId, enviar });

  const projeto = await prisma.projeto.update({
    where: { id: atual.id },
    data: { ...dados, ...camposDeEnvio(enviar, atual.enviadoEm) },
  });
  return Response.json({ projeto });
});
