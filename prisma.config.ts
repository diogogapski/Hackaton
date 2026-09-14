import "dotenv/config";
import { defineConfig } from "prisma/config";

// DATABASE_URL decide o banco: postgres://... (Railway) usa o schema/migrations
// gerados em prisma/postgres; qualquer outra (file:...) usa SQLite.
const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const dir = url.startsWith("postgres") ? "prisma/postgres" : "prisma";

export default defineConfig({
  schema: `${dir}/schema.prisma`,
  migrations: {
    path: `${dir}/migrations`,
    seed: "tsx prisma/seed.ts",
  },
  datasource: { url },
});
