import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Depuis Prisma ORM 7, ce fichier remplace le bloc `datasource { url }`
 * de schema.prisma pour tout ce qui concerne la CLI (generate, migrate,
 * studio, db seed). Il n'est jamais utilisé à l'exécution par
 * l'application elle-même — voir src/lib/prisma.ts, qui construit son
 * propre adaptateur à partir de DATABASE_URL.
 *
 * Sur Neon (ou tout hébergeur avec pooler de connexions), les
 * migrations ont besoin d'une connexion DIRECTE : on utilise donc ici
 * DIRECT_URL plutôt que DATABASE_URL (qui, lui, peut être l'URL
 * "-pooler" utilisée par l'application).
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
