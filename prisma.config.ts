import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // We use a dummy fallback so `npx prisma generate` doesn't crash during Docker Build (when ENV is not passed yet)
    url: process.env["DATABASE_URL"] || "postgresql://dummy:dummy@dummy:5432/dummy",
  },
});
