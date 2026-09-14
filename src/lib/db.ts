import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/src/generated/prisma/client";
import { resolverDatabaseUrl, usaPostgres as detectarPostgres } from "@/src/lib/database-url";

function createClient() {
  const url = resolverDatabaseUrl();
  // Sem URL no build da Railway: não quebra a importação; as consultas avisam se o banco não estiver conectado.
  const semUrlPostgres = usaPostgres && !url.startsWith("postgres");
  if (semUrlPostgres && process.env.NEXT_PHASE !== "phase-production-build") {
    console.warn("[db] PostgreSQL não encontrado: conecte o serviço Postgres ao app (variável DATABASE_URL)");
  }

  // O adapter segue a URL; o `provider` do schema.prisma precisa combinar com ela.
  const adapter = usaPostgres
    ? new PrismaPg({ connectionString: semUrlPostgres ? undefined : url })
    : new PrismaBetterSqlite3({ url });

  return new PrismaClient({ adapter });
}

const usaPostgres = detectarPostgres();

/**
 * Filtro "contém" sem diferenciar maiúsculas nos dois bancos: o SQLite já ignora
 * maiúsculas no LIKE; no PostgreSQL é preciso `mode: "insensitive"` (inexistente no
 * client SQLite, por isso o cast).
 */
export function contem(texto: string) {
  return (usaPostgres ? { contains: texto, mode: "insensitive" } : { contains: texto }) as { contains: string };
}

// Reaproveita a instância entre hot reloads do `next dev`.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
