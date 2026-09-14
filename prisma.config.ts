import "dotenv/config";
import { defineConfig } from "prisma/config";
import { resolverDatabaseUrl, usaPostgres } from "./src/lib/database-url";

// O banco é descoberto sozinho (ver src/lib/database-url.ts): PostgreSQL na Railway usa o
// schema/migrations gerados em prisma/postgres; em desenvolvimento, SQLite.
const url = resolverDatabaseUrl();
const dir = usaPostgres() ? "prisma/postgres" : "prisma";

export default defineConfig({
  schema: `${dir}/schema.prisma`,
  migrations: {
    path: `${dir}/migrations`,
    seed: "tsx prisma/seed.ts",
  },
  datasource: { url },
});
