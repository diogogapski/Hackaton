import { test } from "node:test";
import assert from "node:assert/strict";
import { resolverDatabaseUrl, usaPostgres } from "./database-url";

test("DATABASE_URL tem prioridade", () => {
  const env = { DATABASE_URL: "postgresql://a@h/db", DATABASE_PUBLIC_URL: "postgresql://b@h/db" };
  assert.equal(resolverDatabaseUrl(env), "postgresql://a@h/db");
  assert.equal(usaPostgres(env), true);
});

test("usa DATABASE_PRIVATE_URL / DATABASE_PUBLIC_URL quando falta DATABASE_URL", () => {
  assert.equal(resolverDatabaseUrl({ DATABASE_PUBLIC_URL: "postgresql://b@h/db" }), "postgresql://b@h/db");
  assert.equal(resolverDatabaseUrl({ DATABASE_PRIVATE_URL: "postgresql://c@h/db" }), "postgresql://c@h/db");
});

test("monta a URL a partir das variáveis PG* da Railway", () => {
  const env = { PGHOST: "postgres.railway.internal", PGPORT: "5432", PGUSER: "postgres", PGPASSWORD: "s@nh#a", PGDATABASE: "railway" };
  assert.equal(resolverDatabaseUrl(env), "postgresql://postgres:s%40nh%23a@postgres.railway.internal:5432/railway");
});

test("sem nada: SQLite local; na Railway sem URL ainda escolhe PostgreSQL", () => {
  assert.equal(resolverDatabaseUrl({}), "file:./prisma/dev.db");
  assert.equal(usaPostgres({}), false);
  assert.equal(usaPostgres({ RAILWAY_ENVIRONMENT: "production" }), true);
  assert.equal(usaPostgres({ RAILWAY_ENVIRONMENT: "production", DATABASE_URL: "file:./x.db" }), false);
});
