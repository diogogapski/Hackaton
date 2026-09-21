import { prisma } from "@/src/lib/db";

/**
 * Healthcheck da Railway: 200 só se o banco e as tabelas essenciais estiverem acessíveis.
 * A resposta pública é propositalmente mínima para não expor detalhes da infraestrutura.
 */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    return Response.json({ ok: false }, { status: 503 });
  }
  try {
    await Promise.all([prisma.user.count(), prisma.hackathon.count()]);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 503 });
  }
}
