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

/**
 * Na Railway ou em produção sem URL, o banco é sempre PostgreSQL — mesmo que a URL só exista em runtime
 * (o client do Prisma é gerado no build e precisa já sair para PostgreSQL). SQLite só com `file:` explícito
 * ou em desenvolvimento.
 */
export function usaPostgres(env: Record<string, string | undefined> = process.env): boolean {
  const url = resolverDatabaseUrl(env);
  if (url.startsWith("postgres")) return true;
  if (env.DATABASE_URL) return false;
  return Boolean(env.RAILWAY_ENVIRONMENT || env.RAILWAY_ENVIRONMENT_NAME || env.RAILWAY_PROJECT_ID || env.RAILWAY_SERVICE_ID || env.NODE_ENV === "production");
}
