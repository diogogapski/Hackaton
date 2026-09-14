import { notFound, route } from "@/src/lib/http";
import { getHackathonAtual, inscricoesAbertas, submissaoAberta } from "@/src/server/hackathon/atual";

export const GET = route(async () => {
  const hackathon = await getHackathonAtual();
  if (!hackathon) throw notFound("Nenhuma edição disponível");

  return Response.json({
    hackathon: {
      ...hackathon,
      inscricoesAbertas: inscricoesAbertas(hackathon),
      submissaoAberta: submissaoAberta(hackathon),
    },
  });
});
