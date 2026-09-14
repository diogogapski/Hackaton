import { prisma } from "@/src/lib/db";
import { usaPostgres } from "@/src/lib/database-url";

/**
 * Healthcheck da Railway: 200 só se o banco estiver acessível. Também diz, sem expor segredos, se as
 * tabelas existem — ajuda a diagnosticar migrations que não rodaram ou client gerado para o banco errado.
 */
export async function GET() {
  const banco = usaPostgres() ? "postgresql" : "sqlite";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    return Response.json({ ok: false, banco, conexao: false }, { status: 503 });
  }
  try {
    const [usuarios, edicoes] = await Promise.all([prisma.user.count(), prisma.hackathon.count()]);
    return Response.json({ ok: true, banco, conexao: true, tabelas: true, usuarios, edicoes });
  } catch (error) {
    const codigo = (error as { code?: string }).code ?? (error instanceof Error ? error.name : "desconhecido");
    return Response.json({ ok: true, banco, conexao: true, tabelas: false, erro: codigo });
  }
}
