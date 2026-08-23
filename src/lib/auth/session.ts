import "server-only";
import { cookies, headers } from "next/headers";
import { randomBytes, createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { RoleName } from "@/generated/prisma/client";

/**
 * RÈGLE (Partie 4 §20, Partie 8 §25, Partie 12 §33-34) :
 * - La session est gérée côté serveur, jamais dans localStorage.
 * - Le cookie est HttpOnly + Secure + SameSite=Lax.
 * - Seul un hash du token de session est stocké en base (jamais le
 *   token en clair), à l'image des tokens QR.
 */

const SESSION_COOKIE_NAME = "cfe_session";
const SESSION_TTL_DAYS = 14;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export type SessionUser = {
  id: string;
  email: string;
  role: RoleName;
  mustChangePassword: boolean;
  isActive: boolean;
  profile: {
    id: string;
    displayName: string;
    profileSlug: string;
  } | null;
};

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  const hdrs = await headers();
  const userAgent = hdrs.get("user-agent") ?? undefined;
  // Derrière un proxy/CDN, l'IP réelle est généralement transmise via
  // x-forwarded-for. En l'absence de proxy connu, on la laisse vide
  // plutôt que de faire confiance à un en-tête falsifiable.
  const forwardedFor = hdrs.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0]?.trim();

  await prisma.session.create({
    data: {
      userId,
      sessionTokenHash: tokenHash,
      expiresAt,
      userAgent,
      ipAddress,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const session = await prisma.session.findUnique({
    where: { sessionTokenHash: tokenHash },
    include: {
      user: {
        include: {
          role: true,
          profile: {
            select: { id: true, displayName: true, profileSlug: true },
          },
        },
      },
    },
  });

  if (!session || session.revokedAt || session.expiresAt < new Date()) {
    return null;
  }

  if (!session.user.isActive) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role.name,
    mustChangePassword: session.user.mustChangePassword,
    isActive: session.user.isActive,
    profile: session.user.profile,
  };
}

export async function destroyCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    const tokenHash = hashToken(token);
    await prisma.session.updateMany({
      where: { sessionTokenHash: tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/** Révoque toutes les sessions actives d'un utilisateur (Partie 4 §21, §115). */
export async function revokeAllSessionsForUser(userId: string): Promise<void> {
  await prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
