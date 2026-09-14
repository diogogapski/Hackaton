import { prisma } from "@/src/lib/db";
import { badRequest, notFound } from "@/src/lib/http";

export async function exigirJurado(userId: string) {
  const jurado = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, papel: true, situacao: true } });
  if (!jurado) throw notFound("Jurado não encontrado");
  if (jurado.papel !== "JURADO" || jurado.situacao !== "ATIVO") throw badRequest("Usuário não é um jurado ativo");
  return jurado;
}

/** Atribuição manual; ignora pares já existentes. */
export async function atribuirProjetos(juradoId: string, projetoIds: string[]) {
  await exigirJurado(juradoId);

  const projetos = await prisma.projeto.findMany({
    where: { id: { in: projetoIds }, situacao: "ENVIADO" },
    select: { id: true },
  });
  if (projetos.length !== new Set(projetoIds).size) throw badRequest("Todos os projetos precisam existir e estar enviados");

  const existentes = await prisma.avaliacaoAtribuicao.findMany({
    where: { juradoId, projetoId: { in: projetoIds } },
    select: { projetoId: true },
  });
  const jaTem = new Set(existentes.map((e) => e.projetoId));
  const novos = projetos.filter((p) => !jaTem.has(p.id));

  await prisma.$transaction(novos.map((p) => prisma.avaliacaoAtribuicao.create({ data: { juradoId, projetoId: p.id } })));
  return { criadas: novos.length, ignoradas: jaTem.size };
}

/**
 * Distribuição automática: completa cada projeto enviado até `juradosPorProjeto`
 * (configurado no Hackathon), escolhendo sempre os jurados com menor carga.
 */
export async function distribuirAutomaticamente(hackathonId: string) {
  const hackathon = await prisma.hackathon.findUniqueOrThrow({ where: { id: hackathonId } });
  const [jurados, projetos, atribuicoes] = await Promise.all([
    prisma.user.findMany({ where: { papel: "JURADO", situacao: "ATIVO" }, select: { id: true } }),
    prisma.projeto.findMany({ where: { hackathonId, situacao: "ENVIADO" }, select: { id: true }, orderBy: { enviadoEm: "asc" } }),
    prisma.avaliacaoAtribuicao.findMany({ where: { projeto: { hackathonId } }, select: { juradoId: true, projetoId: true } }),
  ]);
  if (jurados.length === 0) throw badRequest("Nenhum jurado ativo cadastrado");

  const carga = new Map(jurados.map((j) => [j.id, 0]));
  const porProjeto = new Map<string, Set<string>>(projetos.map((p) => [p.id, new Set()]));
  for (const a of atribuicoes) {
    if (carga.has(a.juradoId)) carga.set(a.juradoId, carga.get(a.juradoId)! + 1);
    porProjeto.get(a.projetoId)?.add(a.juradoId);
  }

  const novas: { juradoId: string; projetoId: string }[] = [];
  for (const { id: projetoId } of projetos) {
    const atuais = porProjeto.get(projetoId)!;
    const faltam = Math.min(hackathon.juradosPorProjeto, jurados.length) - atuais.size;
    if (faltam <= 0) continue;

    const escolhidos = [...carga.entries()]
      .filter(([juradoId]) => !atuais.has(juradoId))
      .sort((a, b) => a[1] - b[1])
      .slice(0, faltam);

    for (const [juradoId] of escolhidos) {
      novas.push({ juradoId, projetoId });
      carga.set(juradoId, carga.get(juradoId)! + 1);
      atuais.add(juradoId);
    }
  }

  await prisma.$transaction(novas.map((data) => prisma.avaliacaoAtribuicao.create({ data })));
  return {
    criadas: novas.length,
    juradosPorProjeto: hackathon.juradosPorProjeto,
    avisoJuradosInsuficientes: jurados.length < hackathon.juradosPorProjeto,
  };
}
