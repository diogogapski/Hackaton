/**
 * Mantém o schema/migrations de PostgreSQL (produção, Railway) derivados do
 * schema principal `prisma/schema.prisma` (SQLite, desenvolvimento).
 *
 *   node scripts/prisma-postgres.mjs          # sincroniza e cria migration se mudou
 *   node scripts/prisma-postgres.mjs --check  # falha se estiver desatualizado (roda no build)
 *
 * Não precisa de um Postgres rodando: a migration é gerada com `prisma migrate diff`.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ORIGEM = "prisma/schema.prisma";
const DESTINO_DIR = "prisma/postgres";
const DESTINO = `${DESTINO_DIR}/schema.prisma`;
const MIGRATIONS = `${DESTINO_DIR}/migrations`;

function gerarSchemaPostgres() {
  const origem = readFileSync(ORIGEM, "utf8").replace(/\r\n/g, "\n");
  const trocado = origem
    .replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"')
    .replace('output   = "../src/generated/prisma"', 'output   = "../../src/generated/prisma"');

  if (!trocado.includes('provider = "postgresql"') || !trocado.includes("../../src/generated/prisma")) {
    throw new Error(`Não foi possível adaptar ${ORIGEM} (provider/output mudaram de formato?)`);
  }
  return `// ARQUIVO GERADO por scripts/prisma-postgres.mjs — edite prisma/schema.prisma.\n\n${trocado}`;
}

const novo = gerarSchemaPostgres();
const atual = existsSync(DESTINO) ? readFileSync(DESTINO, "utf8").replace(/\r\n/g, "\n") : null;

if (process.argv.includes("--check")) {
  if (atual !== novo) {
    console.error(`${DESTINO} está desatualizado. Rode: npm run db:pg:sync`);
    process.exit(1);
  }
  console.log(`${DESTINO} em dia.`);
  process.exit(0);
}

if (atual === novo) {
  console.log("Schema PostgreSQL já está em dia; nenhuma migration criada.");
  process.exit(0);
}

const temp = mkdtempSync(join(tmpdir(), "hackif-pg-"));
const novoPath = join(temp, "schema.prisma");
writeFileSync(novoPath, novo);

const from = atual ? `--from-schema "${DESTINO}"` : "--from-empty";
const sql = execSync(`npx prisma migrate diff ${from} --to-schema "${novoPath}" --script`, {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "inherit"],
});

mkdirSync(MIGRATIONS, { recursive: true });
writeFileSync(DESTINO, novo);
writeFileSync(`${MIGRATIONS}/migration_lock.toml`, 'provider = "postgresql"\n');

if (sql.trim() && !sql.includes("empty migration")) {
  const nome = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : "atualizacao";
  const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
  const dir = `${MIGRATIONS}/${stamp}_${nome}`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/migration.sql`, sql);
  console.log(`Migration PostgreSQL criada: ${dir}`);
} else {
  console.log("Schema atualizado sem mudanças de banco.");
}
