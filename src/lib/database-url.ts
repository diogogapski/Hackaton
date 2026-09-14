/**
 * Descobre a URL do banco sem configuração manual. Usado pelo app (src/lib/db.ts) e pelo Prisma CLI
 * (prisma.config.ts), por isso não importa nada.
 *
 * Ordem: DATABASE_URL → DATABASE_PRIVATE_URL → DATABASE_PUBLIC_URL → variáveis PG* (PGHOST, PGUSER…,
 * como a Railway expõe) → SQLite local em desenvolvimento.
 */
export function resolverDatabaseUrl(env: Record<string, string | undefined> = process.env): string {
  const direta = env.DATABASE_URL || env.DATABASE_PRIVATE_URL || env.DATABASE_PUBLIC_URL || env.POSTGRES_URL;
  if (direta) return direta;

  if (env.PGHOST && env.PGUSER) {
    const senha = env.PGPASSWORD ? `:${encodeURIComponent(env.PGPASSWORD)}` : "";
    return `postgresql://${encodeURIComponent(env.PGUSER)}${senha}@${env.PGHOST}:${env.PGPORT || "5432"}/${env.PGDATABASE || env.PGUSER}`;
  }

  return "file:./prisma/dev.db";
}

/** Na Railway (ou com NODE_ENV=production) o banco é sempre PostgreSQL, mesmo se a URL só existir em runtime. */
export function usaPostgres(env: Record<string, string | undefined> = process.env): boolean {
  const url = resolverDatabaseUrl(env);
  if (url.startsWith("postgres")) return true;
  const semUrl = !env.DATABASE_URL;
  return semUrl && Boolean(env.RAILWAY_ENVIRONMENT || env.RAILWAY_ENVIRONMENT_NAME || env.RAILWAY_PROJECT_ID);
}
