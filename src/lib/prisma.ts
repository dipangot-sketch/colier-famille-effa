import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Singleton du client Prisma.
 *
 * Depuis Prisma ORM 7, un adaptateur de driver est obligatoire pour
 * toutes les bases de données (Partie 12 §2 : stack technique).
 * DATABASE_URL peut être une URL "poolée" (ex. Neon "-pooler") : c'est
 * l'application qui l'utilise à l'exécution, contrairement à
 * DIRECT_URL, réservée aux migrations (voir prisma.config.ts).
 *
 * En développement, Next.js recharge les modules à chaud (HMR), ce qui
 * créerait une nouvelle instance de PrismaClient (et donc un nouveau
 * pool de connexions) à chaque changement de fichier si elle n'était
 * pas mise en cache sur `globalThis`.
 */

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
