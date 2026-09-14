import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/src/generated/prisma/client";

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não definida");

  // O adapter segue a URL; o `provider` do schema.prisma precisa combinar com ela.
  const adapter = url.startsWith("postgres")
    ? new PrismaPg({ connectionString: url })
    : new PrismaBetterSqlite3({ url });

  return new PrismaClient({ adapter });
}

const usaPostgres = (process.env.DATABASE_URL ?? "").startsWith("postgres");

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
